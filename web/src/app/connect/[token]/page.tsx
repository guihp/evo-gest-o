'use client';

import { use, useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ConnectPage({ params }: { params: Promise<{ token: string }> }) {
    // In Next.js 15 Client Components, params is a Promise.
    // We can use React.use() to unwrap it, OR useEffect/useState.
    // Since 'use' hook is available in React 19 (which Next 15 uses) and works in client components if they are async?
    // No, client components cannot be async.
    // BUT we can use `use(params)` inside the component body in React 19.

    // Let's use `use(params)` if supported, or fallback to state.
    // To be safe and compatible, I'll use standard hook pattern.

    // However, if params is a Promise, we can't access .token directly.
    // `use` is part of React 19. Next 16.1.2 implies React 19.

    const { token } = use(params);

    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [instanceName, setInstanceName] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token) return;

        const fetchQr = async () => {
            try {
                const res = await fetch('/api/public/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const data = await res.json();

                if (res.ok) {
                    if (data.base64 || data.qrcode) {
                        setQrCode(data.base64 || data.qrcode);
                        setInstanceName(data.instanceName);
                        setStatus('success');
                    } else if (data.instance && data.instance.state === 'open') {
                        setInstanceName(data.instanceName);
                        setStatus('success');
                        setQrCode(null);
                    } else {
                        setErrorMsg('No QR Code received. Instance might be already connected.');
                        setStatus('error');
                    }
                } else {
                    setErrorMsg(data.error || 'Failed to verify link');
                    setStatus('error');
                }
            } catch (e) {
                setErrorMsg('Network error');
                setStatus('error');
            }
        };

        fetchQr();
        const interval = setInterval(fetchQr, 5000); // Poll every 5s to refresh QR or check status
        return () => clearInterval(interval);

    }, [token]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Connect Instance</CardTitle>
                    <CardDescription>{instanceName ? `Connecting to: ${instanceName}` : 'Initializing...'}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                    {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-blue-500" />}

                    {status === 'error' && (
                        <div className="flex flex-col items-center text-red-400 gap-2">
                            <AlertCircle size={48} />
                            <p className="text-center font-medium">{errorMsg}</p>
                        </div>
                    )}

                    {status === 'success' && qrCode && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white p-2 rounded-lg">
                                <img
                                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                                    alt="Scan me"
                                    className="w-64 h-64"
                                />
                            </div>
                            <p className="text-sm text-slate-400 animate-pulse">Scan with your WhatsApp</p>
                        </div>
                    )}

                    {status === 'success' && !qrCode && (
                        <div className="flex flex-col items-center gap-2 text-green-400">
                            <p className="text-lg font-bold">Successfully Connected!</p>
                            <p className="text-sm text-slate-400">You can close this page.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
