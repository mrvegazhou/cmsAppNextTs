import { 
    DraftInlineStyle,
    ContentBlock
} from 'draft-js';

type Props = {
    editorId?: string;
}
type Options = {
    customStyleFn: ((style: DraftInlineStyle, block: ContentBlock, output:{}) => React.CSSProperties) | undefined;
}
const getStyleValue = (style: string) => style.split('-')[1];
const unitExportFn = (value: string, type: string) => type === 'line-height' ? value : `${value}px`;
const fontFamilies = [
    {
      name: 'Araial',
      family: 'Arial, Helvetica, sans-serif',
    },
    {
      name: 'Georgia',
      family: 'Georgia, serif',
    },
    {
      name: 'Impact',
      family: 'Impact, serif',
    },
    {
      name: 'Monospace',
      family: '"Courier New", Courier, monospace',
    },
    {
      name: 'Tahoma',
      family: 'tahoma, arial, "Hiragino Sans GB", 宋体, sans-serif',
    },
];

const InlineStyle = (props: Props, options: Options) => (styles: DraftInlineStyle, block: ContentBlock) => {
    let output: React.CSSProperties = {};
    const { customStyleFn } = options;
    
    output = customStyleFn ? customStyleFn(styles, block, output) : {};
    styles.forEach((style: string | undefined) => {
        if (style) {
            if (style!.indexOf('COLOR-') === 0) {
                output.color = `#${getStyleValue(style)}`;
            } else if (style!.indexOf('BGCOLOR-') === 0) {
                output.backgroundColor = `#${getStyleValue(style)}`;
            } else if (style!.indexOf('FONTSIZE-') === 0) {
                output.fontSize = unitExportFn(
                    getStyleValue(style),
                    'font-size'
                );
            } else if (style.indexOf('LINEHEIGHT-') === 0) {
                output.lineHeight = unitExportFn(
                  getStyleValue(style),
                  'line-height'
                );
            } else if (style.indexOf('LETTERSPACING-') === 0) {
                output.letterSpacing = unitExportFn(
                  getStyleValue(style),
                  'letter-spacing'
                );
            } else if (style.indexOf('TEXTINDENT-') === 0) {
                output.textIndent = unitExportFn(
                  getStyleValue(style),
                  'text-indent'
                );
            } else if (style.indexOf('FONTFAMILY-') === 0) {
                output.fontFamily =
                  (
                    fontFamilies.find(
                      (item) => item.name.toUpperCase() === getStyleValue(style),
                    ) || {}
                  ).family || '';
            }
        }
        
    });
    return output;
};
export default InlineStyle;