import type { Metadata } from 'next';
import { Inter, Oswald, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { WishlistProvider } from '@/lib/wishlist-context';
import { CartProvider } from '@/lib/cart-context';
import AIConcierge from '@/components/AIConcierge';
import ScrollIndicator from '@/components/ScrollIndicator';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant'
});

export const metadata: Metadata = {
  title: 'LUMIÈRE | Virtual Try-On',
  description: 'Next-gen virtual fashion experience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${cormorant.variable}`}>
      <body className="bg-background text-foreground antialiased selection:bg-accent selection:text-black">
        <CartProvider>
          <WishlistProvider>
            {children}
            <AIConcierge />
          </WishlistProvider>
        </CartProvider>
        <ScrollIndicator />
      </body>
    </html>
  );
}

