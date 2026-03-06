import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'IronCrown Admin — Medieval RP Control Panel',
    description: 'Unturned Medieval RP Server Admin Suite',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" className="dark">
            <body>
                {/* Grain noise texture overlay for depth */}
                <div className="grain-overlay" aria-hidden="true" />
                {children}
            </body>
        </html>
    );
}
