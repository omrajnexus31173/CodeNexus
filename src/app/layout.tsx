import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Code Nexus | Learn, Code, Practice & Certify',
  description: 'Master C, C++, Python, Java, JavaScript, SQL, DSA, and System Design with interactive lessons, sandboxed practice, certification exams, and career profiles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-slate-950"
            >
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
            <Footer />
            <ChatbotWidget />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
