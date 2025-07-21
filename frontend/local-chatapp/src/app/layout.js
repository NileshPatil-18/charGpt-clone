// src/app/layout.js

import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: "Local Chat App",
  description: "Chat app using Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Required meta tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
