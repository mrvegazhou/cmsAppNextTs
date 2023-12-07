import React from 'react'
import Prism from 'prismjs'
import { ContentBlock } from 'draft-js'
import Immutable, { Map } from 'immutable'

/**
    Filter block to only highlight code blocks

    @param {Draft.ContentBlock}
    @return {Boolean}
*/
function defaultFilter(block: ContentBlock) {
    return block.getType() === 'code-block';
}

/**
    Return syntax for highlighting a code block

    @param {Draft.ContentBlock}
    @return {String}
*/
function defaultGetSyntax(block: ContentBlock) {
    if (block.getData) {
        return block.getData().get('syntax');
    }

    return null;
}

/**
    Default render for token

    @param {Object} props
    @return {React.Element}
*/
function defaultRender(props: any) {
    return React.createElement(
      "span",
      { className: 'prism-token token ' + props.type },
      props.children
    );
}

var PrismOptions = Immutable.Record({
    // Default language to use
    defaultSyntax:      null,

    // Filter block before highlighting
    filter:             defaultFilter,

    // Function to get syntax for a block
    getSyntax:          defaultGetSyntax,

    // Render a decorated text for a token
    render:             defaultRender,

    // Prism module
    prism:              Prism
});

class PrismDecorator {

    options: Map<string, any>
    highlighted: {[key:string]: any}

    constructor(opt: {}) {
        this.options = PrismOptions(opt || {});
        this.highlighted = {}
    }

    _occupySlice(targetArr: string[], start: number, end: number, componentKey: string) {
        for (var ii = start; ii < end; ii++) {
            targetArr[ii] = componentKey;
        }
    }

    /**
     * Return list of decoration IDs per character
     *
     * @param {ContentBlock}
     * @return {List<String>}
     */
    getDecorations(block: ContentBlock) {
        const that = this;
        var tokens, token, tokenId, resultId, offset = 0, tokenCount = 0;
        var filter = this.options.get('filter');
        var getSyntax = this.options.get('getSyntax');
        var blockKey = block.getKey();
        var blockText = block.getText();
        var decorations = Array(blockText.length).fill(null);
        var Prism = this.options.get('prism');
        var highlighted = this.highlighted;

        highlighted[blockKey] = {};

        if (!filter(block)) {
            return Immutable.List(decorations);
        }

        var syntax = getSyntax(block) || this.options.get('defaultSyntax');

        // Allow for no syntax highlighting
        if (syntax == null) {
            return Immutable.List(decorations);
        }

        // Parse text using Prism
        var grammar = Prism.languages[syntax];
        tokens = Prism.tokenize(blockText, grammar);
        
        function processToken(decorations: string[], token: any, offset: number) {
            if (typeof token === 'string') {
              return
            }
            //First write this tokens full length
            tokenId = 'tok'+(tokenCount++);
            resultId = blockKey + '-' + tokenId;
            highlighted[blockKey][tokenId] = token;
            that._occupySlice(decorations, offset, offset + token.length, resultId);
            //Then recurse through the child tokens, overwriting the parent
            var childOffset = offset;
            for (var i =0; i < token.content.length; i++) {
              var childToken = token.content[i];
              processToken(decorations, childToken, childOffset);
              childOffset += childToken.length;
            }
        }

        for (var i =0; i < tokens.length; i++) {
            token = tokens[i];
            processToken(decorations, token, offset);
            offset += token.length;
        }
    
        return Immutable.List(decorations);
    }

    /**
     * Return component to render a decoration
     *
     * @param {String}
     * @return {Function}
     */
    getComponentForKey() {
        return this.options.get('render');
    };

    /**
     * Return props to render a decoration
     *
     * @param {String}
     * @return {Object}
     */
    getPropsForKey(key: string) {
        var parts = key.split('-');
        var blockKey = parts[0];
        var tokId = parts[1];
        var token = this.highlighted[blockKey][tokId];

        return {
            type: token.type
        };
    };

}

export default PrismDecorator;
