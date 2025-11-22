
import React, { useState, useEffect } from 'react';
import { Box, ArrowRight, BarChart3, MapPin, ShieldCheck, Globe, CheckCircle2, X, Zap, Layers, Smartphone, History as HistoryIcon, Moon } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [showAbout, setShowAbout] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAbout) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showAbout]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-2.5 rounded-xl shadow-lg shadow-primary-600/20">
             <Box className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">StockMaster</span>
        </div>
        <button 
          onClick={onLoginClick}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full transition-all shadow-lg"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 overflow-hidden">
        
        {/* Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-3xl -z-0 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-3xl -z-0 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-8 border border-indigo-100 dark:border-indigo-800">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            Live Inventory Tracking v2.0
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
            Master Your Inventory. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 animate-gradient-x">
                Master Your Business.
            </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl leading-relaxed">
            Streamline operations, eliminate manual errors, and gain real-time visibility across all your warehouses with the world's most intuitive IMS.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-20 w-full sm:w-auto">
            <button 
                onClick={onLoginClick}
                className="px-8 py-4 text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 group hover:-translate-y-1"
            >
                Get Started Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
                onClick={() => setShowAbout(true)}
                className="px-8 py-4 text-lg font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all hover:-translate-y-1 shadow-sm flex items-center justify-center gap-2"
            >
                About Us
            </button>
            </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left relative z-10">
           <FeatureCard 
             icon={BarChart3}
             title="Real-time Analytics"
             desc="Visualize stock movements, track KPIs, and predict trends with AI-powered dashboards."
             color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
           />
           <FeatureCard 
             icon={MapPin}
             title="Multi-Warehouse"
             desc="Manage stock across multiple locations with precise geofencing and radius validation."
             color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
           />
           <FeatureCard 
             icon={ShieldCheck}
             title="Secure Operations"
             desc="Role-based access control and audit logs ensure your inventory data remains safe."
             color="text-purple-600 bg-purple-50 dark:bg-purple-900/20"
           />
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800 w-full max-w-4xl mx-auto text-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale dark:invert">
                 <span className="text-xl font-bold text-gray-800">ACME Corp</span>
                 <span className="text-xl font-bold text-gray-800">Global Logistics</span>
                 <span className="text-xl font-bold text-gray-800">TechFlow</span>
                 <span className="text-xl font-bold text-gray-800">PrimeSupply</span>
            </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 py-8 z-10 relative">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>© 2024 StockMaster Systems Inc.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* About Overlay */}
      {showAbout && <AboutOverlay onClose={() => setShowAbout(false)} onLogin={onLoginClick} />}
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl hover:-translate-y-1 group">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
      {desc}
    </p>
    <div className="mt-6 flex items-center text-sm font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
        Learn more <ArrowRight size={16} className="ml-1" />
    </div>
  </div>
);

const AboutOverlay = ({ onClose, onLogin }: { onClose: () => void, onLogin: () => void }) => {
  const features = [
    { icon: Zap, title: "Instant Sync", desc: "Changes in stock levels propagate instantly across all connected devices." },
    { icon: MapPin, title: "Geofencing", desc: "Advanced GPS validation ensures staff are physically present at the warehouse for operations." },
    { icon: Layers, title: "Smart Operations", desc: "Streamlined workflows for Receipts, Deliveries, and Internal Transfers." },
    { icon: HistoryIcon, title: "Audit Trail", desc: "Complete historical records of every single stock movement for total accountability." },
    { icon: Smartphone, title: "Mobile Ready", desc: "Fully responsive design that works perfectly on tablets and mobile devices." },
    { icon: Moon, title: "Dark Mode", desc: "Built-in dark mode support for comfortable usage during night shifts." }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-5xl bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why StockMaster?</h2>
            <p className="text-primary-600 dark:text-primary-400 font-medium">Built for modern logistics</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {features.map((f, idx) => (
               <div 
                 key={idx} 
                 className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:bg-white dark:hover:bg-gray-750 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:shadow-lg group"
                 style={{ animationDelay: `${idx * 100}ms` }}
               >
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                     <f.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
               </div>
             ))}
          </div>

          {/* Mission Section */}
          <div className="mt-12 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-8 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Ready to transform your inventory?</h3>
                <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                   Join thousands of warehouse managers who have switched to StockMaster for a more efficient, secure, and smarter supply chain.
                </p>
                <button 
                  onClick={onLogin}
                  className="px-8 py-3 bg-white text-primary-600 font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all"
                >
                   Start Your Journey
                </button>
             </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
