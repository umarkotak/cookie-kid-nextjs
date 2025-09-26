import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  if (typeof(window) !== "undefined") {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
