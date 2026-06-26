import React from 'react';
import { Users, FilePlus, Cpu, Database, Search, GitFork, ArrowDown, Wallet, HardDrive, Network } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const steps = [
    {
      title: '1. Administrator Authentication',
      icon: <Users className="w-5 h-5 text-sky-400" />,
      desc: 'University administrators authenticate using secure role-based credentials before accessing certificate management operations.',
      status: 'Implemented',
      color: 'border-sky-500/30 bg-sky-500/5 shadow-sky-500/5 text-sky-400'
    },
    {
      title: '2. Certificate Generation',
      icon: <FilePlus className="w-5 h-5 text-indigo-400" />,
      desc: 'Student information is validated and transformed into a standardized academic certificate with a unique Certificate ID.',
      status: 'Implemented',
      color: 'border-indigo-500/30 bg-indigo-500/5 shadow-indigo-500/5 text-indigo-400'
    },
    {
      title: '3. SHA-256 Fingerprinting',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: 'Certificate metadata is converted into a unique SHA-256 cryptographic fingerprint to guarantee integrity and detect tampering.',
      status: 'Implemented',
      color: 'border-purple-500/30 bg-purple-500/5 shadow-purple-500/5 text-purple-400'
    },
    {
      title: '4. Registry Synchronization',
      icon: <Database className="w-5 h-5 text-teal-400" />,
      desc: 'Certificate details, SHA-256 hash, IPFS CID, blockchain transaction hash, and issuance metadata are securely synchronized with the backend registry database.',
      status: 'Implemented',
      color: 'border-teal-500/30 bg-teal-500/5 shadow-teal-500/5 text-teal-400'
    },
    {
      title: '5. Pinata IPFS Storage',
      icon: <HardDrive className="w-5 h-5 text-cyan-400" />,
      desc: 'Certificate metadata is uploaded to Pinata and permanently stored on the InterPlanetary File System (IPFS). The generated CID provides decentralized access to certificate metadata.',
      status: 'Implemented',
      color: 'border-cyan-500/30 bg-cyan-500/5 shadow-cyan-500/5 text-cyan-400'
    },
    {
      title: '6. MetaMask Wallet Signing',
      icon: <Wallet className="w-5 h-5 text-amber-400" />,
      desc: 'The administrator authorizes blockchain transactions using MetaMask. Ethereum wallet signatures securely validate certificate issuance and revocation requests.',
      status: 'Implemented',
      color: 'border-amber-500/30 bg-amber-500/5 shadow-amber-500/5 text-amber-400'
    },
    {
      title: '7. Ethereum Smart Contract',
      icon: <GitFork className="w-5 h-5 text-emerald-400" />,
      desc: 'The Solidity smart contract deployed on Ethereum Sepolia stores certificate hashes, IPFS CIDs, transaction metadata, and revocation status in an immutable blockchain ledger.',
      status: 'Implemented',
      color: 'border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5 text-emerald-400'
    },
    {
      title: '8. Verification Portal',
      icon: <Search className="w-5 h-5 text-rose-400" />,
      desc: 'Certificates are verified using Certificate ID, QR Code, SHA-256 fingerprint, IPFS metadata, and blockchain records to confirm authenticity and detect revoked certificates.',
      status: 'Implemented',
      color: 'border-rose-500/30 bg-rose-500/5 shadow-rose-500/5 text-rose-400'
    },
    {
      title: '9. Blockchain Explorer',
      icon: <Network className="w-5 h-5 text-violet-400" />,
      desc: 'Displays blockchain transaction details on the Ethereum Sepolia Blockchain Explorer including transaction hash, block number, gas usage, IPFS CID, certificate status, wallet address, and blockchain verification history.',
      status: 'Implemented',
      color: 'border-violet-500/30 bg-violet-500/5 shadow-violet-500/5 text-violet-400'
    }
  ];

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GitFork className="w-5 h-5 text-indigo-400" />
          <span>System Architecture & Data Pipeline</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Complete end-to-end workflow of the BLOCKCERT blockchain certificate verification platform, including SHA-256 hashing, Pinata IPFS storage, MetaMask transaction signing, Ethereum Sepolia smart contract integration, decentralized verification, blockchain explorer, and certificate revocation.
        </p>
      </div>

      {/* Implementation Phase Banner */}
      <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/25 rounded-2xl p-4">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <div>
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Full Phase Implementation Active</span>
          <p className="text-slate-400 text-[11px] mt-0.5">
            All 9 pipeline stages implemented. BlockCert.sol deployed and active on Ethereum Sepolia Testnet, integrated with MetaMask and Pinata IPFS for a fully production-ready decentralized application.
          </p>
        </div>
        <span className="ml-auto shrink-0 text-[9px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wider">
          9/9 Stages
        </span>
      </div>

      {/* Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 glass-panel space-y-6">
        <div className="text-center mb-6">
          <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
            Pipeline Visualization
          </span>
        </div>

        {/* Grid Node Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col h-full">
              {/* Card Node */}
              <div className={`flex-1 p-5 rounded-2xl border shadow-lg glass-panel transition duration-200 hover:scale-[1.01] hover:border-slate-700/80 ${step.color.split(' ')[0]} ${step.color.split(' ')[1]} ${step.color.split(' ')[2]}`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-950/60 rounded-lg">
                      {step.icon}
                    </div>
                    <span className="font-bold text-xs text-slate-200">{step.title}</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {step.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {step.desc}
                </p>
              </div>

              {/* Connecting Arrows (Mobile) */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center items-center py-3 lg:hidden">
                  <ArrowDown className="w-5 h-5 text-slate-700 animate-bounce" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Summary Footer */}
        <div className="hidden lg:block text-slate-700 text-xs text-center border border-slate-800 bg-slate-950/30 p-4 rounded-xl mt-4">
          <p className="text-slate-500 text-[11px] leading-relaxed">
            🎓 <strong>Full Academic Ledger Flow:</strong> Administrator Login → Certificate Generation → SHA-256 Fingerprinting → Upload Metadata to Pinata IPFS → Generate IPFS CID → MetaMask Wallet Signature → Ethereum Sepolia Smart Contract → Blockchain Transaction Confirmation → Backend Registry Synchronization → Certificate Registry → Verification Portal → QR Code Verification → Blockchain Explorer → Certificate Revocation (when required)
          </p>
          <p className="text-slate-650 text-[10px] mt-1.5 font-semibold uppercase tracking-wider">
            ⛓️ <strong>Smart Contract:</strong> BlockCert.sol &nbsp;|&nbsp; <strong>Network:</strong> Ethereum Sepolia Testnet &nbsp;|&nbsp; <strong>Core Functions:</strong> storeCertificateHash(), verifyCertificateHash(), getCertificateData(), revokeCertificate(), isCertificateRevoked()
          </p>
        </div>
      </div>
    </div>
  );
};
