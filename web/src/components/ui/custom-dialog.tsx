import { X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [open]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === ref.current) {
            onClose();
        }
    };

    return (
        <dialog
            ref={ref}
            className="backdrop:bg-black/50 bg-transparent p-0 rounded-lg shadow-xl outline-none"
            onClick={handleBackdropClick}
        >
            <div className="bg-background rounded-lg p-6 min-w-[400px] border shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                    {title && <h2 className="text-xl font-bold">{title}</h2>}
                    <button onClick={onClose} className="p-1 hover:bg-accent rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    );
}
