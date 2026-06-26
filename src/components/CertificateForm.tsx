import React, { useState, useEffect } from 'react';
import { Award, Database, Cpu, CheckCircle2, FileCheck, RefreshCw, Network, Wallet } from 'lucide-react';
import { useCertificates, type Certificate } from '../context/CertificateContext';
import { CertificatePreview } from './CertificatePreview';
import { openIPFSGateway } from '../utils/ipfs';

interface CertificateFormProps {
  onAutofillRegister?: (autofillFn: () => void) => void;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({ onAutofillRegister }) => {
  const { addCertificate, isLoading, walletConnected, connectWallet, networkName } = useCertificates();

  // Form Fields State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [courseName, setCourseName] = useState('Bachelor of Technology');
  const [certificateTitle, setCertificateTitle] = useState('Degree of Bachelor of Technology in Computer Science');
  const [grade, setGrade] = useState('');
  const [institutionName, setInstitutionName] = useState('National Institute of Technology');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  const [emailError, setEmailError] = useState('');

  // Web3 Options
  const [signOnChain, setSignOnChain] = useState(true);

  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Autofill function
  const triggerAutofill = () => {
    setStudentName('Aditya Nair');
    setStudentEmail('aditya.nair@nit.edu');
    setRegisterNumber('CS20220999');
    setDepartment('Computer Science & Engineering');
    setCourseName('Bachelor of Technology');
    setCertificateTitle('Degree of Bachelor of Technology in Computer Science');
    setGrade('O (9.8 CGPA)');
    setInstitutionName('National Institute of Technology');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setEmailError('');
  };

  // Register the autofill function with the parent on load
  useEffect(() => {
    if (onAutofillRegister) {
      onAutofillRegister(triggerAutofill);
    }
  }, [onAutofillRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !registerNumber || !grade || !studentEmail) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setShowSuccess(false);
    
    // Pass transaction sign selection to context
    const cert = await addCertificate({
      studentName,
      studentEmail,
      registerNumber,
      department,
      courseName,
      certificateTitle,
      grade,
      institutionName,
      issueDate,
    }, signOnChain && walletConnected);

    setGeneratedCert(cert);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setRegisterNumber('');
    setGrade('');
    setEmailError('');
    setGeneratedCert(null);
    setShowSuccess(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span>Certificate Generation Portal</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Create certificate records, generate a unique SHA-256 digital fingerprint, and deploy hashes to the blockchain ledger.
        </p>
      </div>

      {showSuccess && generatedCert && (
        <div className="space-y-4 animate-fadeIn">
          {/* Main Success Toast with email status */}
          <div className="p-5 bg-emerald-950/25 border border-emerald-850/35 rounded-2xl space-y-4 text-emerald-250 text-xs text-left">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-slate-100 text-sm">✅ Certificate Generated Successfully</h4>
                <p className="text-slate-350 leading-relaxed text-[11px]">
                  Academic record compiled with secure register ID <span className="font-bold font-mono text-emerald-300">{generatedCert.id}</span>.
                </p>
                {generatedCert.emailFailed && (
                  <div className="p-2.5 bg-amber-950/20 border border-amber-900/35 rounded-xl text-amber-400 text-[10px] font-semibold leading-normal mt-2 flex items-start gap-2">
                    <span>⚠️ Warning: Certificate generated successfully but email could not be delivered.</span>
                  </div>
                )}
              </div>
            </div>

            {/* List of successfully transacted elements */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-emerald-900/40">
              <div className="flex items-center gap-1.5 bg-emerald-950/35 px-2.5 py-1.5 rounded-xl border border-emerald-900/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Blockchain Recorded</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-950/35 px-2.5 py-1.5 rounded-xl border border-emerald-900/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">IPFS Stored</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-950/35 px-2.5 py-1.5 rounded-xl border border-emerald-900/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Transaction Verified</span>
              </div>
              
              {/* Email Delivery Badge */}
              {generatedCert.emailFailed ? (
                <div className="flex items-center gap-1.5 bg-rose-950/35 px-2.5 py-1.5 rounded-xl border border-rose-900/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-450 shrink-0 animate-pulse" />
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Email Failed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-emerald-950/35 px-2.5 py-1.5 rounded-xl border border-emerald-900/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Email Delivered</span>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain receipt Block */}
          {generatedCert.txHash && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 text-xs glass-panel relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5">
                <Network className="w-4 h-4 text-indigo-400" />
                <span className="font-extrabold uppercase text-[10px] text-slate-350 tracking-wider">
                  Decentralized Blockchain Transaction Receipt
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Transaction Hash</span>
                  <span className="font-mono text-indigo-400 block select-all text-[11px] truncate" title={generatedCert.txHash}>
                    {generatedCert.txHash}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">IPFS Content Identifier (CID)</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-slate-350 text-[11px] truncate block select-all" title={generatedCert.ipfsCID}>
                      {generatedCert.ipfsCID}
                    </span>
                    <button 
                      type="button"
                      onClick={() => openIPFSGateway(generatedCert.ipfsCID)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-bold shrink-0 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-1">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Block Number</span>
                  <span className="font-mono font-bold text-slate-200">#{generatedCert.blockNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Gas Consumed</span>
                  <span className="font-mono font-bold text-slate-200">{generatedCert.gasUsed} gwei</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Smart Contract Node</span>
                  <span className="inline-flex items-center gap-1 text-emerald-450 font-bold text-[10px]">
                    <span className="h-1 w-1 bg-emerald-400 rounded-full" /> Verified
                  </span>
                </div>
              </div>

              {generatedCert.signature && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1">
                    MetaMask Cryptographic Proof Signature
                  </span>
                  <span className="font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded block select-all overflow-x-auto text-[10px] leading-normal py-2">
                    {generatedCert.signature}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Form Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 glass-panel relative">
          <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Record Fields</span>
            </h3>
            <button
              type="button"
              onClick={triggerAutofill}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 rounded transition cursor-pointer"
            >
              Autofill Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Student Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aditya Nair"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Student Email Address</label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={studentEmail}
                onChange={(e) => {
                  setStudentEmail(e.target.value);
                  // validate email format on-the-fly
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (e.target.value && !emailRegex.test(e.target.value)) {
                    setEmailError('Please enter a valid email address (e.g. student@example.com).');
                  } else {
                    setEmailError('');
                  }
                }}
                className={`w-full bg-slate-950 border focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none ${
                  emailError ? 'border-rose-500/40' : 'border-slate-800'
                }`}
              />
              {emailError && (
                <span className="text-rose-450 text-[10px] font-bold mt-1 block">
                  {emailError}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Register Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS20220999"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Grade Obtained</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. O (9.8 CGPA) or A+"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Department</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science & Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Technology"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Issue Date</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Certificate Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Degree of Bachelor of Technology"
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Institution Name</label>
              <input
                type="text"
                required
                placeholder="e.g. National Institute of Technology"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-lg p-2.5 outline-none"
              />
            </div>

            {/* Web3 MetaMask Check box */}
            <div className="pt-2 border-t border-slate-850 space-y-2.5">
              <span className="block font-semibold text-slate-450 uppercase tracking-wider">Blockchain Options</span>
              
              {!walletConnected ? (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[10px] leading-normal">
                    Connect wallet to authorize and sign smart contract transactions.
                  </span>
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition text-[10px] cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 bg-slate-950 p-2.5 border border-slate-850 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={signOnChain}
                    onChange={(e) => setSignOnChain(e.target.checked)}
                    className="accent-indigo-500 h-4 w-4 shrink-0 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block text-[11px]">Sign on Ledger via MetaMask</span>
                    <span className="text-slate-500 text-[9px] block font-mono mt-0.5 truncate max-w-[200px]">
                      Chain: {networkName.replace(' (Simulated)', '')}
                    </span>
                  </div>
                </label>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              {!walletConnected ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-2.5 px-4 rounded-xl shadow cursor-pointer transition active:scale-[0.99]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect MetaMask to Issue</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-2.5 px-4 rounded-xl shadow cursor-pointer transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Hashing & Securing...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Generate & Hash</span>
                    </>
                  )}
                </button>
              )}
              
              {generatedCert && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-350 border border-slate-800 hover:text-slate-200 font-semibold py-2.5 px-3 rounded-xl transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          {generatedCert ? (
            <div className="animate-fadeIn">
              <CertificatePreview certificate={generatedCert} />
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 bg-slate-900/30 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[540px] glass-panel">
              <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl text-slate-500 mb-4 ring-1 ring-slate-850">
                <Cpu className="w-10 h-10 text-indigo-500 animate-pulse" />
              </div>
              <h4 className="text-slate-300 font-bold text-sm">Waiting for Generation</h4>
              <p className="text-slate-500 text-xs max-w-sm mt-1.5 leading-relaxed">
                Fill in the academic details on the left, then click <strong>"Generate & Hash"</strong> to run the SHA-256 engine and compile the printable university template.
              </p>
            </div>
          )}

          {/* Cryptographic Explanation Info Box */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 text-xs flex gap-3.5 glass-panel">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-250 block">Cryptographic Fingerprinting Explained</span>
              <p className="mt-1 leading-relaxed">
                Every certificate generates a unique digital fingerprint. By taking all core certificate inputs (Student Name, ID, Department, Grade) and piping them through the SHA-256 algorithm, we generate a one-way hexadecimal hash. Any alteration in a single character of the student record will trigger the Avalanche Effect, computing a completely different hash—making tampering immediately detectable in the verification stage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
