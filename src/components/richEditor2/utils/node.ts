import type {
    ElementNode,
    LexicalNode
} from 'lexical'
import {
    $isElementNode,
    $getRoot,
    $isTextNode
} from 'lexical';
import {$isMarkNode} from '@lexical/mark';
import {$addNodeStyle} from '@lexical/selection';

export const visitTree = (
    currentNode: ElementNode,
    visitor: (node: LexicalNode) => void,
    indent: Array<string> = [],
  ) => {
    const childNodes = currentNode.getChildren();
  
    childNodes.forEach((childNode, i) => {
      visitor(
        childNode
      );
      if ($isElementNode(childNode)) {
        visitTree(
          childNode,
          visitor
        );
      }
    });
}

// 替换带有--mark-id的span
export const replaceSpan = (htmlContent: string) => {
  const regex = /<span[^>]*?style='[^']*?--mark-id:([^';]+);[^']*'[^>]*>(.*?)<\/span>/gi;
  // 替换函数，将匹配到的span标签替换为mark标签
  const newHtmlContent = htmlContent.replace(regex, (match, markId, content) => {
      // 创建新的mark标签，id为--mark-id的值
      return `<mark id="${markId.trim()}">${match}</mark>`;
  });
  return newHtmlContent;
};

// mark标签设置
export const saveMarkTag = () => {
    let marks: Array<string> = [];
    visitTree($getRoot(), (node: LexicalNode) => {            
        if($isMarkNode(node)) {
            node.getIDs().forEach((id, _) => {
                marks.push(id);
            });
            let textNode = node.getChildAtIndex(0);
            const ids = node.getIDs();
            if ($isTextNode(textNode)) {
                textNode.setStyle(
                '--mark-id:' + ids.join(','),
                );
                $addNodeStyle(textNode);
            }
        }
    });
    return marks;
};