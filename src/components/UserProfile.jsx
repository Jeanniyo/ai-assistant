import { User, Upload } from 'lucide-react'

export default function UserProfile() {
    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-1 shadow-lg shadow-purple-500/20">
                    <div className="w-full h-full rounded-full bg-black/40 overflow-hidden flex items-center justify-center backdrop-blur-md">
                        <User size={48} className="text-white/80" />
                        {/* Image would go here if uploaded */}
                    </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Upload size={24} className="text-white" />
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-white tracking-wide">Guest User</h3>
                <p className="text-xs text-purple-300/70 font-medium uppercase tracking-wider">Personal Assistant</p>
            </div>
        </div>
    )
}
