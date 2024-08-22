import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementFormatType,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    Spread,
} from 'lexical';
//左右键或鼠标点击选择图像，用delete键可以删除等
import {BlockWithAlignableContents} from '@lexical/react/LexicalBlockWithAlignableContents';
import {
    DecoratorBlockNode,
    SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import * as React from 'react';
import {Suspense} from 'react';
import { SkeletonLayout } from "@/components/skeleton/layout";

type VideoIframeComponentProps = Readonly<{
    className: Readonly<{
      base: string;
      focus: string;
    }>;
    format: ElementFormatType | null;
    nodeKey: NodeKey;
    src: string;
}>;

const Skeleton = () => <SkeletonLayout
    align="center"
    items={[
        { height: 20, width: '90%', marginBottom: 30 },
        { height: 20, width: '90%', marginBottom: 30 },
        { height: 20, width: '90%', marginBottom: 30 }
    ]}
    />
function VideoIframeComponent({
    className,
    format,
    nodeKey,
    src,
  }: VideoIframeComponentProps) {
    return (
      <BlockWithAlignableContents
        className={className}
        format={format}
        nodeKey={nodeKey}>
        <iframe
          width="560"
          height="315"
          src={src}
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
          sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
          title="video"
        />
      </BlockWithAlignableContents>
    );
}
export type SourceType = 'BILIBILI' | 'TENCENT';
export type SerializedVideoIframeNode = Spread<
  {
    src: string;
    srcType: SourceType;
  },
  SerializedDecoratorBlockNode
>;

function convertVideoIframeElement(
    domNode: HTMLElement,
  ): null | DOMConversionOutput {
    const src = domNode.getAttribute('data-lexical-videoIframe');
    const srcType = domNode.getAttribute('data-lexical-videoIframe-type');
    if (src) {
      const node = $createVideoIframeNode(src, srcType as SourceType);
      return {node};
    }
    return null;
}

export class VideoIframeNode extends DecoratorBlockNode {
    __src: string;
    __srcType: SourceType;

    constructor(src: string, sourceType: SourceType, format?: ElementFormatType, key?: NodeKey) {
        super(format, key);
        this.__src = src;
        this.__srcType = sourceType;
    }

    static getType(): string {
        return 'video iframe';
    }

    static clone(node: VideoIframeNode): VideoIframeNode {
        return new VideoIframeNode(node.__src, node.__srcType, node.__format, node.__key);
    }

    static importJSON(serializedNode: SerializedVideoIframeNode): VideoIframeNode {
        const node = $createVideoIframeNode(serializedNode.src, serializedNode.srcType);
        node.setFormat(serializedNode.format);
        return node;
    }

    exportJSON(): SerializedVideoIframeNode {
        return {
          ...super.exportJSON(),
          type: 'video iframe',
          version: 1,
          src: this.__src,
          srcType: this.__srcType
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('iframe');
        element.setAttribute('data-lexical-videoIframe', this.__src);
        element.setAttribute('data-lexical-videoIframe-type', this.__srcType);
        element.setAttribute('width', '560');
        element.setAttribute('height', '315');
        element.setAttribute(
          'src',
          this.__src,
        );
        element.setAttribute('frameborder', '0');
        element.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        );
        element.setAttribute('allowfullscreen', 'true');
        element.setAttribute('title', 'video iframe');
        return {element};
    }

    static importDOM(): DOMConversionMap | null {
        return {
          iframe: (domNode: HTMLElement) => {
            if (!domNode.hasAttribute('data-lexical-videoIframe')) {
              return null;
            }
            return {
              conversion: convertVideoIframeElement,
              priority: 1,
            };
          },
        };
    }
    
    updateDOM(): false {
        return false;
    }
    
    getSrc(): string {
        return this.__src;
    }

    getTextContent(
        _includeInert?: boolean | undefined,
        _includeDirectionless?: false | undefined,
    ): string {
        return this.__src;
    }

    decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
        const embedBlockTheme = config.theme.embedBlock || {};
        const className = {
          base: embedBlockTheme.base || '',
          focus: embedBlockTheme.focus || '',
        };
        return (
            <Suspense fallback={<Skeleton />}>
                <VideoIframeComponent
                    className={className}
                    format={this.__format}
                    nodeKey={this.getKey()}
                    src={this.__src}
                />
            </Suspense>
        );
    }
}

export function $createVideoIframeNode(src: string, srcType: SourceType): VideoIframeNode {
    return new VideoIframeNode(src, srcType);
}

export function $isVideoIframeNode(
    node: VideoIframeNode | LexicalNode | null | undefined,
): node is VideoIframeNode {
    return node instanceof VideoIframeNode;
}