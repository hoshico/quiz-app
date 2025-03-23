import { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html>
      <head>
        <title>クイズアプリ</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="p-4 bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
};
