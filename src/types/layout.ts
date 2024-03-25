import { ReactNode } from 'react';

interface PropsParams {
  locale: string
}

export interface Props  {
  children: ReactNode
  // Partial将类型定义的所有属性都修改为可选。
  params: Partial<PropsParams>
}