import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Over Fuss - Eat Well. Zero Fuss.",
  description: "Automates weekly menus and generates grocery lists.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Inter:wght@400;600;700&family=Outfit:wght@600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body className="bg-background-light text-text-main font-body antialiased min-h-screen flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}