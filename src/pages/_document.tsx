import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Toyosu Spots" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Toyosu Spots" />
        <meta name="description" content="Your guide to exploring Toyosu area with real-time notifications and location-based services" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/images/Toyosuspots.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/Toyosuspots.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/Toyosuspots.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/images/Toyosuspots.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/images/Toyosuspots.png" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
