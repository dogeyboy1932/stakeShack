interface ErrorStateProps {
    title?: string;
    error: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export function ErrorState({ 
    title = "Error", 
    error, 
    onRetry, 
    showRetry = true 
}: ErrorStateProps) {
    return (
        <div className="container py-8">
            {title && <h1 className="text-3xl font-bold mb-8">{title}</h1>}
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-red-500 mb-4">{error}</p>
                {showRetry && onRetry && (
                    <button 
                        onClick={onRetry}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
} 