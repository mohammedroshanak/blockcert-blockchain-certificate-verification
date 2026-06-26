import React, { useState, useRef } from 'react';
import { 
  Award, 
  LayoutDashboard, 
  FilePlus, 
  Database, 
  Search, 
  AlertTriangle, 
  GitFork, 
  Layers, 
  LogOut, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Menu,
  X,
  Camera,
  Network
} from 'lucide-react';
import { CertificateProvider, useCertificates } from './context/CertificateContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { CertificateForm } from './components/CertificateForm';
import { CertificateRegistry } from './components/CertificateRegistry';
import { VerificationPortal } from './components/VerificationPortal';
import { TamperDetection } from './components/TamperDetection';
import { ArchitectureView } from './components/ArchitectureView';
import { BlockchainRoadmap } from './components/BlockchainRoadmap';


// Phase 2 New Components
import { QRScanner } from './components/QRScanner';
import { BlockchainExplorer } from './components/BlockchainExplorer';


// Subcomponent to extract and use Certificates context
const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, logout, addLog } = useCertificates();
  const [currentTab, setCurrentTab] = useState('verify'); // Default to Verify by ID
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Validate configuration on application startup
  const isContractConfigured = 
    import.meta.env.VITE_CONTRACT_ADDRESS && 
    !import.meta.env.VITE_CONTRACT_ADDRESS.includes('your_') && 
    import.meta.env.VITE_CONTRACT_ADDRESS !== 'your_contract_address_here';

  const isPinataConfigured = 
    import.meta.env.VITE_PINATA_API_KEY && 
    !import.meta.env.VITE_PINATA_API_KEY.includes('your_') && 
    import.meta.env.VITE_PINATA_API_KEY !== 'your_pinata_api_key';

  // References for form autofill execution across components
  const autofillCertificateFormRef = useRef<() => void>(() => {});

  const handleRegisterAutofill = (autofillFn: () => void) => {
    autofillCertificateFormRef.current = autofillFn;
  };


  const handleLogout = () => {
    logout();
    setCurrentTab('verify'); // Go back to public verification upon logout
  };

  const navItems = [
    // Public verification items
    { id: 'verify', label: 'Verify by ID', icon: <Search className="w-4 h-4" />, adminOnly: false },
    { id: 'scanner', label: 'QR Scan / Upload Portal', icon: <Camera className="w-4 h-4" />, adminOnly: false },
    { id: 'registry', label: 'Certificate Registry', icon: <Database className="w-4 h-4" />, adminOnly: false },

    // Admin-only operations
    { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, adminOnly: true },
    { id: 'generate', label: 'Generate Certificate', icon: <FilePlus className="w-4 h-4" />, adminOnly: true },
    { id: 'tamper', label: 'Tamper Sandbox', icon: <AlertTriangle className="w-4 h-4" />, adminOnly: true },
    { id: 'explorer', label: 'Blockchain Explorer', icon: <Network className="w-4 h-4" />, adminOnly: true },
    { id: 'architecture', label: 'Data Pipeline Flow', icon: <GitFork className="w-4 h-4" />, adminOnly: true },
    { id: 'roadmap', label: 'Blockchain Roadmap', icon: <Layers className="w-4 h-4" />, adminOnly: true }
  ];

  // Filter tabs based on login status & roles
  const visibleNavItems = navItems.filter(item => {
    if (!item.adminOnly) return true;
    if (!isAuthenticated) return false;
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.role === 'REGISTRAR') return true;
    if (user?.role === 'HOD') return item.id !== 'generate';
    return false;
  });

  // Render active view with role protection
  const renderActiveView = () => {
    const isAllowed = (tabId: string) => {
      const item = navItems.find(n => n.id === tabId);
      if (!item) return false;
      if (!item.adminOnly) return true;
      if (!isAuthenticated) return false;
      if (user?.role === 'SUPER_ADMIN') return true;
      if (user?.role === 'REGISTRAR') return true;
      if (user?.role === 'HOD') return item.id !== 'generate';
      return false;
    };

    if (!isAllowed(currentTab)) {
      return isAuthenticated ? <Dashboard /> : <VerificationPortal />;
    }

    switch (currentTab) {
      case 'verify':
        return <VerificationPortal />;
      case 'scanner':
        return <QRScanner />;
      case 'dashboard':
        return isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => setCurrentTab('dashboard')} />;
      case 'generate':
        return isAuthenticated ? <CertificateForm onAutofillRegister={handleRegisterAutofill} /> : <Dashboard />;
      case 'registry':
        return <CertificateRegistry />;
      case 'tamper':
        return isAuthenticated ? <TamperDetection /> : <Dashboard />;
      case 'explorer':
        return isAuthenticated ? <BlockchainExplorer /> : <Dashboard />;
      case 'architecture':
        return isAuthenticated ? <ArchitectureView /> : <Dashboard />;
      case 'roadmap':
        return isAuthenticated ? <BlockchainRoadmap /> : <Dashboard />;
      default:
        return <VerificationPortal />;
    }
  };

  // Determine current active page label
  const activeLabel = navItems.find(item => item.id === currentTab)?.label || 'Verification';

  // Checking public views permission bypass
  const isPublicTab = currentTab === 'verify' || currentTab === 'scanner' || currentTab === 'registry';

  // If not logged in and not looking at a public portal page, render Login Screen
  if (!isAuthenticated && !isPublicTab) {
    return (
      <div className="relative">
        <Login onLoginSuccess={() => setCurrentTab('dashboard')} />
        {/* Toggles to public views from login screen */}
        <div className="fixed bottom-6 left-6 z-40 flex gap-2">
          <button
            onClick={() => setCurrentTab('scanner')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 text-emerald-400 font-bold border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer text-xs"
          >
            <Camera className="w-4 h-4" />
            <span>QR Scanner Portal</span>
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-x-hidden text-slate-100">
      
      {/* Background radial accent glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-950/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sky-950/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside 
        className={`w-64 border-r border-slate-900 bg-slate-900/60 shrink-0 glass-panel flex flex-col justify-between transition-all duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'
        }`}
      >
        <div>
          {/* Brand Logo header */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-900 bg-slate-950/40">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-lg text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wider block">BLOCKCERT</span>
              <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Decentralized Web3</span>
            </div>
          </div>

          {/* Links list */}
          <nav className="p-4 space-y-1.5">
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  addLog('View Switched', `Navigated to ${item.label} view.`, 'info');
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  currentTab === item.id 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-white border border-indigo-500/20 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={currentTab === item.id ? 'text-indigo-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {currentTab === item.id && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/20 space-y-3.5">
          {/* User profile identifier */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs font-serif uppercase">
                {user?.name ? user.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-[11px] text-slate-200 block truncate">{user?.name || 'Administrator'}</span>
                <span className="text-[9px] text-slate-500 block truncate uppercase tracking-wider font-bold">
                  {user?.role?.replace('_', ' ') || 'ADMIN'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[11px] text-slate-200 block">Guest Validator</span>
                <span className="text-[10px] text-slate-500 block">Public Access</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-rose-950/20 text-slate-400 hover:text-rose-450 border border-slate-900 hover:border-rose-950/40 rounded-xl py-2 text-[10px] font-bold uppercase transition duration-150 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl py-2 text-[10px] font-bold uppercase transition duration-150 cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Login Portal</span>
            </button>
          )}

          <div className="text-[9px] text-center text-slate-650 font-bold uppercase tracking-wider">
            B.Tech CSE Project • Final Deployed Build
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 border-b border-slate-900 bg-slate-950/40 px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button (hidden on desktop) */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-slate-200 lg:hidden p-1 rounded hover:bg-slate-900"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-100 font-sans">
              {activeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Status node */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Smart Contract Integrity Online</span>
            </div>
            
            {/* Direct Verification shortcut toggle */}
            {!isAuthenticated && currentTab !== 'scanner' && (
              <button
                onClick={() => setCurrentTab('scanner')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition text-[10px] cursor-pointer"
              >
                Scan Certificate QR
              </button>
            )}
          </div>
        </header>

        {/* View Main Content Container */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-7xl mx-auto pb-16">
            {/* Startup Configuration Validation Banner */}
            {(!isContractConfigured || !isPinataConfigured) && (
              <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-amber-500/20 glass-panel flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${!isContractConfigured ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">
                      {!isContractConfigured ? 'Critical Configuration Error: Smart Contract Not Configured' : 'IPFS Gateway Alert: Pinata API Keys Missing'}
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                      {!isContractConfigured 
                        ? 'The smart contract address (VITE_CONTRACT_ADDRESS) is not set or using a placeholder. You must compile and deploy BlockCert.sol to your blockchain network and update your root .env file to enable Web3 MetaMask transactions.'
                        : 'Your Pinata IPFS keys (VITE_PINATA_API_KEY / VITE_PINATA_API_SECRET) are missing or set to placeholders. The system will gracefully fall back to a high-fidelity simulation for generating and viewing decentralized IPFS CIDs.'}
                    </p>
                  </div>
                </div>

              </div>
            )}

            {renderActiveView()}
          </div>
        </main>
      </div>


    </div>
  );
};

function App() {
  return (
    <CertificateProvider>
      <MainAppContent />
    </CertificateProvider>
  );
}

export default App;
