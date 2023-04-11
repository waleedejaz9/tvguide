import Document, { Html, Head, Main, NextScript } from "next/document";
import { createRef, RefObject } from 'react';
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href="/tv-guide/manifest.json" />
          <link rel="apple-touch-icon" href="/tv-guide/icon.png"></link>
          <meta name="theme-color" content="#fff" />
        </Head>
        <body  id="tv-guide-body" >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;