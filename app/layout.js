import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata = {
  title: 'VoltMart — Premium Electronics & Maker Marketplace',
  description: 'Buy Arduino, ESP32, Raspberry Pi, sensors, robotics kits, drones, 3D printers and more. India\'s premium electronics marketplace for engineers, makers and industry.',
  keywords: 'arduino, esp32, raspberry pi, electronics, sensors, robotics, iot, drones, 3d printer, dev boards',
  openGraph: {
    title: 'VoltMart — Premium Electronics Marketplace',
    description: 'The premium destination for makers, engineers and electronics enthusiasts.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} dark`}>
      <body className="font-sans antialiased bg-[#05060A] text-white min-h-screen">
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
