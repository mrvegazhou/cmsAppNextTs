import type { FC, ReactNode } from "react";
import classNames from 'classnames';
import BackTopPage from '@/app/[locale]/common/backTop';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import type { TMetadata } from '@/types';

export interface propsType {
    children: ReactNode;
    className?: string;
    metadata: TMetadata;
}

const ContentLayout: FC<propsType> = props => {
    return (
      <>
        <NavbarPage metadata={props.metadata} fixedTop={true} />
        <div className={classNames(["bg-[#f4f5f5]", "pt-2"])}>
          <main
            style={{maxWidth:"1160px"}}
            className={classNames([
              "mx-auto",
              "d-flex",
              "justify-content-between",
              "align-items-center",
              "min-vh-100",
              props.className,
            ])}
          >
            {props.children}
          </main>
        </div>
        <FooterPage metadata={props.metadata} />
        <BackTopPage />
      </>
    );
  };
  export default ContentLayout;