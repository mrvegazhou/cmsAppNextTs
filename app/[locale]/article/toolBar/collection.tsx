import classNames from "classnames";
import { itemClassName, iconClassName, DivDom } from "./class";

const Collection = () => {
    return (
        <>
          <DivDom className={classNames([itemClassName])}>
            <i className={classNames([iconClassName, "icon-collection"])}></i>
          </DivDom>
        </>
    );
};
export default Collection;