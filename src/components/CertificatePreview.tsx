import React, { useRef, useState, useEffect } from 'react';
import { Shield, Printer, Copy, Check, Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { type Certificate, useCertificates } from '../context/CertificateContext';

interface CertificatePreviewProps {
  certificate: Certificate;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ certificate }) => {
  const { addLog } = useCertificates();
  
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Generate dynamic QR Code encoding the public verification URL
  useEffect(() => {
    const generateQR = async () => {
      try {
        const verifyUrl = `${window.location.origin}/?tab=verify&id=${certificate.id}`;
        // Generate high resolution QR Data URL
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: 150,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(dataUrl);
      } catch (err) {
        console.error("QR Code generation error", err);
      }
    };

    generateQR();
  }, [certificate.id]);

  const handlePrint = () => {
    addLog('Certificate Printed', `Triggered print dialog for Certificate: ${certificate.id}`, 'info');
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.hash);
    setCopied(true);
    addLog('Hash Copied', `Copied hash for Certificate ID: ${certificate.id}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_Code_${certificate.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('QR Code Downloaded', `Downloaded QR PNG card for ID: ${certificate.id}`, 'info');
  };

  // Canvas drawing exporter to pack certificate details into a high-res image file download
  const handleExportPNG = async () => {
    setIsExporting(true);
    addLog('Export Initiated', `Rendering Canvas package for ID: ${certificate.id}`, 'info');

    const canvas = document.createElement('canvas');
    canvas.width = 1800; // 2x dimensions for high quality print resolution
    canvas.height = 1260;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    // 1. Draw Plain White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw outer double Gold Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 32;
    ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);
    
    ctx.strokeStyle = '#b8972e';
    ctx.lineWidth = 4;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

    // 3. Draw Watermark circles background
    ctx.fillStyle = 'rgba(212, 175, 55, 0.02)';
    for (let r = 80; r < canvas.height - 80; r += 48) {
      for (let c = 80; c < canvas.width - 80; c += 48) {
        ctx.beginPath();
        ctx.arc(c, r, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Header Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    
    ctx.font = 'bold 36px Times New Roman, serif';
    ctx.fillText((certificate.institutionName ?? 'National Institute of Technology').toUpperCase(), canvas.width / 2, 180);
    
    ctx.font = 'bold uppercase 16px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('OFFICE OF THE REGISTRAR • ACADEMIC DIVISION', canvas.width / 2, 220);

    // 5. Body Text
    ctx.font = 'italic 52px Georgia, serif';
    ctx.fillStyle = '#b45309'; // amber-700
    ctx.fillText('Certificate of Graduation', canvas.width / 2, 350);

    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('This is to certify that', canvas.width / 2, 420);

    // Student Name
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(certificate.studentName, canvas.width / 2, 490);
    
    // Line below name
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 510);
    ctx.lineTo(canvas.width / 2 + 250, 510);
    ctx.stroke();

    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('having completed the prescribed course of study and satisfied all academic requirements', canvas.width / 2, 570);
    ctx.fillText('of the university has been admitted to the degree of', canvas.width / 2, 600);

    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(certificate.courseName, canvas.width / 2, 670);

    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('in the discipline of', canvas.width / 2, 720);

    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(certificate.department, canvas.width / 2, 770);

    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Graduated with Grade: ${certificate.grade}`, canvas.width / 2, 850);

    // 6. Signatures & Date bottom blocks
    // Left: Date
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'uppercase 16px Arial, sans-serif';
    ctx.fillText('Date of Issue', 180, 1000);
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(certificate.issueDate, 180, 1040);
    
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(180, 1015);
    ctx.lineTo(380, 1015);
    ctx.stroke();

    // Right: Signature
    ctx.textAlign = 'right';
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('Dr. R. K. Iyer', canvas.width - 180, 1000);
    
    ctx.fillStyle = '#64748b';
    ctx.font = 'uppercase 16px Arial, sans-serif';
    ctx.fillText('Registrar', canvas.width - 180, 1040);
    
    ctx.beginPath();
    ctx.moveTo(canvas.width - 380, 1015);
    ctx.lineTo(canvas.width - 180, 1015);
    ctx.stroke();

    // 7. Embed QR Code Image
    if (qrCodeUrl) {
      const qrImg = new window.Image();
      qrImg.src = qrCodeUrl;
      // Wait for image loading before drawing onto canvas
      await new Promise((resolve) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, canvas.width / 2 - 80, 930, 160, 160);
          resolve(true);
        };
      });
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText(`ID: ${certificate.id}`, canvas.width / 2, 1110);
    }

    // 8. Cryptographic hash ribbon footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Courier New, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BLOCKCERT cryptographic verification signature active', 100, 1205);
    ctx.textAlign = 'right';
    ctx.fillText(`HASH: ${certificate.hash}`, canvas.width - 100, 1205);

    // Save and download canvas
    const dataPNG = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataPNG;
    downloadLink.download = `BlockCert_${certificate.studentName.replace(/\s+/g, '_')}_${certificate.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    setIsLoading(false);
  };

  const setIsLoading = (loading: boolean) => {
    setIsExporting(loading);
  };

  return (
    <div className="space-y-6">
      {/* Control Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 glass-panel">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400 font-bold shrink-0" />
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Ledger Document Panel</span>
            <span className="text-xs font-mono text-slate-250 font-bold">{certificate.id}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyHash}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-250 text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Hash!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Hash</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-250 text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Download QR code"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download QR</span>
          </button>
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-250 text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering PNG...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Main Certificate Frame (White Academic Background) */}
      <div className="bg-slate-950 p-1 md:p-4 rounded-3xl border border-slate-800 overflow-x-auto flex justify-center">
        <div 
          ref={printRef}
          className="printable-certificate w-[900px] h-[630px] shrink-0 bg-white text-slate-900 p-12 relative flex flex-col justify-between select-none certificate-container border border-slate-200 rounded-2xl font-serif text-center"
        >
          {/* Gold Decorative Border */}
          <div className="absolute inset-4 certificate-border-outer pointer-events-none rounded">
            <div className="absolute inset-1.5 certificate-border-inner" />
          </div>

          {/* Watermark Logo/Pattern */}
          <div className="absolute inset-10 certificate-watermark pointer-events-none rounded opacity-30" />

          {/* Certificate Header */}
          <div className="mt-8 z-10">
            <div className="flex justify-center mb-3">
              {/* Embossed Crest */}
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-200 via-amber-100 to-yellow-300 border-2 border-amber-500 rounded-full shadow-inner ring-4 ring-amber-300/40">
                <Shield className="w-6 h-6 text-amber-700 fill-amber-700/10" />
              </div>
            </div>
            <h2 className="font-title text-2xl font-bold tracking-widest text-slate-800 leading-tight">
              {(certificate.institutionName ?? 'National Institute of Technology').toUpperCase()}
            </h2>
            <p className="text-[10px] tracking-[0.25em] font-sans font-extrabold uppercase text-slate-500 mt-1">
              Office of the Registrar • Academic Division
            </p>
          </div>

          {/* Certificate Body */}
          <div className="my-auto z-10 px-8">
            <h3 className="font-serif italic text-3xl text-amber-750 leading-normal">
              Certificate of Graduation
            </h3>
            <p className="text-sm font-sans tracking-wide text-slate-500 uppercase mt-4 mb-2">
              This is to certify that
            </p>
            <h4 className="font-serif text-3xl font-extrabold text-slate-900 border-b border-dashed border-slate-300 pb-2 px-12 inline-block tracking-wide">
              {certificate.studentName}
            </h4>
            <p className="text-sm font-sans tracking-wide text-slate-550 leading-relaxed max-w-2xl mx-auto mt-4">
              having completed the prescribed course of study and satisfied all academic requirements of the university has been admitted to the degree of
            </p>
            <h5 className="font-serif text-2xl font-bold text-slate-800 mt-3 leading-snug">
              {certificate.courseName}
            </h5>
            <p className="text-sm text-slate-600 italic">
              in the discipline of
            </p>
            <h6 className="font-serif text-xl font-bold text-slate-800 leading-snug">
              {certificate.department}
            </h6>
            <p className="text-xs font-sans text-slate-500 mt-3 font-semibold uppercase tracking-wider">
              Graduated with Grade: <span className="text-slate-800 font-bold font-serif italic text-sm">{certificate.grade}</span>
            </p>
          </div>

          {/* Certificate Footer / Signatures & QR Code */}
          <div className="z-10 flex justify-between items-end px-12 pb-6">
            {/* Left: Issue Date */}
            <div className="text-left w-1/3">
              <div className="text-xs font-sans text-slate-500 uppercase tracking-wider">
                Date of Issue
              </div>
              <div className="text-sm font-sans font-bold text-slate-800 mt-1 border-t border-slate-300 pt-1">
                {certificate.issueDate}
              </div>
            </div>

            {/* Center: Dynamic QR Code */}
            <div className="flex flex-col items-center justify-center">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Certificate Verification QR" 
                  className="w-20 h-20 bg-white p-1 border border-slate-200 rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-100 flex items-center justify-center border rounded">
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              )}
              <span className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-widest mt-1">
                ID: {certificate.id}
              </span>
            </div>

            {/* Right: Signatures */}
            <div className="text-right w-1/3 flex flex-col items-end">
              <div className="font-serif italic text-lg text-slate-700 pr-4 select-none mb-0.5">
                Dr. R. K. Iyer
              </div>
              <div className="text-xs font-sans text-slate-500 uppercase tracking-wider border-t border-slate-300 pt-1 w-3/4 text-center">
                Registrar
              </div>
            </div>
          </div>

          {/* Cryptographic Signature & Hash Ribbon */}
          <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between border-t border-slate-100 pt-1 px-4 z-10 text-[9px] font-mono text-slate-400 bg-white">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>BLOCKCERT cryptographic ledger registry verification signature</span>
            </span>
            <span className="max-w-[400px] truncate">
              HASH: <span className="text-slate-600 font-bold select-all">{certificate.hash}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
