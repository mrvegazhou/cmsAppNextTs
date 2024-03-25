import {
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
} from '@lexical/code';

// 编程语言列表
export default function getCodeLanguageOptions(): [string, string][] {
    const options: [string, string][] = [];
  
    for (const [lang, friendlyName] of Object.entries(
      CODE_LANGUAGE_FRIENDLY_NAME_MAP,
    )) {
      options.push([lang, friendlyName]);
    }
  
    return options;
}