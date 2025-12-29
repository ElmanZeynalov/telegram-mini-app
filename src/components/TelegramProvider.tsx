'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        };
    }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if running in client
        if (typeof window !== 'undefined') {
            // We can also initialize things here if we used the npm package directly for everything
            // But often loading the script from telegram server is recommended for latest updates, 
            // though @twa-dev/sdk is also good. 
            // Let's rely on @twa-dev/sdk but ensure it doesn't crash SSR
            import('@twa-dev/sdk').then((SDK) => {
                SDK.default.ready();
                setIsLoaded(true);
            }).catch(e => {
                console.log("Telegram SDK loading failed or not in Telegram environment", e);
                // Still load the app even if SDK fails (e.g. browser testing)
                setIsLoaded(true);
            });
        }
    }, []);

    // You might want to show a loader until SDK is ready, 
    // or just render children immediately and let them check SDK status.
    // For now, we render immediately but could add a "Loading..." state if critical data is needed from initData.

    return (
        <>
            <Script
                src="https://telegram.org/js/telegram-web-app.js"
                strategy="beforeInteractive"
            />
            {children}
        </>
    );
}
