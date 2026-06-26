import React, { useState } from 'react';
import { Network, Database, Layers, Cpu, Search, Eye, X, Check, Copy } from 'lucide-react';
import { useCertificates } from '../context/CertificateContext';
import { openIPFSGateway } from '../utils/ipfs';

export const BlockchainExplorer: React.FC = () => {
  const { blockchainTxs, certificates, addLog } = useCertificates();

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x2A9A5A41c888b144b6B098DEFb751B7401B5f6d8';

  // Selected Tx details modal
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showJSONModal, setShowJSONModal] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    addLog('Explorer Data Copied', `Copied ${type} to clipboard from explorer`, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Find transaction details
  const activeTx = blockchainTxs.find(t => t.txHash === selectedTxHash);
  const activeCert = activeTx ? certificates.find(c => c.id === activeTx.certId) : null;

  // Filter transaction search
  const filteredTxs = blockchainTxs.filter(t => 
    t.txHash.toLowerCase().includes(explorerSearch.toLowerCase()) ||
    t.certId.toLowerCase().includes(explorerSearch.toLowerCase()) ||
    t.studentName.toLowerCase().includes(explorerSearch.toLowerCase())
  );

  // Explorer Stats
  const currentBlockHeight = blockchainTxs.length > 0 ? Math.max(...blockchainTxs.map(t => t.blockNumber)) : 18459200;
  const totalTxCount = blockchainTxs.length;

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <span>Sepolia Blockchain Explorer</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Query block height indices, view gas consumption logs, and inspect on-chain certificate hashes.
        </p>
      </div>

      {/* Explorer Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-panel">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Current Block Height</span>
          <span className="text-lg font-bold text-white font-mono">{currentBlockHeight}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-panel">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Total Block Transactions</span>
          <span className="text-lg font-bold text-white font-mono">{totalTxCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-panel">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Smart Contract Address</span>
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-sky-400 font-mono truncate block hover:underline"
            title={contractAddress}
          >
            {contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}
          </a>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 glass-panel">
          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Gas Cost limit</span>
          <span className="text-lg font-bold text-indigo-400 font-mono">21,000 - 39,120</span>
        </div>
      </div>

      {/* Search explorer */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search on-chain registry by transaction hash, student name, or certificate ID..."
          value={explorerSearch}
          onChange={(e) => setExplorerSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-slate-200 placeholder-slate-650 rounded-xl py-3 pl-11 pr-4 text-xs outline-none transition"
        />
      </div>

      {/* Split Block & Transactions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Latest Blocks (Column 1-4) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 glass-panel space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Latest Blocks</span>
          </h3>

          <div className="space-y-3">
            {Array.from({ length: Math.min(5, blockchainTxs.length + 1) }).map((_, idx) => {
              const blockNum = currentBlockHeight - idx;
              // Check if we have transactions in this block
              const txsInBlock = blockchainTxs.filter(t => t.blockNumber === blockNum);
              
              return (
                <div key={idx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-900 rounded-lg text-purple-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-slate-200 block">#{blockNum}</span>
                      <span className="text-[10px] text-slate-550 block">reward: 2.01 Sepolia ETH</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-400 font-semibold font-mono">
                      {txsInBlock.length} Txs
                    </span>
                    <span className="text-[9px] text-slate-600 block mt-0.5">sec ago</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Transactions Table (Column 5-12) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
          <div className="p-5 border-b border-slate-800 bg-slate-950/20">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Contract Transactions</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tx Hash</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Block</th>
                  <th className="p-4">Payload/Student</th>
                  <th className="p-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-550 italic">
                      No matching transactions committed.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map(tx => (
                    <tr key={tx.txHash} className="hover:bg-slate-950/25 transition">
                      <td className="p-4 font-mono text-sky-400 tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setSelectedTxHash(tx.txHash)} 
                            className="hover:underline text-left cursor-pointer"
                          >
                            {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 4)}
                          </button>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-sky-400 font-bold font-sans text-[10px]"
                            title="View on Etherscan"
                          >
                            ↗
                          </a>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-400 font-semibold font-mono">
                          {tx.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">
                        #{tx.blockNumber}
                      </td>
                      <td className="p-4">
                        <div className="min-w-[120px]">
                          <span className="font-bold text-slate-200 block text-[11px]">{tx.studentName}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">ID: {tx.certId}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedTxHash(tx.txHash)}
                          className="p-1 text-sky-400 hover:text-sky-300 hover:bg-slate-800/80 rounded transition cursor-pointer"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxHash && activeTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden text-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-600" />
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <span>On-Chain Transaction Log Inspector</span>
              </h4>
              <button 
                onClick={() => setSelectedTxHash(null)} 
                className="text-slate-450 hover:text-slate-250 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Panel */}
            <div className="p-5 space-y-4 divide-y divide-slate-850">
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Transaction Hash</span>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${activeTx.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[9px] text-sky-400 hover:text-sky-350 font-bold uppercase tracking-wider hover:underline"
                  >
                    View on Etherscan
                  </a>
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 border border-slate-850 rounded-xl">
                  <span className="font-mono text-slate-300 text-[11px] block select-all truncate max-w-[400px]">
                    {activeTx.txHash}
                  </span>
                  <button 
                    onClick={() => handleCopy(activeTx.txHash, 'Transaction Hash')}
                    className="text-slate-450 hover:text-slate-250 p-1"
                  >
                    {copiedText === activeTx.txHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Committed Block</span>
                  <span className="font-mono font-bold text-slate-200 text-xs">#{activeTx.blockNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Execution Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-bold uppercase tracking-wider text-[10px]">
                    {activeTx.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Certificate Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    activeCert?.status === 'Revoked'
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}>
                    {activeCert?.status === 'Revoked' ? 'Revoked' : 'Verified'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Transaction Time</span>
                  <span className="text-slate-300 font-mono text-[11px]">{activeTx.timestamp}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Gas Consumption Limit</span>
                  <span className="text-indigo-400 font-mono font-bold text-[11px]">{activeTx.gasUsed ? activeTx.gasUsed : '39,120'} gwei</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Action Type</span>
                  <span className="text-slate-300 font-mono text-[11px]">{activeTx.action}</span>
                </div>
              </div>

              {activeCert && (
                <div className="space-y-3 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Decentralized Metadata (IPFS CID)</span>
                    <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-850 rounded-xl">
                      <span className="font-mono text-slate-400 text-[11px] truncate max-w-[360px]">
                        {activeCert.ipfsCID}
                      </span>
                      <button 
                        onClick={() => setShowJSONModal(true)}
                        className="text-xs text-sky-400 hover:text-sky-300 font-bold px-2 py-1 rounded hover:bg-slate-900 transition shrink-0 cursor-pointer"
                      >
                        View JSON
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1">SHA-256 Registered Hash</span>
                    <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-850 rounded-xl">
                      <span className="font-mono text-slate-400 text-[11px] truncate max-w-[400px]">
                        {activeCert.hash}
                      </span>
                      <button 
                        onClick={() => handleCopy(activeCert.hash, 'SHA-256 Hash')}
                        className="text-slate-450 hover:text-slate-250 p-1"
                      >
                        {copiedText === activeCert.hash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {activeCert.signerAddress && (
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Authorized Signer (MetaMask)</span>
                      <span className="font-mono text-slate-350 bg-slate-950/80 px-2.5 py-1.5 border border-slate-850 rounded-xl text-[10px] block select-all">
                        {activeCert.signerAddress}
                      </span>
                    </div>
                  )}

                  {/* Revocation Details Section */}
                  {activeCert.status === 'Revoked' && (
                    <div className="space-y-3 pt-3 border-t border-rose-950/60 bg-rose-950/5 p-3 rounded-xl">
                      <span className="text-[9px] text-rose-450 font-extrabold uppercase tracking-wider block">Revocation Metadata Registry</span>
                      
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Revocation Transaction Hash</span>
                        <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-850 rounded-xl">
                          <span className="font-mono text-rose-400 text-[11px] truncate max-w-[280px] block select-all">
                            {activeCert.revocationTxHash || 'N/A'}
                          </span>
                          {activeCert.revocationTxHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${activeCert.revocationTxHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-400 hover:text-sky-300 font-bold px-2 py-1 rounded hover:bg-slate-900 transition shrink-0"
                            >
                              Etherscan ↗
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Revocation Block Number</span>
                          <span className="font-mono font-bold text-slate-200 text-xs">
                            #{activeCert.revocationBlockNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Revocation Timestamp</span>
                          <span className="text-slate-300 font-mono text-[11px]">
                            {activeCert.revokedAt || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Revoked By Wallet</span>
                        <span className="font-mono text-slate-350 bg-slate-950/80 px-2.5 py-1.5 border border-slate-850 rounded-xl text-[10px] block select-all">
                          {activeCert.revokedBy || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-right">
              <button 
                onClick={() => setSelectedTxHash(null)} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Viewer Modal overlay */}
      {showJSONModal && activeCert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-slate-100 uppercase tracking-widest">Decentralized Metadata (JSON)</span>
              </div>
              <button 
                onClick={() => setShowJSONModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-400 leading-normal text-[11px]">
                This JSON metadata represents the permanent record of the certificate stored on the decentralized InterPlanetary File System (IPFS).
              </p>
              
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl font-mono text-left text-indigo-300 overflow-x-auto whitespace-pre-wrap select-all max-h-[300px]">
                {JSON.stringify({
                  certId: activeCert.id,
                  studentName: activeCert.studentName,
                  registerNumber: activeCert.registerNumber,
                  department: activeCert.department,
                  courseName: activeCert.courseName,
                  certificateTitle: activeCert.certificateTitle || `Degree of Bachelor of Technology in ${activeCert.department}`,
                  grade: activeCert.grade,
                  institutionName: activeCert.institutionName || 'National Institute of Technology',
                  issueDate: activeCert.issueDate
                }, null, 2)}
              </div>

              <div className="flex items-center justify-between bg-slate-950/50 p-3 border border-slate-850 rounded-xl text-[10px]">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">IPFS CID:</span>
                <span className="font-mono text-slate-300 truncate max-w-[280px]">{activeCert.ipfsCID}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <button 
                type="button"
                onClick={() => openIPFSGateway(activeCert.ipfsCID!)}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold px-3 py-2 rounded-xl border border-sky-500/20 hover:bg-sky-500/5 transition cursor-pointer"
              >
                Open in IPFS Gateway ↗
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const jsonStr = JSON.stringify({
                      certId: activeCert.id,
                      studentName: activeCert.studentName,
                      registerNumber: activeCert.registerNumber,
                      department: activeCert.department,
                      courseName: activeCert.courseName,
                      certificateTitle: activeCert.certificateTitle || `Degree of Bachelor of Technology in ${activeCert.department}`,
                      grade: activeCert.grade,
                      institutionName: activeCert.institutionName || 'National Institute of Technology',
                      issueDate: activeCert.issueDate
                    }, null, 2);
                    handleCopy(jsonStr, 'Metadata JSON');
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold px-4 py-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
                <button 
                  onClick={() => setShowJSONModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
