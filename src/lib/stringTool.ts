import { isNullOrUnDefOrEmpty } from "./is";


export const replaceImgWithText = (content: string, placeholder: string): string => {
    if (isNullOrUnDefOrEmpty(content)) return "";
    // 正则表达式匹配img标签
    const imgRegex = /<(img|Image)\b[^>]*?>/g;
    // 替换img标签为[图片]
    return content.replace(imgRegex, placeholder);
}

export const replaceImgTagWithImage = (content: string): string => {
    // 使用正则表达式匹配 img 标签
    const imgTagRegex = /<img\s+([^>]*)>/g;
    // 使用替换函数来修改匹配到的内容
    const replacedContent = content.replace(imgTagRegex, (match, attributes) => {
        // 将 img 替换为 Image
        return `<Image ${attributes}>`;
    });

    return replacedContent;
}

export const containsImgTag = (str: string): boolean => {
    // 正则表达式匹配img标签
    const imgTagRegex = /<img\s+[^>]*>/i;
    return imgTagRegex.test(str);
}