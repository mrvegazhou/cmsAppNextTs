import type { ReactNode, RefObject } from "react";
import classNames from "classnames";
import Catalogue from "./catalogue";

/** Sidebar布局所需类型*/
export interface propsType {
    className?: string;
}

/** 顶部Header，侧边携带Aside*/
const Sidebar = ({ className, navContent }: { className?: string; navContent: RefObject<HTMLElement> }) => {
    return (
        <div className="">
            <aside className={classNames(['w-100 border border-1', className])}>
                <Catalogue navContent={navContent}/>
                <div className="w-60">{/* 占位用的防止左侧内容偏移 */}xxx</div>
            </aside>
        </div>
    );
};
export default Sidebar;