import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  if (typeof(window) !== "undefined") {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  return (
    <Html lang="en">
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6813236705463574"
          crossorigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-6813236705463574" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
