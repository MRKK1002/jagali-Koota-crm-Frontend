import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login", { state: { crmType: "restaurant" } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full bg-white px-6 py-4 flex items-center justify-between fixed top-0 z-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src="/logo4.jpeg"
            alt="Jagali Koota"
            className="w-11 h-11 rounded-xl object-cover"
          />
          <div className="hidden md:block">
            <span className="font-semibold text-[#69231B]">Jagali Koota</span>
            <span className="block text-xs text-[#69231B]">Restaurant CRM</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Business Management
            </h1>
            <p className="text-lg text-gray-500">
              Select your portal to continue
            </p>
          </div>

          {/* Single Card */}
          <div
            className="bg-white rounded-2xl p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-xl cursor-pointer"
            onClick={handleLogin}
          >
            {/* Logo & Info */}
            <div className="flex items-center gap-4 mb-5">
              <img
                src="/logo4.jpeg"
                alt="Jagali Koota"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Jagali Koota</h3>
                <span className="text-sm font-medium text-red-700">Restaurant CRM</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Complete restaurant management with billing, inventory, kitchen operations and customer relations.
            </p>

            {/* Button */}
            <button
              className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-xl font-medium transition-all duration-200"
            >
              Login
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img src="/logo4.jpeg" alt="Jagali Koota" className="w-6 h-6 rounded-lg object-cover" />
            <span className="text-sm text-gray-600">Jagali Koota</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
