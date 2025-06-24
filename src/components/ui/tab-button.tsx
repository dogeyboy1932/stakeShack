interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count?: number;
    activeColor: string;
}

export function TabButton({ isActive, onClick, icon, label, count, activeColor }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isActive 
                    ? `bg-gradient-to-b from-${activeColor}-500 to-${activeColor}-600 text-white shadow-lg shadow-${activeColor}-500/25`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-md'
            }`}
        >
            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {icon}
            </div>
            <span className="text-sm">{label}</span>
            {count !== undefined && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-300 ${
                    isActive 
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
} 