import { ContentState, EditorState, convertToRaw, convertFromRaw, RawDraftContentState, DraftDecoratorType } from 'draft-js'
import { convertToHTML, convertFromHTML } from 'draft-convert'
import { fontFamilies } from '../components/fontFamily/fontFamily'
import { getDecorators } from '../renderers';
import { namedColors } from '../components/colorPicker/colorPicker';
import { tableExportFn, tableImportFn } from '../components/table/convert';

const defaultConvertOptions = {
  fontFamilies: fontFamilies
}
const ignoredNodeAttributes = ['style']
const ignoredEntityNodeAttributes = ['style', 'href', 'target', 'alt', 'title', 'id', 'controls', 'autoplay', 'loop', 'poster']
export const blocks: {[Key: string]: string} = {
  'header-one': 'h1',
  'header-two': 'h2',
  'header-three': 'h3',
  'header-four': 'h4',
  'header-five': 'h5',
  'header-six': 'h6',
  'unstyled': 'p',
  'blockquote': 'blockquote'
}
const blockTypes = Object.keys(blocks)
const blockNames = blockTypes.map(key => blocks[key])

const defaultUnitImportFn = (unit: string) => unit.replace('px', '')
const defaultUnitExportFn = (unit: string) => unit + 'px';
const getStyleValue = (style: string) => style.split('-')[1];
const spreadNodeAttributes = (attributesObject: any) => {
  return Object.keys(attributesObject).reduce((attributeString, attributeName) => {
    return `${attributeString} ${attributeName}="${attributesObject[attributeName]}"`
  }, '').replace(/^\s$/, '')
};

const convertAtomicBlock = (block: any, contentState: ContentState, blockNodeAttributes: any) => {

  if (!block || !block.key) {
    return <p></p>
  }

  const contentBlock = contentState.getBlockForKey(block.key)

  let { class: className, ...nodeAttrAsProps } = blockNodeAttributes
  nodeAttrAsProps.className = className

  if (!contentBlock) {
    return <p></p>
  }

  const entityKey = contentBlock.getEntityAt(0)

  if (!entityKey) {
    return <p></p>
  }

  const entity = contentState.getEntity(entityKey)
  const mediaType = entity.getType().toLowerCase()

  let { float, alignment } = block.data
  let { url, link, link_target, width, height, meta } = entity.getData()

  if (mediaType === 'image') {

    let imageWrapStyle = {}
    let styledClassName = ''

    if (float) {
      // @ts-ignore
      imageWrapStyle.float = float
      styledClassName += ' float-' + float
    } else if (alignment) {
      // @ts-ignore
      imageWrapStyle.textAlign = alignment
      styledClassName += ' align-' + alignment
    }

    if (link) {
      return (
        <div className={"media-wrap image-wrap" + styledClassName} style={imageWrapStyle}>
          <a style={{display:'inline-block'}} href={link} target={link_target}>
            <img {...nodeAttrAsProps} {...meta} src={url} width={width} height={height} style={{width, height}} />
          </a>
        </div>
      )
    } else {
      return (
        <div className={"media-wrap image-wrap" + styledClassName} style={imageWrapStyle}>
          <img {...nodeAttrAsProps} {...meta} src={url} width={width} height={height} style={{width, height}}/>
        </div>
      )
    }

  } else if (mediaType === 'audio') {
    return <div className="media-wrap audio-wrap"><audio controls {...nodeAttrAsProps} {...meta} src={url} /></div>
  } else if (mediaType === 'video') {
    return <div className="media-wrap video-wrap"><video controls {...nodeAttrAsProps} {...meta} src={url} width={width} height={height} /></div>
  } else if (mediaType === 'embed') {
    return <div className="media-wrap embed-wrap"><div dangerouslySetInnerHTML={{__html: url}}/></div>
  } else if (mediaType === 'hr') {
    return <hr></hr>
  } else {
    return <p></p>
  }
}

// @ts-ignore
const styleToHTML = (options: any) => {
  function f(style: string) {
    const unitExportFn = options.unitExportFn || defaultUnitExportFn
  
    if (options.styleExportFn) {
      const customOutput = options.styleExportFn(style, options)
      if (customOutput) {
        return customOutput
      }
    }
  
    style = style.toLowerCase()
    
    if (style === 'strikethrough') {
      return <span style={{textDecoration: 'line-through'}}/>
    } else if (style === 'superscript') {
      return <sup/>
    } else if (style === 'subscript') {
      return <sub/>
    } else if (style.indexOf('color-') === 0) {
      return <span style={{color: '#' + getStyleValue(style)}}/>
    } else if (style.indexOf('bgcolor-') === 0) {
      return <span style={{backgroundColor: '#' + getStyleValue(style)}}/>
    } else if (style.indexOf('fontsize-') === 0) {
      return <span style={{fontSize: unitExportFn(getStyleValue(style), 'font-size', 'html')}}/>
    } else if (style.indexOf('lineheight-') === 0) {
      return <span style={{lineHeight: unitExportFn(getStyleValue(style), 'line-height', 'html')}}/> 
    } else if (style.indexOf('letterspacing-') === 0) {
      return <span style={{letterSpacing: unitExportFn(getStyleValue(style), 'letter-spacing', 'html')}}/>
    } else if (style.indexOf('fontfamily-') === 0) {
      let fontFamily = fontFamilies.find((item) => item.name.toLowerCase() === getStyleValue(style))
      if (!fontFamily) return
      return <span style={{fontFamily: fontFamily.family}}/>
    }
  }
  return f;
}

