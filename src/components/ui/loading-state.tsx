import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    title?: string;
    message?: string;
}

export function LoadingState({ title = "Loading...", message }: LoadingStateProps) {
    return (
        <div className="container py-8">
            {title && <h1 className="text-3xl font-bold mb-8">{title}</h1>}
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">{message || "Loading..."}</span>
            </div>
        </div>
    );
} 