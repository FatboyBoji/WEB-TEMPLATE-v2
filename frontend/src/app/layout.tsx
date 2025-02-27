import './globals.css';
import { Chakra_Petch } from 'next/font/google';
import AuthProviderWrapper from '@/components/auth/AuthProviderWrapper';
import SessionHandler from '@/components/auth/SessionHandler';

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'WealthArc - Your Budget Companion',
  description: 'Track your income and expenses with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={chakraPetch.className}>
        <AuthProviderWrapper>
          <SessionHandler />
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}