const entityToHTML = (options: any) => {
  function f(entity: any, originalText: any) {

    const { entityExportFn } = options
    const entityType = entity.type.toLowerCase()

    if (entityExportFn) {
      const customOutput = entityExportFn(entity, originalText)
      if (customOutput) {
        return customOutput
      }
    }

    if (entityType === 'link') {
      return <a href={entity.data.href} target={entity.data.target} className='re-link' />
    }
  }
  return f;
}

const blockToHTML = (options: any) => (block: any) => {

  const { blockExportFn, contentState } = options

  if (blockExportFn) {
    const customOutput = blockExportFn(contentState, block)
    if (customOutput) {
      return customOutput
    }
  }

  let blockStyle = ''

  const blockType = block.type.toLowerCase()

  const { textAlign, textIndent, nodeAttributes = {} } = block.data

  const attributeString = spreadNodeAttributes(nodeAttributes)

  if (textAlign || textIndent) {

    blockStyle = ' style="'

    if (textAlign) {
      blockStyle += `text-align:${textAlign};`
    }

    if (textIndent && !isNaN(textIndent) && textIndent > 0) {
      blockStyle += `text-indent:${textIndent * 2}em;`
    }

    blockStyle += '"'

  }

  if (blockType === 'atomic') {
    return convertAtomicBlock(block, contentState, nodeAttributes)
  } else if (blockType === 'code-block') {

    const previousBlock = contentState.getBlockBefore(block.key)
    const nextBlock = contentState.getBlockAfter(block.key)
    const previousBlockType = previousBlock && previousBlock.getType()
    const nextBlockType = nextBlock && nextBlock.getType()

    let start = ''
    let end = ''

    if (previousBlockType !== 'code-block') {
      start = `<pre${attributeString}><code>`
    } else {
      start = ''
    }

    if (nextBlockType !== 'code-block') {
      end = '</code></pre>'
    } else {
      end = '<br/>'
    }

    return { start, end }

  } else if (blocks[blockType]) {
    return {
      start: `<${blocks[blockType]}${blockStyle}${attributeString}>`,
      end: `</${blocks[blockType]}>`
    }
  } else if (blockType === 'unordered-list-item') {
    return {
      start: `<li${blockStyle}${attributeString}>`,
      end: '</li>',
      nest: <ul/>
    }
  } else if (blockType === 'ordered-list-item') {
    return {
      start: `<li${blockStyle}${attributeString}>`,
      end: '</li>',
      nest: <ol/>
    }
  } else if (blockType === 'table-cell') {
    return  tableExportFn(blockStyle)(contentState, block);
  }
}

export const getToHTMLConfig = (options: any) => {

    return {
      styleToHTML: styleToHTML(options),
      entityToHTML: entityToHTML(options),
      blockToHTML: blockToHTML(options)
    }
}

