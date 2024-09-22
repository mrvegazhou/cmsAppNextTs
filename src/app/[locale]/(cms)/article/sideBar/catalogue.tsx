import { useState, useLayoutEffect, RefObject } from "react";
import classNames from "classnames";
import DividerComp from "@/components/divider/divider";
import CreateCatalog from "@/components/catalogNavbar";
import'./catalogue.scss'

export interface propsType {
    navContent?: RefObject<HTMLElement>;
    isShow?: boolean;
}
const Catalogue = (props: propsType) => {
    const rebuildCatalog = () => {
        let catalog = new CreateCatalog({
          contentEl: 'articleContent',
          catelogEl: 'catelogList',
          linkClass: 'cms-catelog-link',
          linkActiveClass: 'cms-catelog-link-active',
          supplyTop: 20,
          selector: ['h1', 'h2', 'h3'],
          active: function (el: HTMLElement) {
          }
        });
        catalog.rebuild();
    };
    useLayoutEffect(() => {
        rebuildCatalog();
    }, []);

    const [show, setShow] = useState(true);

    return (
        <>
            <div className={classNames(['mainBgColor overflow-auto catelogFrame'], {"catalogueFadeOutAnimation": !props.isShow})} >
                <DividerComp>
                    <span className="title">
                        目录 {show ? <i onClick={() => setShow(false)} className="iconfont icon-xiangshang cursor-pointer"></i> : <i onClick={() => setShow(true)} className="iconfont icon-xiangxia cursor-pointer"></i>}
                    </span>
                </DividerComp>
                <div id="catelogList" className={classNames({"unfold": show})}></div>
            </div>
        </>
    );
}
export default Catalogue;