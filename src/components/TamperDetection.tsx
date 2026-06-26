import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Cpu, RefreshCw, Layers, Edit3 } from 'lucide-react';
import { useCertificates, calculateSHA256 } from '../context/CertificateContext';

export const TamperDetection: React.FC = () => {
  const { certificates, updateCertificate, addLog } = useCertificates();

  // Selected Certificate to tamper with
  const [selectedId, setSelectedId] = useState('');
  
  // Local editable form fields representing current state of document
  const [studentName, setStudentName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('');
  const [issueDate, setIssueDate] = useState('');

  // Hashing tracking
  const [originalHash, setOriginalHash] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [isComputing, setIsComputing] = useState(false);

  // Load selected certificate into local editing state
  useEffect(() => {
    if (selectedId) {
      const cert = certificates.find(c => c.id === selectedId);
      if (cert) {
        setStudentName(cert.studentName);
        setRegisterNumber(cert.registerNumber);
        setDepartment(cert.department);
        setGrade(cert.grade);
        setIssueDate(cert.issueDate);
        setOriginalHash(cert.hash);
        setCurrentHash(cert.hash);
      }
    } else if (certificates.length > 0) {
      setSelectedId(certificates[0].id);
    }
  }, [selectedId, certificates]);

  // Recalculate hash on inputs change
  useEffect(() => {
    if (!selectedId) return;

    const computeHash = async () => {
      setIsComputing(true);
      
      // Hash payload matches the original creation structure
      const rawString = `${selectedId}|${studentName}|${registerNumber}|${department}|${grade}|${issueDate}`;
      const newHash = await calculateSHA256(rawString);
      
      setCurrentHash(newHash);
      setIsComputing(false);

      // Dynamically update status in main context list for other views
      const isTampered = newHash !== originalHash;
      updateCertificate(selectedId, {
        status: isTampered ? 'Tampered' : 'Secured'
      });
    };

    const delayDebounce = setTimeout(() => {
      computeHash();
    }, 150); // Small debounce to avoid flashing during quick keystrokes

    return () => clearTimeout(delayDebounce);
  }, [studentName, registerNumber, department, grade, issueDate]);

  const handleRestore = () => {
    const cert = certificates.find(c => c.id === selectedId);
    if (cert) {
      setStudentName(cert.studentName);
      setRegisterNumber(cert.registerNumber);
      setDepartment(cert.department);
      setGrade(cert.grade);
      setIssueDate(cert.issueDate);
      addLog('Demo Restored', `Restored original data for ID: ${selectedId}`, 'info');
    }
  };

  const isTampered = currentHash !== originalHash;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-indigo-400" />
          <span>Real-time Tamper Detection Demonstration</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Select a registered certificate, modify its fields, and observe how cryptographic hashes instantly expose data manipulation.
        </p>
      </div>

      {/* Select Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Choose Certificate to Edit:
        </label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            addLog('Tamper Focus Switched', `Switched tamper target to ID: ${e.target.value}`, 'info');
          }}
          className="bg-slate-950 border border-slate-850 text-sky-400 font-mono font-bold focus:border-indigo-500 rounded-xl p-2.5 outline-none w-full sm:w-64 cursor-pointer text-xs"
        >
          {certificates.map(cert => (
            <option key={cert.id} value={cert.id}>
              {cert.id} ({cert.studentName})
            </option>
          ))}
        </select>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form Fields */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editable Document Fields</span>
            </h3>
            <button
              onClick={handleRestore}
              className="text-[10px] bg-slate-850 hover:bg-slate-800 text-indigo-400 font-bold px-2.5 py-1 rounded transition cursor-pointer"
            >
              Restore Original Data
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2 outline-none font-sans"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1">Register Number</label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1">Grade</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Hash Output & Compare */}
        <div className="space-y-6">
          {/* Live Hashing Engine Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Cryptographic Hash Engine</span>
              </span>
              {isComputing && <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />}
            </h3>

            {/* Input String display */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hashing Concatenation String</span>
              <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-450 overflow-x-auto select-all leading-normal whitespace-nowrap">
                {`${selectedId}|${studentName}|${registerNumber}|${department}|${grade}|${issueDate}`}
              </div>
            </div>

            {/* Hash Comparison Stack */}
            <div className="space-y-3 pt-1">
              {/* Original */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Original Hash (Saved on Registry)</span>
                <div className="bg-slate-950/80 p-2.5 border border-slate-850 rounded-xl font-mono text-[11px] text-emerald-400/80 break-all select-all">
                  {originalHash}
                </div>
              </div>

              {/* Current */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Computed Hash</span>
                <div className={`p-2.5 border rounded-xl font-mono text-[11px] break-all select-all transition duration-200 ${
                  isTampered 
                    ? 'bg-rose-950/20 border-rose-800/40 text-rose-400' 
                    : 'bg-slate-950 border-slate-850 text-emerald-400'
                }`}>
                  {currentHash}
                </div>
              </div>
            </div>

            {/* Verdict Alert */}
            <div className="pt-2">
              {isTampered ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-start gap-3 text-xs animate-pulse ring-1 ring-rose-500/10">
                  <AlertTriangle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-100 uppercase tracking-wider block">TAMPERING DETECTED!</span>
                    <p className="text-[11px] leading-normal text-rose-350">
                      The document hashes do not match. A change of even one letter in the student record has altered the SHA-256 fingerprint entirely. Verification will fail immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-start gap-3 text-xs ring-1 ring-emerald-500/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-100 uppercase tracking-wider block">DATA INTEGRITY VERIFIED</span>
                    <p className="text-[11px] leading-normal text-emerald-350">
                      The computed hash exactly matches the registry. This document is authenticated and secure.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Educational Explanation */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs flex gap-3 glass-panel">
            <Layers className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-250 block">The Avalanche Effect in Hashing</span>
              <p className="mt-1 leading-relaxed">
                Cryptographic hashing algorithms possess a key design feature known as the **Avalanche Effect**. If you change a single bit of the input text (e.g. changing 9.8 CGPA to 9.9 CGPA), more than half of the output bits change in an unpredictable, random-like fashion. This makes it impossible for an attacker to predict how modifications affect the hash, securing the certificate from manipulation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
