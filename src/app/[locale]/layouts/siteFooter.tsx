'use client';
import { useEffect } from 'react';
import type { TMetadata } from '@/types';
import dynamic from 'next/dynamic';


const year = new Date().getFullYear();

// const AnalysisDynamic: any = dynamic(() => import('./analysis/wrapper'), {
//   ssr: false,
// });

export default function Footer({ metadata }: { metadata: TMetadata }) {
  
  useEffect(() => {
  }, [])

  return <FooterComp metadata={metadata} />;
}

const FooterComp = ({ metadata }: { metadata: TMetadata }) => {
  const env = metadata.env;

  return (
    <>
      {env.APP_ICP_NUM && env.APP_ICP_LINK ? (
        <footer className="py-4 small">
          <div className="d-flex flex-column align-items-center justify-content-center">
            <p className="mb-2">
              &copy; {year}Y &nbsp;{env.APP_NAME}
            </p>
            <a href={env.APP_ICP_LINK} className="text-decoration-none">
              {env.APP_ICP_NUM}
            </a>
          </div>
        </footer>
      ) : (
        <div className="py-4"></div>
      )}

      {/* <AnalysisDynamic metadata={metadata} /> */}
    </>
  );
};
