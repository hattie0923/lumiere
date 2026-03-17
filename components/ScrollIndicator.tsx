'use client';

import { useEffect, useState } from 'react';

export default function ScrollIndicator() {
    const [scrollPercent, setScrollPercent] = useState(0);
    const [visible, setVisible] = useState(false);
    const [hideTimeout, setHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollPercent(percent);
            setVisible(true);

            if (hideTimeout) clearTimeout(hideTimeout);
            const timeout = setTimeout(() => setVisible(false), 1200);
            setHideTimeout(timeout);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (hideTimeout) clearTimeout(hideTimeout);
        };
    }, [hideTimeout]);

    return (
        <div
            className="fixed top-0 right-0 w-[4px] h-full z-[200] pointer-events-none transition-opacity duration-500"
            style={{ opacity: visible ? 1 : 0 }}
        >
            {/* Track — invisible */}
            <div className="absolute inset-0 bg-transparent" />
            {/* Thumb */}
            <div
                className="absolute right-0 w-full rounded-full bg-accent/50 transition-[top] duration-100 ease-out"
                style={{
                    height: '15%',
                    top: `${scrollPercent * 0.85}%`,
                }}
            />
        </div>
    );
}
