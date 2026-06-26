import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image, ShieldCheck, ShieldAlert, Cpu, RefreshCw, FolderOpen } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useCertificates, type Certificate } from '../context/CertificateContext';

export const QRScanner: React.FC = () => {
  const { verifyCertificateById, addLog } = useCertificates();

  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  
  // Decoding results
  const [decodingFile, setDecodingFile] = useState(false);
  const [scanResult, setScanResult] = useState<{
    performed: boolean;
    status: 'VERIFIED' | 'INVALID' | 'TAMPERED' | 'REVOKED';
    cert: Certificate | null;
    rawText?: string;
  }>({
    performed: false,
    status: 'INVALID',
    cert: null
  });

  // Reference for camera HTML5 scanner
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initializing camera scanner
  useEffect(() => {
    if (activeTab !== 'camera') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Error clearing scanner", e));
        scannerRef.current = null;
        setIsScanning(false);
      }
      return;
    }

    // Set up scanner
    const startScanner = () => {
      setScanError('');
      setIsScanning(true);

      const scanner = new Html5QrcodeScanner(
        "qr-reader-element", 
        { 
          fps: 15, 
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0
        }, 
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // Success callback
          handleQRCodeDecoded(decodedText, 'QR_Scanner');
          // Clear scanner upon detection to avoid infinite loops
          scanner.clear().catch(e => console.error(e));
          setIsScanning(false);
        },
        () => {
          // Scanning error callback (too frequent to log, suppress normal warnings)
        }
      );

      scannerRef.current = scanner;
    };

    // Small delay to ensure container element is mounted
    const timer = setTimeout(() => {
      try {
        startScanner();
      } catch (err: any) {
        setScanError('Could not access camera resources. Please verify permissions.');
        setIsScanning(false);
        console.error(err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Unmount cleanup error", e));
        scannerRef.current = null;
      }
    };
  }, [activeTab]);

  // QR Decoder Handler
  const handleQRCodeDecoded = async (text: string, method: 'QR_Scanner' | 'QR_Upload') => {
    addLog('QR Code Decoded', `Payload parsed successfully: ${text}`, 'info');
    
    // Parse ID from payload. Expected payload format: "BLOCKCERT:BC-2026-1001" or URL like "http://blockcert.edu/verify?id=BC-2026-1001"
    let certificateId = text;
    if (text.includes('id=')) {
      certificateId = text.split('id=')[1] || text;
    } else if (text.startsWith('BLOCKCERT:')) {
      certificateId = text.replace('BLOCKCERT:', '');
    }

    certificateId = certificateId.trim();
    try {
      const result = await verifyCertificateById(certificateId, method);

      setScanResult({
        performed: true,
        status: result.status,
        cert: result.cert,
        rawText: text
      });
    } catch (err) {
      console.error("QR verification error:", err);
      setScanResult({
        performed: true,
        status: 'INVALID',
        cert: null,
        rawText: text
      });
    }
  };

  // Handle file drop & upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDecodingFile(true);
    setScanError('');
    
    // Create element for file parsing container dynamically
    const dummyDiv = document.createElement('div');
    dummyDiv.id = 'qr-file-decoder-temp';
    dummyDiv.style.display = 'none';
    document.body.appendChild(dummyDiv);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-decoder-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQRCodeDecoded(decodedText, 'QR_Upload');
    } catch (err: any) {
      setScanError('QR Code not found in the uploaded image. Please try a clearer picture.');
      addLog('QR File Decode Failed', 'No QR code payload detected in uploaded file.', 'warning');
    } finally {
      document.body.removeChild(dummyDiv);
      setDecodingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setDecodingFile(true);
    setScanError('');

    const dummyDiv = document.createElement('div');
    dummyDiv.id = 'qr-file-decoder-temp';
    dummyDiv.style.display = 'none';
    document.body.appendChild(dummyDiv);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-decoder-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQRCodeDecoded(decodedText, 'QR_Upload');
    } catch (err: any) {
      setScanError('QR Code not found in the dropped image. Please try a clearer picture.');
      addLog('QR File Decode Failed', 'No QR payload detected in dropped file.', 'warning');
    } finally {
      document.body.removeChild(dummyDiv);
      setDecodingFile(false);
    }
  };

  const resetScanner = () => {
    setScanResult({ performed: false, status: 'INVALID', cert: null });
    setScanError('');
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-400" />
          <span>Advanced QR Code Verification Portal</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Verify digital certificates instantly using your camera feed or by uploading certificate images containing QR codes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Scanning Interface (Column 1-6) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 glass-panel flex flex-col justify-between min-h-[380px]">
          <div>
            {/* Scanner Tab Buttons */}
            <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4">
              <button
                onClick={() => { setActiveTab('camera'); resetScanner(); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Webcam Scanner</span>
              </button>
              <button
                onClick={() => { setActiveTab('upload'); resetScanner(); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Image className="w-4 h-4" />
                <span>Upload QR Image</span>
              </button>
            </div>

            {scanError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Camera Scanner View */}
            {activeTab === 'camera' && (
              <div className="relative">
                <div 
                  id="qr-reader-element" 
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl overflow-hidden shadow-inner text-center py-6 text-slate-500 text-xs font-semibold"
                >
                  Initializing webcam capture feed...
                </div>
                {isScanning && (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[8px] font-extrabold text-indigo-400 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                    <span>Camera Live</span>
                  </div>
                )}
              </div>
            )}

            {/* Upload File View */}
            {activeTab === 'upload' && (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 bg-slate-950/20 hover:border-indigo-500/40 rounded-xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition h-[260px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {decodingFile ? (
                  <div className="space-y-2">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <span className="text-slate-400 font-semibold text-xs block">Decoding QR code pixels...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 w-12 h-12 flex items-center justify-center mx-auto">
                      <FolderOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-slate-350 font-bold text-xs block">Drag & Drop QR Certificate Image</span>
                      <span className="text-slate-500 text-[10px] block mt-1">or click to browse local files</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-850 mt-4 leading-relaxed">
            🛡 **Integrity Note:** Decoded QR values must match the registered SHA-256 hash. If signature data has been tampered with since on-chain deployment, verification alerts will flag immediately.
          </div>
        </div>

        {/* Right Column: Verification Query Outputs (Column 7-12) */}
        <div className="lg:col-span-6 space-y-4">
          {scanResult.performed ? (
            <div className="animate-fadeIn space-y-4">
              
              {/* Scan Results Card */}
              {scanResult.status === 'VERIFIED' && scanResult.cert ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 glass-panel space-y-4">
                  <div className="flex items-center gap-3 border-b border-emerald-950/60 pb-3">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <ShieldCheck className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[8px] font-bold text-emerald-400 tracking-wide uppercase">
                        Verified authentic
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-200 mt-1">Verification Confirmation</h4>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Student Name</span>
                      <span className="text-slate-200 font-bold">{scanResult.cert.studentName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Register Number</span>
                      <span className="text-slate-200 font-mono font-bold">{scanResult.cert.registerNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Department</span>
                      <span className="text-slate-350">{scanResult.cert.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Certificate ID</span>
                      <span className="text-sky-400 font-mono font-bold">{scanResult.cert.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Issue Date</span>
                      <span className="text-slate-350 font-mono">{scanResult.cert.issueDate}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-2 items-start text-[11px] text-emerald-350 leading-normal">
                    <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p>
                      <strong>Cryptographic Match:</strong> Computed SHA-256 hash matches block transaction hash. No data manipulation detected.
                    </p>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Scan Another Certificate
                  </button>
                </div>
              ) : scanResult.status === 'REVOKED' && scanResult.cert ? (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 glass-panel space-y-4">
                  <div className="flex items-center gap-3 border-b border-rose-950/60 pb-3">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded text-[8px] font-bold text-rose-450 tracking-wide uppercase">
                        Certificate Revoked
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-200 mt-1">Certificate Revoked</h4>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Student Name</span>
                      <span className="text-slate-200 font-bold">{scanResult.cert.studentName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Register Number</span>
                      <span className="text-slate-200 font-mono font-bold">{scanResult.cert.registerNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Department</span>
                      <span className="text-slate-350">{scanResult.cert.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Certificate ID</span>
                      <span className="text-rose-400 font-mono font-bold">{scanResult.cert.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Issue Date</span>
                      <span className="text-slate-350 font-mono">{scanResult.cert.issueDate}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2 items-start text-[11px] text-rose-350 leading-normal font-semibold">
                    <ShieldAlert className="w-5 h-5 text-rose-450 shrink-0" />
                    <p>
                      This certificate was officially revoked by the issuing institution.
                    </p>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Scan Another Certificate
                  </button>
                </div>
              ) : (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 glass-panel space-y-4">
                  <div className="flex items-center gap-3 border-b border-rose-950/60 pb-3">
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded text-[8px] font-bold text-rose-450 tracking-wide uppercase">
                        {scanResult.status === 'TAMPERED' ? 'Tamper Detected' : 'Invalid Document'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-200 mt-1">Verification Failed</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal">
                    {scanResult.status === 'TAMPERED' 
                      ? 'The Certificate ID is registered in the ledger, but the calculated hash does not match the blockchain contract record. The document contents have been modified since issuance.'
                      : 'The QR code payload did not match any active certificate index keys registered in our smart contract database.'}
                  </p>

                  <div className="bg-slate-950/80 p-3.5 border border-slate-850 rounded-xl text-[10px] space-y-1">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider">Decoded payload:</span>
                    <code className="font-mono text-slate-350 break-all select-all block leading-normal">
                      {scanResult.rawText}
                    </code>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Scan/Try Again
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="border border-dashed border-slate-800 bg-slate-900/30 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[380px] glass-panel">
              <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl text-slate-500 mb-4 shadow">
                <ShieldCheck className="w-10 h-10 text-indigo-500 animate-pulse" />
              </div>
              <h4 className="text-slate-300 font-bold text-sm">Awaiting Scan Input</h4>
              <p className="text-slate-500 text-xs max-w-xs mt-1.5 leading-relaxed">
                Aim your webcam at the certificate QR code, or drag and drop a certificate image file here. The system will automatically decode and verify.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
