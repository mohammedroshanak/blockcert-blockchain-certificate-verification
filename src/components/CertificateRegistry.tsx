import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Copy, Check, ShieldCheck, Eye, X, Download } from 'lucide-react';
import { useCertificates, type Certificate } from '../context/CertificateContext';
import { CertificatePreview } from './CertificatePreview';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exporters';

interface CertificateRegistryProps {
  onViewCertificate?: (cert: Certificate) => void;
}

export const CertificateRegistry: React.FC<CertificateRegistryProps> = ({ onViewCertificate }) => {
  const { certificates, user, isAuthenticated, revokeCertificate, addLog } = useCertificates();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'studentName' | 'issueDate'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  // Handle Copy Tx Hash
  const handleCopyTxHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxId(id);
    addLog('Transaction Hash Copied', `Copied transaction hash of ${id} from registry table`, 'info');
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  // Available departments for filtering
  const departments = useMemo(() => {
    const depts = new Set(certificates.map(c => c.department));
    return ['All', ...Array.from(depts)];
  }, [certificates]);

  // Handle Copy Hash
  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    addLog('Hash Copied', `Copied hash of ${id} from registry table`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Sorting
  const handleSort = (field: 'id' | 'studentName' | 'issueDate') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter and Sort certificates
  const filteredCertificates = useMemo(() => {
    return certificates
      .filter(cert => {
        // Search matches student name, registry ID, or register number
        const matchesSearch = 
          cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        // HOD department filtering failsafe for local simulation
        const matchesHODDept = !isAuthenticated || user?.role !== 'HOD' || !user?.department || cert.department === user.department;
        
        const matchesDept = selectedDept === 'All' || cert.department === selectedDept;
        const matchesStatus = selectedStatus === 'All' || cert.status === selectedStatus;
        const matchesCourse = !selectedCourse || cert.courseName.toLowerCase().includes(selectedCourse.toLowerCase());

        let matchesDate = true;
        if (startDate) {
          matchesDate = matchesDate && cert.issueDate >= startDate;
        }
        if (endDate) {
          matchesDate = matchesDate && cert.issueDate <= endDate;
        }

        return matchesSearch && matchesHODDept && matchesDept && matchesStatus && matchesCourse && matchesDate;
      })
      .sort((a, b) => {
        let valA = a[sortBy].toString().toLowerCase();
        let valB = b[sortBy].toString().toLowerCase();

        if (sortBy === 'id') {
          const numA = parseInt(a.id.split('-')[2] || '0');
          const numB = parseInt(b.id.split('-')[2] || '0');
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [certificates, searchTerm, selectedDept, selectedStatus, selectedCourse, startDate, endDate, sortBy, sortOrder, user, isAuthenticated]);

  const handleRevoke = async (certId: string) => {
    if (window.confirm(`This action permanently revokes this certificate on the blockchain.`)) {
      setIsRevoking(certId);
      try {
        await revokeCertificate(certId);
        alert(`Certificate ${certId} has been successfully revoked.`);
      } catch (err: any) {
        alert(err.message || 'Revocation failed.');
      } finally {
        setIsRevoking(null);
      }
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Academic Certificate Registry</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Browse and query the local cryptographic database containing certified academic ledger fingerprints.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 glass-panel space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by student name, registry ID, or register number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 placeholder-slate-655 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none transition"
            />
          </div>

          {/* Export Dropdown (Admins/Authenticators Only) */}
          {isAuthenticated && (
            <div className="relative shrink-0 w-full lg:w-auto">
              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full">
                <button
                  type="button"
                  onClick={() => exportToPDF(filteredCertificates)}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2.5 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportToExcel(filteredCertificates)}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2.5 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportToCSV(filteredCertificates)}
                  className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-xl transition text-xs cursor-pointer flex items-center justify-center gap-1.5 border border-slate-750"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Dept Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              disabled={isAuthenticated && user?.role === 'HOD'}
              className="bg-slate-950 border border-slate-800 text-slate-300 focus:border-indigo-500 rounded-xl p-2.5 outline-none cursor-pointer w-full disabled:opacity-50"
            >
              {isAuthenticated && user?.role === 'HOD' ? (
                <option value={user.department}>{user.department}</option>
              ) : (
                <>
                  <option value="All">All Departments</option>
                  {departments.filter(d => d !== 'All').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 focus:border-indigo-500 rounded-xl p-2.5 outline-none cursor-pointer w-full"
            >
              <option value="All">All Statuses</option>
              <option value="Secured">Secured</option>
              <option value="Tampered">Tampered</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>

          {/* Course Name Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Name</label>
            <input
              type="text"
              placeholder="Filter by course (e.g. B.Tech)..."
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 focus:border-indigo-500 placeholder-slate-650 rounded-xl p-2.5 outline-none w-full"
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 focus:border-indigo-500 rounded-xl p-2 w-full text-[10px] outline-none"
              />
              <span className="text-slate-500 font-bold text-[10px]">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 focus:border-indigo-500 rounded-xl p-2 w-full text-[10px] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold tracking-wider uppercase">
                <th 
                  onClick={() => handleSort('id')}
                  className="p-4 cursor-pointer hover:text-slate-250 select-none transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Certificate ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('studentName')}
                  className="p-4 cursor-pointer hover:text-slate-250 select-none transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="p-4">Department</th>
                <th 
                  onClick={() => handleSort('issueDate')}
                  className="p-4 cursor-pointer hover:text-slate-250 select-none transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Issue Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="p-4">SHA-256 Hash</th>
                <th className="p-4">Transaction Hash</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-550 italic">
                    No matching records found in the registry ledger.
                  </td>
                </tr>
              ) : (
                filteredCertificates.map(cert => (
                  <tr key={cert.id} className="hover:bg-slate-950/30 transition-colors duration-150">
                    <td className="p-4 font-mono font-bold text-sky-400 tracking-wider">
                      {cert.id}
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      {cert.studentName}
                    </td>
                    <td className="p-4 text-slate-400">
                      {cert.department}
                    </td>
                    <td className="p-4 text-slate-450 font-mono">
                      {cert.issueDate}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 group max-w-[180px]">
                        <span className="font-mono text-slate-400 truncate bg-slate-950/80 px-2 py-1 border border-slate-850 rounded-lg text-[11px] block select-all">
                          {cert.hash.substring(0, 12)}...
                        </span>
                        <button
                          onClick={() => handleCopyHash(cert.hash, cert.id)}
                          className="text-slate-500 hover:text-slate-350 p-1 rounded hover:bg-slate-850/80 transition cursor-pointer"
                          title="Copy Full Hash"
                        >
                          {copiedId === cert.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {cert.txHash ? (
                        <div className="flex items-center gap-2 group max-w-[180px]">
                          <span className="font-mono text-slate-400 truncate bg-slate-950/80 px-2 py-1 border border-slate-850 rounded-lg text-[11px] block select-all">
                            {cert.txHash.substring(0, 12)}...
                          </span>
                          <button
                            onClick={() => handleCopyTxHash(cert.txHash!, cert.id)}
                            className="text-slate-500 hover:text-slate-350 p-1 rounded hover:bg-slate-850/80 transition cursor-pointer"
                            title="Copy Transaction Hash"
                          >
                            {copiedTxId === cert.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Pending Sync</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        cert.status === 'Secured' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : cert.status === 'Tampered'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                          : cert.status === 'Revoked'
                          ? 'bg-rose-950/40 border-rose-900/65 text-rose-400'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      }`}>
                        {cert.status === 'Secured' ? '🟢 VERIFIED' : cert.status === 'Revoked' ? '🔴 REVOKED' : cert.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCert(cert);
                            if (onViewCertificate) onViewCertificate(cert);
                          }}
                          className="inline-flex items-center gap-1 bg-slate-850 hover:bg-slate-750 text-indigo-450 hover:text-indigo-400 font-bold px-2.5 py-1.5 rounded-xl border border-slate-800 transition text-[10px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'REGISTRAR') && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(cert.id)}
                            disabled={cert.status === 'Revoked' || isRevoking === cert.id}
                            className={`inline-flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-xl border transition text-[10px] cursor-pointer ${
                              cert.status === 'Revoked'
                                ? 'bg-rose-950/20 text-rose-600 border-rose-950/40 cursor-not-allowed'
                                : isRevoking === cert.id
                                ? 'bg-amber-950/40 text-amber-400 border-amber-900/60 animate-pulse'
                                : 'bg-rose-955/20 hover:bg-rose-950/40 text-rose-450 hover:text-rose-400 border-rose-900/40'
                            }`}
                          >
                            <span>{isRevoking === cert.id ? 'Revoking...' : 'Revoke'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Certificate Modal Overlay */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-2 rounded-full hover:bg-slate-800 transition z-10 cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-2 text-center">
              <CertificatePreview certificate={selectedCert} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
