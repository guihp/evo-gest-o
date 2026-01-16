'use client';
import { useState } from 'react';
import { Dialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Link, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ConnectModalProps {
    open: boolean;
    onClose: () => void;
    instanceName: string;
}

export function ConnectModal({ open, onClose, instanceName }: ConnectModalProps) {
    const [mode, setMode] = useState<'select' | 'qr' | 'link'>('select');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleOpenQr = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/instance/${instanceName}/connect`);
            const data = await res.json();
            if (data.base64 || data.qrcode) {
                setQrCode(data.base64 || data.qrcode); // Adjust based on actual API return
                setMode('qr');
            } else {
                alert('No QR Code returned (Already connected?)');
            }
        } catch (e) {
            alert('Error fetching QR Code');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/instance/${instanceName}/connect`, { method: 'POST' });
            const data = await res.json();
            if (data.token) {
                const link = `${window.location.origin}/connect/${data.token}`;
                setGeneratedLink(link);
                setMode('link');
            }
        } catch (e) {
            alert('Error generating link');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMode('select');
        setQrCode(null);
        setGeneratedLink(null);
        onClose();
    };

    // Reset internal state when reopening
    // Actually, controlled by parent 'open', but acceptable to not reset fully to keep cache if needed.
    // Better to reset on close.

    const copyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <Dialog open={open} onClose={reset} title={`Connect: ${instanceName}`}>
            {mode === 'select' && (
                <div className="flex flex-col gap-4 py-4">
                    <Button onClick={handleOpenQr} disabled={loading} className="w-full h-16 text-lg flex gap-3">
                        <QrCode /> Show QR Code Now
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">- OR -</div>
                    <Button onClick={handleGenerateLink} disabled={loading} variant="outline" className="w-full h-16 text-lg flex gap-3">
                        <Link /> Generate 10-Min Link
                    </Button>
                </div>
            )}

            {mode === 'qr' && (
                <div className="flex flex-col items-center justify-center p-4">
                    {qrCode ? (
                        <img src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} alt="QR Code" className="w-64 h-64 border rounded" />
                    ) : (
                        <p>No QR Code</p>
                    )}
                    <Button onClick={() => setMode('select')} variant="ghost" className="mt-4">Back</Button>
                </div>
            )}

            {mode === 'link' && (
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-sm text-muted-foreground">Send this link to your client. It will expire in 10 minutes.</p>
                    <div className="flex gap-2">
                        <Input value={generatedLink || ''} readOnly />
                        <Button onClick={copyLink} size="icon">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                    </div>
                    <Button onClick={() => setMode('select')} variant="ghost">Back</Button>
                </div>
            )}
        </Dialog>
    );
}
