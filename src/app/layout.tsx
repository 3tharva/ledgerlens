import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is globally available if needed, or move to client component

export const metadata: Metadata = {
  title: 'LedgerLens',
  description: 'Smart Transaction Categorization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased text-gray-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
