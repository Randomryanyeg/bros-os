import { useState, useEffect } from 'react';
import { toast } from 'sonner';
export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            toast.info("Install Scotia Mobile", {
                description: "Get faster, secure access from your home screen.",
                action: {
                    label: "Install",
                    onClick: () => {
                        e.prompt();
                    }
                },
                duration: Infinity,
            });
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);
    return deferredPrompt;
}
