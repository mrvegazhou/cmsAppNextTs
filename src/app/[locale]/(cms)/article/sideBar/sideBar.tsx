import type { RefObject } from "react";
import classNames from "classnames";
import Catalogue from "./catalogue";

/** Sidebar布局所需类型*/
export interface propsType {
    className?: string;
    isShowCatalogue?: boolean;
}
/** 顶部Header，侧边携带Aside*/
const Sidebar = (props: propsType) => {
    return (
        <>
            <style jsx>{`
                .catalogBar {
                    position: fixed;
                }
            `}</style>
            <div className="mainBgColor ms-2" style={{width: '10rem'}}>
                <aside className={classNames(['catalogBar', props.className])}>
                    <Catalogue isShow={props.isShowCatalogue}/>
                    <div className="w-60">{/* 占位用的防止左侧内容偏移 */}xxx</div>
                </aside>
            </div>
        </>
    );
};
export default Sidebar;