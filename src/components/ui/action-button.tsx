interface ActionButtonProps {
    onClick: () => void;
    variant: 'approve' | 'ignore' | 'restore' | 'cancel';
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function ActionButton({ onClick, variant, children, className = '', disabled = false }: ActionButtonProps) {
    const variants = {
        approve: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 border border-blue-500/20',
        ignore: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 shadow-md shadow-amber-500/25 border border-amber-500/20',
        restore: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500 shadow-md shadow-purple-500/25 border border-purple-500/20',
        cancel: 'bg-gradient-to-r from-slate-600 to-gray-600 text-white hover:from-slate-500 hover:to-gray-500 shadow-md shadow-slate-500/25 border border-slate-500/20'
    };

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
} 