import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/shadcn/sonner";
import type { ReactElement, ReactNode } from "react";

export type NextPageWithLayout<P = {}, IP = P> = AppProps['Component'] & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = (Component as NextPageWithLayout).getLayout || ((page) => page);

  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <Toaster />
    </>
  );
}
