import React from 'react'
import { Map } from 'immutable'
import { ContentState, EditorState, SelectionState } from 'draft-js'
import Prism from 'prismjs'
import Immutable from 'immutable'
import { ContentBlock } from 'draft-js'
import { setSelectionBlockData } from '../../utils/content'
import './index.scss';
import "prismjs/themes/prism-tomorrow.min.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.min.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.min.js";
import PrismDecorator from './codeDecorator'

type CodeBlockWrapperProps = {
    syntaxs: any[];
    editorState: EditorState;
    onChange: Function;
    showLineNumber: boolean;
    children?: any;
}
type CodeState = {
    syntaxName: string;
    syntax: any;
}
export class CodeBlockWrapper extends React.Component<CodeBlockWrapperProps, CodeState> {

    constructor (props: CodeBlockWrapperProps) {
        super(props)
        this.state = {
          syntax: props.syntaxs[0].syntax,
          syntaxName: props.syntaxs[0].name,
        }
    }

    codeBlockBlockKey: string | null = null
    codeBlockBlock: ContentBlock | null = null;

    componentDidMount () {
        this.codeBlockBlock = this.getCodeBlockBlock(this.props)
        this.getCodeBlockSyntax(this.props)
    }

    getCodeBlockBlock (props: CodeBlockWrapperProps) {

        try {
            // @ts-ignore
            const offsetKey = props['data-offset-key']
            const blockKey = offsetKey.split('-')[0]
            const contentState = props.editorState.getCurrentContent()
        
            this.codeBlockBlockKey = blockKey

            return contentState.getBlockForKey(blockKey)
    
        } catch (error) {
            console.warn(error)
            return null
        }
    }

    getCodeBlockSyntax (props: CodeBlockWrapperProps) {

        if (this.codeBlockBlock) {
    
          const blockData = this.codeBlockBlock.getData()
          const syntax = blockData.get('syntax') || props.syntaxs[0].syntax
          const syntaxName = props.syntaxs.find(item => item.syntax === syntax).name
    
          if (!syntaxName) {
            return false
          }
    
          this.setState({ syntax, syntaxName })
    
        }
    }    

    setCodeBlockSyntax = (event: React.MouseEvent<HTMLLIElement>) => {

        const syntax = event.currentTarget.dataset.syntax
    
        if (!syntax) {
          return false
        }
    
        try {
          const syntaxName = this.props.syntaxs.find(item => item.syntax === syntax).name
    
          if (!syntaxName) {
            return false
          }
    
          const selectionState = SelectionState.createEmpty(this.codeBlockBlockKey!)
          const editorState = EditorState.forceSelection(this.props.editorState, selectionState)
    
          this.setState({ syntax, syntaxName }, () => {
            this.props.onChange(setSelectionBlockData(editorState, Immutable.Map({syntax: syntax})))
          })
    
        } catch (error) {
          console.warn(error)
        }
    }

    render () {
        console.log(this.state.syntax, "--s---")
        return (
            <div className="richEditor-code-block-wrapper">
              <div className="richEditor-code-block-header" contentEditable={false}>
                <div className="syntax-switcher">
                  <span>{this.state.syntaxName}</span>
                  <ul className="syntax-list">
                    {this.props.syntaxs.map((item, index) => <li key={index} data-syntax={item.syntax} onClick={this.setCodeBlockSyntax}>{item.name}</li>)}
                  </ul>
                </div>
              </div>
              <pre className={`toolbar richEditor-code-block${this.props.showLineNumber ? ' show-line-number' : ''}`} data-syntax={this.state.syntax}>{this.props.children}</pre>
            </div>
        )
    }
}

const getCodeBlockBlock = (block: ContentBlock) => {

    if (!block || !block.getType || block.getType() !== 'code-block') {
      return null
    }
  
    const blockDOMNode = document.querySelector(`code[data-offset-key="${block.getKey()}-0-0"]`)
  
    if (!blockDOMNode) {
      return null
    }
    // @ts-ignore
    if (blockDOMNode.parentNode.nodeName.toLowerCase() !== 'pre') {
      return null
    }
    // @ts-ignore
    return blockDOMNode.parentNode.dataset.syntax
}

export const syntaxs = [
    {
      name: 'JavaScript',
      syntax: 'javascript'
    }, {
      name: 'HTML',
      syntax: 'html'
    }, {
      name: 'CSS',
      syntax: 'css'
    }
];

export const PrismDe = new PrismDecorator({
    prism: Prism,
    getSyntax: getCodeBlockBlock,
    defaultSyntax: syntaxs[0].syntax
})

export const exporter = (contentState: ContentState, block: any) => {

        if (block.type.toLowerCase() !== 'code-block') {
          return null
        }

        const previousBlock = contentState.getBlockBefore(block.key)
        const nextBlock = contentState.getBlockAfter(block.key)
        const previousBlockType = previousBlock && previousBlock.getType()
        const nextBlockType = nextBlock && nextBlock.getType()
        const syntax = block.data.syntax || syntaxs[0].syntax

        let start = ''
        let end = ''

        if (previousBlockType !== 'code-block') {
          start = `<pre data-lang="${syntax}" class="lang-${syntax}"><code class="lang-${syntax}">`
        } else {
          start = ''
        }

        if (nextBlockType !== 'code-block') {
          end = '</code></pre>'
        } else {
          end = '<br/>'
        }

        return { start, end }
}

export const importer = (nodeName: any, node: any) => {

    if (nodeName.toLowerCase() === 'pre') {

      try {

        const syntax = node.dataset.lang
        node.innerHTML = node.innerHTML.replace(/<code(.*?)>/g, '').replace(/<\/code>/g, '')

        return syntax ? {
          type: 'code-block',
          data: { syntax }
        } : null

      } catch (error) {
        return null
      }

    }

    return null

  }