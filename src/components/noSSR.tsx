import dynamic from 'next/dynamic';
import React from 'react';
import { Props } from '@/types/layout';

const NoSSR = (props: Partial<Props>) => <React.Fragment>{props.children}</React.Fragment>;

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});