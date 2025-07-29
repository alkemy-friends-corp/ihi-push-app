import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/shadcn/sonner";
import { FCMInitializer } from "@/components/shared/fcm-initializer";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import type { ReactElement, ReactNode } from "react";
import "@/contexts/i18n";

export type NextPageWithLayout = AppProps['Component'] & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = (Component as NextPageWithLayout).getLayout || ((page) => page);

  return (
    <>
      <ServiceWorkerRegister />
      <FCMInitializer />
      {getLayout(<Component {...pageProps} />)}
      <Toaster />
    </>
  );
}
