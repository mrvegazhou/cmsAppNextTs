'use client';
import { redirect, RedirectType } from 'next/navigation';


export default function RootPage() {  
  // 静态 build 模式下 不能用 next/router 需要用next/navigation
  redirect(`/${process.env.APP_DEFAULT_LOCALE}`, RedirectType.replace);
}
