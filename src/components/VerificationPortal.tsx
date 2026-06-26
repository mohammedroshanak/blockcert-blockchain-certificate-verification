import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, Cpu, RefreshCw, Copy, Check, FileText } from 'lucide-react';
import { useCertificates, type Certificate } from '../context/CertificateContext';
import { CertificatePreview } from './CertificatePreview';

export const VerificationPortal: React.FC = () => {
  const { verifyCertificateById, certificates, addLog } = useCertificates();
  
  const [certId, setCertId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    performed: boolean;
    status: 'VERIFIED' | 'INVALID' | 'TAMPERED' | 'REVOKED';
    cert: Certificate | null;
  }>({
    performed: false,
    status: 'INVALID',
    cert: null
  });

  const [copied, setCopied] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setIsVerifying(true);
    try {
      const result = await verifyCertificateById(certId.trim());
      setQueryResult({
        performed: true,
        status: result.status,
        cert: result.cert
      });
    } catch (err) {
      console.error("Verification portal lookup error:", err);
      setQueryResult({
        performed: true,
        status: 'INVALID',
        cert: null
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    addLog('Hash Copied', `Copied verification hash to clipboard`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectQuickId = (id: string) => {
    setCertId(id);
    setQueryResult({ performed: false, status: 'INVALID', cert: null });
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Portal Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Public Certificate Verification Portal</h1>
        <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
          Verify the authenticity of graduation certificates issued under our authority. Input the unique Certificate ID to query the cryptographic ledger.
        </p>
      </div>

      {/* Query Search Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
            Enter Certificate Registry ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. BC-2026-1001"
                required
                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 text-slate-200 placeholder-slate-650 rounded-xl py-3 pl-10 pr-4 text-sm outline-none font-mono tracking-wider transition"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10 text-sm"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Checking Ledger...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Authenticity</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Testing Suggestions */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Quick Test IDs:</span>
          {certificates.slice(0, 3).map(c => (
            <button
              key={c.id}
              onClick={() => handleSelectQuickId(c.id)}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-sky-400 font-bold font-mono px-2.5 py-1 rounded-lg transition text-[10px] cursor-pointer"
            >
              {c.id}
            </button>
          ))}
          <button
            onClick={() => handleSelectQuickId('BC-2026-9999')}
            className="bg-slate-950 hover:bg-slate-850 border border-rose-950 text-rose-450 hover:text-rose-400 font-bold font-mono px-2.5 py-1 rounded-lg transition text-[10px] cursor-pointer"
            title="Non-existent invalid ID"
          >
            INVALID_TEST
          </button>
        </div>
      </div>

      {/* Verification Result Section */}
      {queryResult.performed && (
        <div className="space-y-6 animate-fadeIn">
          {queryResult.status === 'VERIFIED' && queryResult.cert ? (
            /* VERIFIED STATE card */
            <div className="space-y-6">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 glass-panel relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-950/60 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400">
                        <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                        <span>Certificate Status: VERIFIED</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1.5">Official Academic Certificate</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ledger Timestamp</span>
                    <span className="text-xs text-slate-350 font-mono">{queryResult.cert.timestamp}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-5 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Student Name</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Register Number</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{queryResult.cert.registerNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Program & Course</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Academic Discipline</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">University/Institution</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Grade Point</span>
                    <span className="text-sm font-bold text-slate-200 font-serif italic">{queryResult.cert.grade}</span>
                  </div>
                </div>

                {/* Hash Info bar */}
                <div className="border-t border-emerald-950/60 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-1 text-[10px]">SHA-256 Fingerprint Block</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-350 text-[11px] bg-slate-950 px-3 py-1.5 border border-slate-850 rounded-lg select-all truncate block">
                        {queryResult.cert.hash}
                      </span>
                      <button
                        onClick={() => handleCopyHash(queryResult.cert!.hash)}
                        className="text-slate-400 hover:text-slate-250 p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-lg transition shrink-0 cursor-pointer"
                        title="Copy Hash"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2.5 items-center">
                    <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-[10px] text-emerald-300 leading-normal max-w-xs">
                      The generated hash matches the ledger fingerprint. No modification has occurred.
                    </p>
                  </div>
                </div>
              </div>

              {/* White Certificate Preview Frame */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Preview Registered Document</span>
                </h4>
                <CertificatePreview certificate={queryResult.cert} />
              </div>
            </div>
          ) : queryResult.status === 'REVOKED' && queryResult.cert ? (
            /* REVOKED STATE card */
            <div className="space-y-6">
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 glass-panel relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-950/60 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl">
                      <ShieldAlert className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-450">
                        <span className="h-1.5 w-1.5 bg-rose-450 rounded-full" />
                        <span>Certificate Status: REVOKED</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1.5">This certificate was officially revoked by the issuing institution.</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ledger Timestamp</span>
                    <span className="text-xs text-slate-350 font-mono">{queryResult.cert.timestamp}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-5 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Student Name</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Register Number</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{queryResult.cert.registerNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Program & Course</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Academic Discipline</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">University/Institution</span>
                    <span className="text-sm font-bold text-slate-200">{queryResult.cert.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Grade Point</span>
                    <span className="text-sm font-bold text-slate-200 font-serif italic">{queryResult.cert.grade}</span>
                  </div>
                </div>

                {/* Hash Info bar */}
                <div className="border-t border-rose-950/60 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-1 text-[10px]">SHA-256 Fingerprint Block</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-350 text-[11px] bg-slate-950 px-3 py-1.5 border border-slate-850 rounded-lg select-all truncate block">
                        {queryResult.cert.hash}
                      </span>
                      <button
                        onClick={() => handleCopyHash(queryResult.cert!.hash)}
                        className="text-slate-400 hover:text-slate-250 p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded-lg transition shrink-0 cursor-pointer"
                        title="Copy Hash"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2.5 items-center">
                    <ShieldAlert className="w-5 h-5 text-rose-450 shrink-0" />
                    <p className="text-[10px] text-rose-350 leading-normal max-w-xs font-semibold">
                      This certificate registry record was officially revoked and invalidated on-chain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* INVALID STATE card */
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 glass-panel relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl">
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-rose-450">
                    <span className="h-1.5 w-1.5 bg-rose-450 rounded-full" />
                    <span>Certificate Status: INVALID</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1.5">Registry Lookup Failed</h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mt-1.5">
                    No verified certificate with the ID <span className="font-bold font-mono text-rose-400 bg-slate-950 px-1.5 py-0.5 rounded">{certId}</span> matches our database, or the document has failed the cryptographic hash integrity test (e.g., data tampering detected).
                  </p>
                  
                  {queryResult.cert && queryResult.cert.status === 'Tampered' && (
                    <div className="mt-4 p-3 bg-rose-950/40 border border-rose-950/60 rounded-xl text-rose-200">
                      <span className="font-bold text-white block mb-0.5 text-xs">TAMPERING REPORT:</span>
                      <p className="text-[11px] leading-normal">
                        This ID exists in the database but the active digital signature does not match the original hash. Original Hash: <code className="font-mono text-slate-300">{queryResult.cert.hash.substring(0, 16)}...</code>. The document is flagged as compromised.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
