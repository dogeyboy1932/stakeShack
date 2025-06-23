import { Apartment } from '../../lib/schema';

interface DashboardStatsProps {
    apartments: Apartment[];
}

export function DashboardStats({ apartments }: DashboardStatsProps) {
    const totalInterested = apartments.reduce((sum, apt) => sum + apt.interested, 0);
    const totalRevenue = apartments.reduce((sum, apt) => sum + apt.rent, 0);
    const totalStakes = apartments.reduce((sum, apt) => sum + apt.stake, 0);

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {totalInterested}
                    </div>
                    <div className="text-sm text-gray-600">Total Interested Users</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        ${totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Revenue Potential</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        ${totalStakes.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Stakes Required</div>
                </div>
            </div>
        </div>
    );
} 