export const getHexColor = (color: string) => {

  color = color.replace('color:', '').replace(';', '').replace(' ', '')

  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(color)) {
    return color
  } else if (namedColors[color]) {
    return namedColors[color]
  } else if (color.indexOf('rgb') === 0) {

    let rgbArray = color.split(',')
    let convertedColor = rgbArray.length < 3 ? null : '#' + [rgbArray[0], rgbArray[1], rgbArray[2]].map(x => {
      const hex = parseInt(x.replace(/\D/g, ''), 10).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')

    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(convertedColor!) ? convertedColor : null

  } else {
    return null
  }

}

const htmlToStyle = (options: any, source: any) => (nodeName: string, node: any, currentStyle: any) => {

  if (!node || !node.style) {
    return currentStyle
  }

  const unitImportFn = options.unitImportFn || defaultUnitImportFn
  let newStyle = currentStyle;

  [].forEach.call(node.style, (style) => {

    if (nodeName === 'span' && style === 'color') {
      let color = getHexColor(node.style.color)
      newStyle = color ? newStyle.add('COLOR-' + color.replace('#', '').toUpperCase()) : newStyle
    } else if (nodeName === 'span' && style === 'background-color') {
      let color = getHexColor(node.style.backgroundColor)
      newStyle = color ? newStyle.add('BGCOLOR-' + color.replace('#', '').toUpperCase()) : newStyle
    } else if (nodeName === 'span' && style === 'font-size') {
      newStyle = newStyle.add('FONTSIZE-' + unitImportFn(node.style.fontSize, 'font-size', source))
    } else if (nodeName === 'span' && style === 'line-height' && !isNaN(parseFloat(node.style.lineHeight))) {
      newStyle = newStyle.add('LINEHEIGHT-' + unitImportFn(node.style.lineHeight, 'line-height', source))
    } else if (nodeName === 'span' && style === 'letter-spacing' && !isNaN(parseFloat(node.style.letterSpacing))) {
      newStyle = newStyle.add('LETTERSPACING-' + unitImportFn(node.style.letterSpacing, 'letter-spacing', source))
    } else if (nodeName === 'span' && style === 'text-decoration') {
      if (node.style.textDecoration === 'line-through') {
        newStyle = newStyle.add('STRIKETHROUGH')
      } else if (node.style.textDecoration === 'underline') {
        newStyle = newStyle.add('UNDERLINE')
      }
    } else if (nodeName === 'span' && style === 'font-family') {
      let fontFamily = options.fontFamilies.find((item: any) => item.family.toLowerCase() === node.style.fontFamily.toLowerCase())
      if (!fontFamily) return;
      newStyle = newStyle.add('FONTFAMILY-' + fontFamily.name.toUpperCase())
    }

  })

  if (nodeName === 'sup') {
    newStyle = newStyle.add('SUPERSCRIPT')
  } else if (nodeName === 'sub') {
    newStyle = newStyle.add('SUBSCRIPT')
  }

  options.styleImportFn && (newStyle = options.styleImportFn(nodeName, node, newStyle, source) || newStyle)
  return newStyle

}

const htmlToEntity = (options: any, source: any) => (nodeName: string, node: any, createEntity: any) => {

  nodeName = nodeName.toLowerCase()

  const { alt, title, id, controls, autoplay, loop, poster } = node
  let meta: any = {}
  let nodeAttributes: any = {}

  id && (meta.id = id)
  alt && (meta.alt = alt)
  title && (meta.title = title)
  controls && (meta.controls = controls)
  autoplay && (meta.autoPlay = autoplay)
  loop && (meta.loop = loop)
  poster && (meta.poster = poster)

  node.attributes && Object.keys(node.attributes).forEach((key) => {
    let attr = node.attributes[key]
    ignoredEntityNodeAttributes.indexOf(attr.name) === -1 && (nodeAttributes[attr.name] = attr.value);
  })

  if (nodeName === 'a' && !node.querySelectorAll('img').length) {
    let href = node.getAttribute('href')
    let target = node.getAttribute('target')
    return createEntity('LINK', 'MUTABLE', { href, target, nodeAttributes })
  } else if (nodeName === 'audio') {
    return createEntity('AUDIO', 'IMMUTABLE',{ url: node.getAttribute('src'), meta, nodeAttributes }) 
  } else if (nodeName === 'video') {
    return createEntity('VIDEO', 'IMMUTABLE',{ url: node.getAttribute('src'), meta, nodeAttributes }) 
  } else if (nodeName === 'img') {

    let parentNode = node.parentNode
    let entityData: any = { meta }
    let { width, height } = node.style

    entityData.url = node.getAttribute('src')
    width && (entityData.width = width)
    height && (entityData.height = height)

    if (parentNode.nodeName.toLowerCase() === 'a') {
      entityData.link = parentNode.getAttribute('href')
      entityData.link_target = parentNode.getAttribute('target')
    }

    return createEntity('IMAGE', 'IMMUTABLE', entityData) 

  } else if (nodeName === 'hr') {
    return createEntity('HR', 'IMMUTABLE', {}) 
  } else if (node.parentNode && node.parentNode.classList.contains('embed-wrap')) {

    const embedContent = node.innerHTML || node.outerHTML

    if (embedContent) {
      return createEntity('EMBED', 'IMMUTABLE', {
        url: embedContent
      })   
    }

  }
}

const htmlToBlock = (options: any, source: any) => (nodeName: string, node: any) => {

  let nodeAttributes: any = {}
  let nodeStyle = node.style || {}

  node.attributes && Object.keys(node.attributes).forEach((key) => {
    let attr = node.attributes[key]
    ignoredNodeAttributes.indexOf(attr.name) === -1 && (nodeAttributes[attr.name] = attr.value);
  })

  if (node.classList && node.classList.contains('media-wrap')) {

    return {
      type: 'atomic',
      data: {
        nodeAttributes: nodeAttributes,
        float: nodeStyle.float,
        alignment: nodeStyle.textAlign
      }
    }

  } else if (nodeName === 'img') {

    return {
      type: 'atomic',
      data: {
        nodeAttributes: nodeAttributes,
        float: nodeStyle.float,
        alignment: nodeStyle.textAlign
      }
    }

  } else if (nodeName === 'hr') {

    return {
      type: 'atomic',
      data: { nodeAttributes }
    }

  } else if (nodeName === 'pre') {

    node.innerHTML = node.innerHTML.replace(/<code(.*?)>/g, '').replace(/<\/code>/g, '')

    return {
      type: 'code-block',
      data: { nodeAttributes }
    }

  } else if (blockNames.indexOf(nodeName) !== -1) {

    const blockData: any = { nodeAttributes }

    if (nodeStyle.textAlign) {
      blockData.textAlign = nodeStyle.textAlign
    }

    if (nodeStyle.textIndent) {
      blockData.textIndent = /^\d+em$/.test(nodeStyle.textIndent) ? Math.ceil(parseInt(nodeStyle.textIndent, 10) / 2) : 1
    }

    return {
      type: blockTypes[blockNames.indexOf(nodeName)],
      data: blockData
    }

  }
  // table
  return tableImportFn(nodeName, node);

}

export const getFromHTMLConfig = (options: any, source = 'unknow') => {
  return { 
    htmlToStyle: htmlToStyle(options, source),
    htmlToEntity: htmlToEntity(options, source),
    htmlToBlock: htmlToBlock(options, source)
  }
}

//------------------------------------------------------------分界线----------------------------------------------------------------------//

export const convertEditorStateToHTML = (editorState: EditorState, options: any = {}) => {
    
  options = { ...defaultConvertOptions, ...options }
  
    try {
      const contentState = editorState.getCurrentContent()
      options.contentState = contentState
      return convertToHTML(getToHTMLConfig(options))(contentState)
    } catch (error) {
      console.warn(error)
      return ''
    }
}

export const convertRawToEditorState = (rawContent: RawDraftContentState, editorDecorators: DraftDecoratorType) => {
  try {
    return EditorState.createWithContent(convertFromRaw(rawContent), editorDecorators)
  } catch (error) {
    console.warn(error)
    return EditorState.createEmpty(editorDecorators)
  }
 
}

const convertHTMLToEditorState = (HTMLString: string, editorDecorators: any, options: any, source: any) => {

  options = { ...fontFamilies, ...options }

  try {
    return EditorState.createWithContent(convertFromHTML(getFromHTMLConfig(options, source))(HTMLString), editorDecorators)
  } catch (error) {
    console.warn(error)
    return EditorState.createEmpty(editorDecorators)
  }
}
// 引入此方法 把html转为state
export const createEditorState = (content: any, options = {}) => {
  const customOptions = { ...options };

  let editorState = null;

  // if (content instanceof EditorState) {
  //   editorState = content;
  // }
  // if (
  //   typeof content === 'object' &&
  //   content &&
  //   content.blocks &&
  //   content.entityMap
  // ) {
  //   editorState = convertRawToEditorState(
  //     content,
  //     getDecorators(),
  //   );
  // }

  // if (typeof content === 'string') {
  //   try {
  //     if (/^(-)?\d+$/.test(content)) {
  //       editorState = convertHTMLToEditorState(
  //         content,
  //         getDecorators(),
  //         customOptions,
  //         'create',
  //       );
  //     } else {
  //       // json字符串
  //       editorState = createEditorState(
  //         JSON.parse(content),
  //         customOptions,
  //       );
  //     }
  //   } catch (error) {
  //     // html字符串
  //     editorState = convertHTMLToEditorState(
  //       content,
  //       getDecorators(),
  //       customOptions,
  //       'create',
  //     );
  //   }
  // }

  // if (typeof content === 'number') {
  //   editorState = convertHTMLToEditorState(
  //     content.toLocaleString().replace(/,/g, ''),
  //     getDecorators(),
  //     customOptions,
  //     'create',
  //   );
  // } else {
  //   editorState = EditorState.createEmpty(
  //     getDecorators(),
  //   );
  // }

  // editorState.setConvertOptions(customOptions);

  // html字符串
  editorState = convertHTMLToEditorState(
    content,
    getDecorators(),
    customOptions,
    'create',
  );
  return editorState;
};

export const convertEditorStateToRaw = (editorState: EditorState) => {
  return convertToRaw(editorState.getCurrentContent())
}

export const toRAW = (editorState: EditorState, noStringify: boolean) => {
  return noStringify
    ? convertEditorStateToRaw(editorState)
    : JSON.stringify(convertEditorStateToRaw(editorState));
};

export const toHTML = (editorState: EditorState, options: any) => {
  return convertEditorStateToHTML(editorState, { ...options });
};