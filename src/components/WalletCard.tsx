import React, { useState } from 'react';
import { Wallet, Check, Copy, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useCertificates } from '../context/CertificateContext';

export const WalletCard: React.FC = () => {
  const { 
    walletConnected, 
    walletAddress, 
    networkName, 
    connectionStatus, 
    connectWallet, 
    disconnectWallet,
    addLog
  } = useCertificates();

  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    addLog('Address Copied', 'Copied administrator wallet address.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const isSepolia = networkName.includes('Sepolia');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden glass-panel">
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />

      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-indigo-400" />
          <span>Web3 Administrator Wallet</span>
        </h3>
        {walletConnected && (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
            Connected
          </span>
        )}
      </div>

      {!walletConnected ? (
        <div className="space-y-4 text-xs py-2">
          <p className="text-slate-400 leading-relaxed">
            Connect your MetaMask wallet to deploy credentials to the decentralized Ethereum Sepolia Testnet ledger. This authorizes signing certificates using your private keys.
          </p>
          <button
            onClick={connectWallet}
            disabled={connectionStatus === 'connecting'}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-2.5 px-4 rounded-xl shadow cursor-pointer transition active:scale-[0.99] disabled:opacity-50 text-xs uppercase tracking-wider"
          >
            {connectionStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Opening MetaMask...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connect MetaMask</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Address Display */}
          <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Wallet Address</span>
              <span className="font-mono text-slate-200 text-[11px] block select-all">
                {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
              </span>
            </div>
            <button
              onClick={handleCopyAddress}
              className="text-slate-400 hover:text-slate-250 p-1.5 bg-slate-900 border border-slate-800 rounded-lg transition cursor-pointer"
              title="Copy Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-2.5 border border-slate-850/60 rounded-xl">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Network Node</span>
              <span className="text-[11px] text-slate-200 font-semibold block truncate" title={networkName}>
                {networkName.replace(' (Simulated)', '')}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2.5 border border-slate-850/60 rounded-xl">
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Wallet Balance</span>
              <span className="text-[11px] text-indigo-400 font-bold block">
                0.245 Sepolia ETH
              </span>
            </div>
          </div>

          {/* Network Check Alert */}
          {!isSepolia && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 flex items-start gap-2.5 text-[11px] leading-normal">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> You are not on the <strong>Sepolia Testnet</strong>. Please switch networks in your MetaMask extension.
              </span>
            </div>
          )}

          {isSepolia && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Authorized Sepolia Node active. Gas estimates loaded.</span>
            </div>
          )}

          <button
            onClick={disconnectWallet}
            className="w-full bg-slate-950 hover:bg-rose-950/20 text-slate-450 hover:text-rose-400 border border-slate-850 hover:border-rose-950/40 rounded-xl py-2 font-bold uppercase transition text-[10px] cursor-pointer"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};
