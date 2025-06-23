interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count: number;
    activeColor: 'blue' | 'red';
}

export function TabButton({ isActive, onClick, icon, label, count, activeColor }: TabButtonProps) {
    const colors = {
        blue: {
            active: 'bg-white text-blue-600 shadow-sm',
            badge: 'bg-blue-100 text-blue-600'
        },
        red: {
            active: 'bg-white text-red-600 shadow-sm',
            badge: 'bg-red-100 text-red-600'
        }
    };

    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                    ? colors[activeColor].active
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
            {icon}
            <span>{label}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
                isActive 
                    ? colors[activeColor].badge
                    : 'bg-gray-200 text-gray-600'
            }`}>
                {count}
            </span>
        </button>
    );
} 