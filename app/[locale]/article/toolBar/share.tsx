import { useEffect, useRef } from 'react';
import classNames from "classnames";
import { itemClassName, iconClassName, DivDom } from "./class";
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import PopoverComp from '@/components/popover/popover';

const Share = () => {
  
  const tooltip = (
    <div>
      xxxxx
    </div>
  );

  const content = (
    <div className={classNames(['me-10 p-2 bg-white rounded-2'])} >
      <div className="d-flex flex-column bd-highlight text-secondary">
        <OverLayTriggerComp placement="right" trigger="click" overlay={tooltip} position="fixed">
          <div className="p-2 cursor-pointer">微信</div>
        </OverLayTriggerComp>
        <div className="p-2 cursor-pointer">新浪微博</div>
        <div className="p-2 cursor-pointer">QQ</div>
      </div>
    </div>
  );

  return (
      <>
        <PopoverComp trigger="click" placement="right" content={content}>
          <DivDom className={classNames([itemClassName, "text-center border"])}>
            <i className={classNames([iconClassName, "icon-fenxiangcopy"])}></i>
          </DivDom>
        </PopoverComp>
      </>
  );
};
export default Share;