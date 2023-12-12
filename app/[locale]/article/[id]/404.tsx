import Head from "@/components/next/head";
import Link from "next/link";
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';


/** 文章页面404*/
export default async function NotFound({
  locale
}: {
  locale: string
}) {
    const t = createTranslator(await getMessages(locale));
    const home = `/${locale}`

    return (
      <>
        <Head title="没找到该篇文章" keywords={["404"]} description="Not Found" />
        <div className="container-fluid bg-white vh-100 p-2">
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="text-center vw-100">
              <h1 className="text-primary display-10">404 - NOT FOUND</h1>
              <p className="lead">{t("ArticleIdPage.sorryNotFound")}</p>

              <div className="hstack flex-wrap justify-content-center my-5 gap-4">
                <a href={home} className="text-decoration-none cursor-pointer">
                  <div className="border rounded-5 px-4 py-2 d-inline-block">
                  {t("ArticleIdPage.toHome")}
                  </div>
                </a>

                <a href="/sections" className="fw-bold text-primary text-decoration-none cursor-pointer" >
                  <div className="border rounded-5 px-4 py-2 d-inline-block">

                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};
  