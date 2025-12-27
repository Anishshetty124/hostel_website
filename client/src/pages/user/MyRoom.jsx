import { Home } from 'lucide-react';

const MyRoom = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                    <Home size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Room</h1>
                    <p className="text-gray-500">Room details will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default MyRoom;