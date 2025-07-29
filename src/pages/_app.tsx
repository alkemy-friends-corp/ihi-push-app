import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/shadcn/sonner";
import { FCMInitializer } from "@/components/shared/fcm-initializer";
import type { ReactElement, ReactNode } from "react";
import "@/contexts/i18n";

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = AppProps['Component'] & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = (Component as NextPageWithLayout).getLayout || ((page) => page);

  return (
    <>
      <FCMInitializer />
      {getLayout(<Component {...pageProps} />)}
      <Toaster />
    </>
  );
}
