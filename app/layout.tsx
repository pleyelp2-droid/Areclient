import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['italic', 'normal'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'Ouroboros Content Brain',
  description: 'Autonomous AI Content Automation Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}>
      <body className="bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
