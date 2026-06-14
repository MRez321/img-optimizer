export default function Navbar() {
    return (
        <nav className="bg-gray-900 border-b border-gray-800 py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Logo SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 326.73 51" className="h-10 w-auto">
                        <path d="M7.75 40.53a14.26 14.26 0 01-5.73-6..." fill="#00ADB5" />
                        {/* Paste your full SVG path here */}
                    </svg>

                    <img src="/img/pixel-star.png" alt="Star" className="h-8 w-8" />

                    <button className="px-5 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition">
                        Log In
                    </button>
                </div>
            </div>
        </nav>
    );
}