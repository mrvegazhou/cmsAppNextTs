import { useState, useEffect, RefObject } from "react";
import classNames from "classnames";
import DividerComp from "@/components/divider/divider";
import MarkdownNavBarComp from '@/components/markdownNavbar/markdownNavBar';

const Catalogue = ({navContent}:{navContent: RefObject<HTMLElement>}) => {
    useEffect(() => {

    });
    const article = `
# (H1标题)
## (H2标题)
### (H3标题)
#### (H4标题)
##### (H5标题)
###### (H6标题)`;
    return (
        <div className={classNames(['shadow-sm bg-white mt-2 overflow-auto'])} >
            <div style={{height:"500px"}}></div>
          <DividerComp>目录</DividerComp>
          <MarkdownNavBarComp source={article} navContent={navContent} />
        </div>
    );
}
export default Catalogue;