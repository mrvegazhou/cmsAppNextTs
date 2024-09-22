import {LexicalEditor} from 'lexical';
import * as React from 'react';
import {useState} from 'react';
import { debounce } from "lodash-es"
import {INSERT_VIDEOIFRAME_COMMAND} from './';
import { SourceType } from '../../nodes/VideoIframeNode';

const BILIBILI_URL = /^(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(\S+)\/\?(spm_id_from=|vd_source=)(?:\S+)?$/;
const TENCENT_URL = /^(?:https?:\/\/)?(?:v\.)?qq\.com\/x\/cover\/(?:\S+)\/(\S+)\.html$/;

const isBilibili = (url: string) => {
    return BILIBILI_URL.test(url);
};

const isTencent = (url: string) => {
    return TENCENT_URL.test(url);
};
type embedResultType = {
    src: string;
    srcType: SourceType;
};
export default function InsertVideoIframeDialog({
    activeEditor,
    onClose,
  }: {
    activeEditor: LexicalEditor;
    onClose: () => void;
  }): JSX.Element {

    const [embedResult, setEmbedResult] = useState<embedResultType | null>(null);

    const getVideoSrc = React.useCallback((url: string, reg: RegExp, type: SourceType): any => {
            const id = url && url.match(reg)![1];
            return {
                srcID: id,
                srcType: type,
                url
            };
        },
        []
    );

    const validateText = React.useMemo(
        () =>
            debounce((inputText: string) => {
                if ( inputText == '' ) return;
                if ( isBilibili(inputText) ) {
                    const { srcID } = getVideoSrc(inputText, BILIBILI_URL, 'BILIBILI');
                    setEmbedResult({src: `//player.bilibili.com/player.html?bvid=${srcID}&page=1&high_quality=1&danmaku=0&autoplay=0`, srcType: 'BILIBILI' as SourceType});
                }
                if ( isTencent(inputText) ) {
                    const { srcID } = getVideoSrc(inputText, TENCENT_URL, 'TENCENT');
                    setEmbedResult({src: `https://v.qq.com/txp/iframe/player.html?vid=${srcID}`, srcType: 'TENCENT' as SourceType});
                }
            }, 100),
        [],
    );

    const onClick = () => {
        if (embedResult != null) {
            const data = {
                src: embedResult.src,
                srcType: embedResult.srcType
            }
            activeEditor.dispatchCommand(INSERT_VIDEOIFRAME_COMMAND, data);
            onClose();
        }
    };    
  
    return (
      <>
        <div className="mb-3">
          <label className="form-label">视频地址</label>
          <input type="text" placeholder='bilibili 腾讯视频' spellCheck={false} className="form-control"
            onChange={(e) => {
                validateText(e.target.value);
            }} 
            onPaste={(e)=> {
                validateText(e.clipboardData.getData('text'));
            }}
            />
        </div>
        <div className='form-row text-center mt-4 mb-3'>
            <button disabled={!embedResult} type="button" className="btn btn-outline-primary" onClick={onClick}>
                插入
            </button>
        </div>
      </>
    );
  }
  