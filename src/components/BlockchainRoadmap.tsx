import React from 'react';
import { Layers, ShieldCheck, Cpu, Key, Lock, Network, Check } from 'lucide-react';

export const BlockchainRoadmap: React.FC = () => {
  const securityImplemented = [
    {
      title: 'SHA-256 Hashing Algorithm',
      desc: 'One-way cryptographic function mapping certificate metadata to a fixed 64-character hexadecimal signature.',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Unique Registry IDs',
      desc: 'Each certificate is indexed using a deterministic format (BC-YYYY-NNNN) to prevent duplicate entries.',
      icon: <Key className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Real-time Tamper Check',
      desc: 'Client-side verification compares active data structures against saved hashes to catch edits instantly.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Solidity Role Enforcement',
      desc: 'Smart contract permission guards restrict certificate storage and revocation to the university authority.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Decentralized IPFS Storage',
      desc: 'Student metadata is archived permanently on the decentralized IPFS network, eliminating database dependency.',
      icon: <Network className="w-5 h-5 text-emerald-400" />
    }
  ];

  const securityAdvanced = [
    {
      title: 'Immutable Blockchain Ledger',
      desc: 'Cryptographic hash registry is committed to the Ethereum Sepolia network, ensuring permanent tamper resistance.',
      icon: <Network className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Role-Based Smart Contract Authorization',
      desc: 'Solidity modifier checks secure on-chain state updates, preventing unauthorized wallets from writing to the ledger.',
      icon: <Lock className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'On-Chain Certificate Revocation',
      desc: 'On-chain revocation mapping permanently invalidates certificates in real-time across the global ledger network.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'SHA-256 Integrity Verification',
      desc: 'Algorithmic matching of document contents with on-chain signatures automatically detects any data alteration.',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Decentralized IPFS Storage',
      desc: 'Pinata IPFS node clusters host the certificate metadata JSON, providing permanent, open availability.',
      icon: <Layers className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Blockchain Transaction Verification',
      desc: 'Detailed transaction history logs (gas, blocks, and signatures) are auditable via the custom block explorer.',
      icon: <Check className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Digital Wallet Authentication',
      desc: 'Administrators authorize ledger updates using MetaMask wallet keys via secure client-side signing.',
      icon: <Key className="w-5 h-5 text-emerald-400" />
    }
  ];

  const implementedFeatures = [
    "Administrator Authentication",
    "SHA-256 Certificate Fingerprinting",
    "Solidity Smart Contract Deployment",
    "Ethereum Sepolia Integration",
    "MetaMask Wallet Signing",
    "Pinata IPFS Storage",
    "Certificate Registry",
    "QR Code Verification",
    "Blockchain Explorer",
    "Tamper Detection",
    "Certificate Revocation",
    "PDF Certificate Generation",
    "Email Notification System",
    "Audit Logging"
  ];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Blockchain Architecture & Security Analysis</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Detailed overview of cryptographic assets and decentralized security integrations active on the BLOCKCERT platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Blockchain Feature Status & Timeline (Module 9) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4">
              <Network className="w-4 h-4 text-sky-400" />
              <span>IMPLEMENTED BLOCKCHAIN FEATURES</span>
            </h3>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-sky-950/20 border border-sky-800/40 rounded-xl mb-6">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">CURRENT DEVELOPMENT STATUS</span>
                <span className="text-sm font-bold text-sky-400">FINAL IMPLEMENTATION COMPLETED</span>
                <p className="text-[11px] text-slate-400 leading-normal mt-1.5">
                  The BLOCKCERT platform is fully integrated with Ethereum Sepolia, Solidity smart contracts, MetaMask wallet authentication, Pinata IPFS decentralized storage, SHA-256 certificate fingerprinting, QR verification, blockchain explorer, certificate revocation, PDF generation, audit logging, and automated email notifications.
                </p>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-xs text-emerald-400 font-bold shrink-0 self-start md:self-center">
                ETHEREUM SEPOLIA LIVE
              </span>
            </div>
          </div>

          {/* Feature List Grid */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5">
            <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 px-2.5 py-1 rounded font-extrabold uppercase block w-fit">
              ✔ Verified Ledger Integration
            </span>
            <h4 className="text-xs font-bold text-slate-200 mt-3 mb-4">Active Production Ecosystem Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-[11px] text-slate-400 font-medium">
              {implementedFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 text-[10px] font-bold">✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-[11px] text-slate-400 leading-relaxed text-center font-medium">
            BLOCKCERT is a fully implemented blockchain-based certificate verification platform integrating Ethereum Sepolia, Solidity smart contracts, MetaMask, Pinata IPFS, SHA-256 cryptographic hashing, QR-based verification, certificate revocation, blockchain explorer, audit logging, and automated email notifications. All core blockchain functionalities demonstrated in this application are operational.
          </div>
        </div>

        {/* Right: Security Checklists (Security Page) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Security Checklist (Implemented) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Security Implemented</span>
            </h3>

            <div className="space-y-3.5">
              {securityImplemented.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-slate-950/30 border border-slate-850 p-3 rounded-xl">
                  <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0 h-fit mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Checklist (Advanced) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>ADVANCED SECURITY FEATURES</span>
            </h3>

            <div className="space-y-3.5">
              {securityAdvanced.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-slate-950/30 border border-slate-850 p-3 rounded-xl">
                  <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0 h-fit mt-0.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
