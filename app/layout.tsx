import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export const metadata = {
  title: 'Nhala Homestay',
  description:
    'homestay nhala'
};

// export default function RootLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="flex min-h-screen w-full flex-col">{children}</body>
//       <Analytics />
//     </html>
//   );
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
      <Analytics />
    </html>
  );
}