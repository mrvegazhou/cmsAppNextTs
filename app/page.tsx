import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect(`/${process.env.APP_DEFAULT_LOCALE}`);
}