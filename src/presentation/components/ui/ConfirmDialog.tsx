import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmColor?: 'blue' | 'red' | 'emerald' | 'yellow';
    icon?: React.ReactNode;
    isLoading?: boolean;
}

const colorMap = {
    blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25',
    red: 'bg-red-600 hover:bg-red-500 shadow-red-600/25',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25',
    yellow: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-600/25',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen, onClose, onConfirm, title, message,
    confirmLabel = 'Confirm', confirmColor = 'blue',
    icon, isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-center transition-colors duration-200">
                    <div className="mx-auto w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center mb-4">
                        {icon || <AlertTriangle size={22} className="text-[var(--text-muted)]" />}
                    </div>

                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-6">{message}</p>

                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg hover:text-[var(--text-primary)] transition-all">
                            Cancel
                        </button>
                        <button type="button" onClick={onConfirm} disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-lg disabled:opacity-50 ${colorMap[confirmColor]}`}>
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Wait...
                                </span>
                            ) : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
