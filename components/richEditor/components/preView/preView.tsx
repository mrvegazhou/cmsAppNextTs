
import { EditorState } from 'draft-js';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import { toHTML } from '../../utils/convert';

type PreViewToolBarProps = {
    editorState: EditorState;
    classNames?: string;
}
const PreViewToolBar = (props: PreViewToolBarProps) => {
    
    const t = useTranslations('RichEditor');
    const overLayRef = useRef(null);

    const buildPreviewHtml = () => {
        return `
          <!Doctype html>
          <html>
            <head>
              <title>Preview Content</title>
              <style>
                html,body{
                  height: 100%;
                  margin: 0;
                  padding: 0;
                  overflow: auto;
                  background-color: #f1f2f3;
                }
                .container{
                  box-sizing: border-box;
                  width: 1000px;
                  max-width: 100%;
                  min-height: 100%;
                  margin: 0 auto;
                  padding: 30px 20px;
                  overflow: hidden;
                  background-color: #fff;
                  border-right: solid 1px #eee;
                  border-left: solid 1px #eee;
                }
                .container img,
                .container audio,
                .container video{
                  max-width: 100%;
                  height: auto;
                }
                .container p{
                  white-space: pre-wrap;
                  min-height: 1em;
                }
                .container pre{
                  padding: 15px;
                  background-color: #f1f1f1;
                  border-radius: 5px;
                }
                .container blockquote{
                  margin: 0;
                  padding: 15px;
                  background-color: #f1f1f1;
                  border-left: 3px solid #d1d1d1;
                }
              </style>
            </head>
            <body>
              <div class="container">${toHTML(props.editorState, {})}</div>
            </body>
          </html>
        `
    }

    const preview = () => {
        // @ts-ignore
        if (window.previewWindow) {
            // @ts-ignore
            window.previewWindow.close()
        }
        // @ts-ignore
        window.previewWindow = window.open()
        // @ts-ignore
        window.previewWindow.document.write(buildPreviewHtml())
        // @ts-ignore
        window.previewWindow.document.close()
    
    }    

    return (
        <span className={classNames("cursor-pointer me-4", props.classNames)} onClick={preview} onMouseDown={(e) => e.preventDefault()}>
            <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('preView')}</small>}>
                <i className='iconfont icon-yulan fs-4 opacity-75'></i>
            </OverLayTriggerComp>
        </span>
    );
}
export default PreViewToolBar;