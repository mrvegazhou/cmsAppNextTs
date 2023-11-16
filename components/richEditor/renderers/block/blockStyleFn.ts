import { 
    ContentBlock
} from 'draft-js';

const customBlockStyleFn = (contentBlock: ContentBlock) => {

    const blockAlignment = contentBlock.getData() && contentBlock.getData().get('textAlign');
    const blockIndent = contentBlock.getData() && contentBlock.getData().get('textIndent');
    const blockFloat = contentBlock.getData() && contentBlock.getData().get('float');

    let result = '';

    if (blockAlignment) {
        result = `richEditor-${blockAlignment}`;
    }

    if (blockIndent && blockIndent !== 0) {
        result += ` richEditor-${blockIndent}`;
    }

    if (blockFloat) {
        result += ` richEditor-${blockFloat}`;
    }

    return result;
};
export default customBlockStyleFn;