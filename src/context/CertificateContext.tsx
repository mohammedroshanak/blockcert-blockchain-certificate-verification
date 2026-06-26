import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { uploadToIPFS, fetchFromIPFS } from '../utils/ipfs';
import blockCertArtifact from '../abi/BlockCert.json';

const blockCertABI = blockCertArtifact.abi;

// Types
export interface Certificate {
  id: string;
  studentName: string;
  registerNumber: string;
  studentEmail?: string;
  emailFailed?: boolean;
  department: string;
  courseName: string;
  certificateTitle: string;
  grade: string;
  institutionName: string;
  issueDate: string;
  hash: string;
  timestamp: string;
  status: 'Secured' | 'Pending Sync' | 'Verified' | 'Tampered' | 'Invalid' | 'Revoked';
  ipfsCID?: string;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  signature?: string;
  signerAddress?: string;
  revocationTxHash?: string;
  revocationBlockNumber?: number;
  revokedBy?: string;
  revokedAt?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export interface BlockchainTx {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  gasUsed: string;
  certId: string;
  studentName: string;
  action: string;
  status: 'Success' | 'Failed';
}

export interface VerificationAttempt {
  id: string;
  certId: string;
  timestamp: string;
  result: 'VERIFIED' | 'INVALID' | 'TAMPERED' | 'REVOKED';
  method: 'ID' | 'QR_Scanner' | 'QR_Upload';
  checkedHash: string;
}

interface CertificateContextType {
  certificates: Certificate[];
  logs: ActivityLog[];
  blockchainTxs: BlockchainTx[];
  verificationAttempts: VerificationAttempt[];
  activeCertificate: Certificate | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // MetaMask & Web3 Status
  walletConnected: boolean;
  walletAddress: string;
  networkName: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signHashWithMetaMask: (hash: string) => Promise<string>;

  // Certificate Management
  addCertificate: (certData: Omit<Certificate, 'id' | 'hash' | 'timestamp' | 'status'> & { studentEmail: string }, signHash?: boolean) => Promise<Certificate>;
  updateCertificate: (id: string, updatedCert: Partial<Certificate>) => Promise<void>;
  verifyCertificateById: (id: string, method?: VerificationAttempt['method']) => Promise<{ status: 'VERIFIED' | 'INVALID' | 'TAMPERED' | 'REVOKED'; cert: Certificate | null }>;
  addLog: (action: string, details: string, type: ActivityLog['type']) => void;
  hashText: (text: string) => Promise<string>;
  

  // Full-Stack Auth & Sessions
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  revokeCertificate: (id: string) => Promise<void>;

  // Helpers
  generateIPFSCID: (text: string) => string;
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Web Crypto SHA-256 Hashing helper
export async function calculateSHA256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial mock data
const initialCertificatesData = [
  {
    studentName: 'Aarav Sharma',
    registerNumber: 'CS20220891',
    department: 'Computer Science & Engineering',
    courseName: 'Bachelor of Technology',
    certificateTitle: 'Degree of Bachelor of Technology in Computer Science',
    grade: 'A+ (9.2 CGPA)',
    institutionName: 'National Institute of Technology',
    issueDate: '2026-05-15',
  },
  {
    studentName: 'Ananya Iyer',
    registerNumber: 'CS20220412',
    department: 'Information Technology',
    courseName: 'Bachelor of Technology',
    certificateTitle: 'Degree of Bachelor of Technology in Information Technology',
    grade: 'O (9.6 CGPA)',
    institutionName: 'National Institute of Technology',
    issueDate: '2026-05-15',
  },
  {
    studentName: 'Rahul Verma',
    registerNumber: 'CS20220734',
    department: 'Software Engineering',
    courseName: 'Bachelor of Technology',
    certificateTitle: 'Degree of Bachelor of Technology in Software Engineering',
    grade: 'A (8.5 CGPA)',
    institutionName: 'National Institute of Technology',
    issueDate: '2026-05-20',
  }
];

// Helper to generate dynamic academic certificate PDF base64 client-side
const generateCertificatePDFBase64 = async (cert: Certificate): Promise<string> => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const width = 297;
    const height = 210;

    // Draw outer borders
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(3);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setDrawColor(184, 151, 46); // Dark Gold
    doc.setLineWidth(0.5);
    doc.rect(12, 12, width - 24, height - 24);

    // Header Institutional branding
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text(cert.institutionName.toUpperCase(), width / 2, 35, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('OFFICE OF THE REGISTRAR • ACADEMIC DIVISION', width / 2, 42, { align: 'center' });

    // Graduation Title
    doc.setFont('times', 'italic');
    doc.setFontSize(26);
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text('Certificate of Graduation', width / 2, 65, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('This is to certify that', width / 2, 78, { align: 'center' });

    // Student Name
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(cert.studentName, width / 2, 92, { align: 'center' });

    // Underline
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.setLineWidth(0.5);
    doc.line(width / 2 - 50, 96, width / 2 + 50, 96);

    // Body Context
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text('having completed the prescribed course of study and satisfied all academic requirements', width / 2, 106, { align: 'center' });
    doc.text('of the university has been admitted to the degree of', width / 2, 112, { align: 'center' });

    // Degree and Department
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(cert.courseName, width / 2, 126, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text('in the discipline of', width / 2, 133, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(cert.department, width / 2, 142, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Graduated with Grade: ${cert.grade}`, width / 2, 154, { align: 'center' });

    // Issue Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('DATE OF ISSUE', 35, 175);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(cert.issueDate, 35, 182);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(35, 177, 75, 177);

    // Registrar Signature Block
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text('Dr. R. K. Iyer', width - 75, 175);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('REGISTRAR', width - 75, 182);
    doc.line(width - 75, 177, width - 35, 177);

    // Embed QR Verification Code
    try {
      const verifyUrl = `${window.location.origin}/?tab=verify&id=${cert.id}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });
      doc.addImage(qrDataUrl, 'PNG', width / 2 - 15, 162, 30, 30);
    } catch (qrErr) {
      console.warn("Could not add QR code to PDF attachment", qrErr);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`ID: ${cert.id}`, width / 2, 195, { align: 'center' });

    // Cryptographic Hash Footer Ribbon
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('BLOCKCERT cryptographic ledger registry verification signature active', 20, 202);
    doc.text(`HASH: ${cert.hash}`, width - 20, 202, { align: 'right' });

    const outputUri = doc.output('datauristring');
    return outputUri.split(',')[1];
  } catch (pdfErr) {
    console.error("PDF generation failed:", pdfErr);
    return "";
  }
};

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Full-Stack Authentication & Session states
  const [token, setToken] = useState<string | null>(localStorage.getItem('blockcert_token'));
  const [user, setUser] = useState<any | null>(() => {
    const savedUser = localStorage.getItem('blockcert_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('blockcert_token'));

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [blockchainTxs, setBlockchainTxs] = useState<BlockchainTx[]>([]);
  const [verificationAttempts, setVerificationAttempts] = useState<VerificationAttempt[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);



  // Wallet Web3 state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkName, setNetworkName] = useState('Disconnected');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Generate V1 simulated IPFS CIDs (bafybe...)
  const generateIPFSCID = (text: string) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let hashResult = 'bafybeic';
    let sum = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    for (let i = 0; i < 35; i++) {
      const idx = (sum + i * 17) % chars.length;
      hashResult += chars[idx];
    }
    return hashResult;
  };

  // Helper to get a read-only provider (uses MetaMask if connected, otherwise falls back to local/public RPC)
  const getReadOnlyProvider = () => {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      return new ethers.BrowserProvider(ethereum);
    }
    
    // Failsafe: If the contract address is the default localhost deployment, query the local Hardhat node directly!
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (contractAddress === '0x5FbDB2315678afecb367f032d93F642f64180aa3') {
      return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    }
    
    return new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  };

  // Connect MetaMask Wallet
  const connectWallet = async () => {
    setConnectionStatus('connecting');
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const address = accounts[0];
        const network = await provider.getNetwork();
        
        let netName = 'Unknown Web3 Network';
        if (network.chainId === 1n) netName = 'Ethereum Mainnet';
        else if (network.chainId === 11155111n) netName = 'Ethereum Sepolia Testnet';
        else if (network.chainId === 5n) netName = 'Goerli Testnet';
        else if (network.chainId === 80001n) netName = 'Polygon Mumbai';
        else if (network.chainId === 137n) netName = 'Polygon Mainnet';

        setWalletAddress(address);
        setNetworkName(netName);
        setWalletConnected(true);
        setConnectionStatus('connected');
        addLog('MetaMask Wallet Connected', `Address: ${address.substring(0, 10)}... on ${netName}`, 'success');

        ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length === 0) {
            disconnectWallet();
          } else {
            setWalletAddress(newAccounts[0]);
            addLog('Wallet Account Changed', `Address: ${newAccounts[0].substring(0, 10)}...`, 'info');
          }
        });

        ethereum.on('chainChanged', () => {
          window.location.reload();
        });

      } catch (err: any) {
        setConnectionStatus('error');
        addLog('MetaMask Connection Rejected', err.message || 'User cancelled MetaMask query', 'error');
      }
    } else {
      setConnectionStatus('error');
      addLog('MetaMask Not Found', 'Please install MetaMask to use this application.', 'error');
      alert('MetaMask extension was not found. Please install MetaMask to continue.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setNetworkName('Disconnected');
    setWalletConnected(false);
    setConnectionStatus('disconnected');
    addLog('Wallet Disconnected', 'Terminated session with Web3 provider.', 'info');
  };

  const signHashWithMetaMask = async (hash: string): Promise<string> => {
    const ethereum = (window as any).ethereum;
    if (ethereum && walletAddress) {
      try {
        addLog('MetaMask Sign Prompted', `Signing payload: ${hash.substring(0, 12)}...`, 'info');
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(hash);
        addLog('MetaMask Signature Received', `Verification signature: ${signature.substring(0, 12)}...`, 'success');
        return signature;
      } catch (err: any) {
        addLog('MetaMask Signature Rejected', err.message || 'User denied hash signing', 'warning');
        throw err;
      }
    } else {
      throw new Error("MetaMask is not connected.");
    }
  };

  // JWT Backend Authentication Login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid credentials');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      localStorage.setItem('blockcert_token', data.token);
      localStorage.setItem('blockcert_user', JSON.stringify(data.user));
      
      addLog('Admin Authenticated', `Successfully logged in as ${data.user.name} (${data.user.role}).`, 'success');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Admin Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('blockcert_token');
    localStorage.removeItem('blockcert_user');
    addLog('Admin Logged Out', 'Closed administrative session.', 'info');
  };

  // On-Chain Revocation Controller
  const revokeCertificate = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum || !walletConnected || !walletAddress) {
        throw new Error("MetaMask is not connected. Please connect your wallet first.");
      }

      // 1. Instantiate contract with MetaMask signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress || contractAddress.includes('your_') || contractAddress === 'your_contract_address_here') {
        throw new Error("Contract address is not configured. Please deploy the contract first.");
      }

      const contract = new ethers.Contract(contractAddress, blockCertABI, signer);

      // 2. Prompt MetaMask smart contract transaction
      addLog('Revocation Prompted', `Invoking revokeCertificate on-chain for ${id}...`, 'warning');
      const tx = await contract.revokeCertificate(id);
      
      addLog('Revocation Submitted', `Waiting for block confirmation... Tx: ${tx.hash.substring(0, 12)}...`, 'info');
      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Failed to retrieve transaction receipt.");
      }

      const realTxHash = receipt.hash;
      const realBlock = Number(receipt.blockNumber);

      // 3. Sync revocation state to the backend database
      if (token) {
        try {
          const response = await fetch(`http://localhost:5000/api/certificates/revoke`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              id, 
              txHash: realTxHash,
              blockNumber: realBlock,
              signerAddress: signer.address
            })
          });

          if (!response.ok) {
            console.warn("Failed to sync revocation status in backend database.");
          }
        } catch (dbErr) {
          console.error("Backend database sync failed:", dbErr);
        }
      }

      // 4. Update local registry cache state
      setCertificates(prev => prev.map(c => {
        if (c.id === id) {
          return { 
            ...c, 
            status: 'Revoked', 
            revocationTxHash: realTxHash,
            revocationBlockNumber: realBlock,
            revokedBy: signer.address,
            revokedAt: new Date().toLocaleString()
          };
        }
        return c;
      }));

      // Add to transaction explorer list
      const newTx: BlockchainTx = {
        txHash: realTxHash,
        blockNumber: realBlock,
        timestamp: new Date().toLocaleString(),
        gasUsed: receipt.gasUsed.toString(),
        certId: id,
        studentName: certificates.find(c => c.id === id)?.studentName || 'N/A',
        action: 'revokeCertificate',
        status: 'Success'
      };
      setBlockchainTxs(prev => [newTx, ...prev]);

      addLog(
        'Contract Revoked',
        `Certificate ${id} successfully revoked on-chain. Tx: ${realTxHash.substring(0, 10)}...`,
        'error'
      );
      setIsLoading(false);
    } catch (error: any) {
      console.error("Revocation failed:", error);
      addLog('Revocation Failed', error.reason || error.message || 'Smart contract revocation failed', 'error');
      setIsLoading(false);
      throw error;
    }
  };



  // Helper to initialize local demo data if backend server is offline
  const initializeLocalDemoData = async () => {
    const formattedCerts: Certificate[] = [];
    const txs: BlockchainTx[] = [];
    
    let initialBlock = 18459200;

    for (let i = 0; i < initialCertificatesData.length; i++) {
      const item = initialCertificatesData[i];
      const certId = `BC-2026-${1000 + i + 1}`;
      const rawString = `${certId}|${item.studentName}|${item.registerNumber}|${item.department}|${item.grade}|${item.issueDate}`;
      const hash = await calculateSHA256(rawString);
      const ipfs = generateIPFSCID(rawString);
      const tx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const gas = (35000 + Math.floor(Math.random() * 5000)).toString();
      const block = initialBlock + i * 4;

      formattedCerts.push({
        id: certId,
        ...item,
        hash,
        timestamp: new Date(Date.now() - 3600000 * (1.5 - i * 0.3)).toLocaleString(),
        status: 'Secured',
        ipfsCID: ipfs,
        txHash: tx,
        blockNumber: block,
        gasUsed: gas,
        signerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        signature: '0x' + Array.from({length: 130}, () => Math.floor(Math.random()*16).toString(16)).join('')
      });

      txs.push({
        txHash: tx,
        blockNumber: block,
        timestamp: new Date(Date.now() - 3600000 * (1.5 - i * 0.3)).toLocaleString(),
        gasUsed: gas,
        certId: certId,
        studentName: item.studentName,
        action: 'storeCertificateHash',
        status: 'Success'
      });
    }

    setCertificates(formattedCerts);
    setBlockchainTxs(txs);
  };

  // Load Registry certificates from Backend Database (or fall back to simulated local cache)
  useEffect(() => {
    const loadRegistryData = async () => {
      setIsLoading(true);
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:5000/api/certificates', { headers });
        if (!response.ok) throw new Error('Backend registry query failed.');
        
        const data = await response.json();
        
        // Reconstruct Ethers.js transaction entries from database records
        const txs: BlockchainTx[] = data.map((c: any) => ({
          txHash: c.txHash,
          blockNumber: c.blockNumber || 18459300,
          timestamp: c.issueDate,
          gasUsed: c.gasUsed || '39120',
          certId: c.id,
          studentName: c.studentName,
          action: c.status === 'Revoked' ? 'revokeCertificate' : 'storeCertificateHash',
          status: 'Success'
        }));

        setCertificates(data);
        setBlockchainTxs(txs);
        
        // Fetch verification attempts if logged in
        if (token) {
          const verResponse = await fetch('http://localhost:5000/api/verifications', { headers });
          if (verResponse.ok) {
            const verData = await verResponse.json();
            setVerificationAttempts(verData);
          }
        }
      } catch (err) {
        console.warn('Backend database offline. Initializing local in-memory simulation.', err);
        await initializeLocalDemoData();
      } finally {
        setIsLoading(false);
      }
    };

    loadRegistryData();
  }, [token]);

  // Sync session validation on load
  useEffect(() => {
    const checkSession = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          logout();
        }
      } catch (err) {
        console.warn('Backend authentication endpoint unreachable.');
      }
    };
    checkSession();
  }, [token]);

  const addLog = (action: string, details: string, type: ActivityLog['type'] = 'info') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 80));
  };

  const addCertificate = async (
    certData: Omit<Certificate, 'id' | 'hash' | 'timestamp' | 'status'> & { studentEmail: string },
    signHash: boolean = false
  ): Promise<Certificate> => {
    setIsLoading(true);
    
    const nextIdNum = certificates.length > 0 
      ? Math.max(...certificates.map(c => parseInt(c.id.split('-')[2] || '1000'))) + 1
      : 1001;
    const certId = `BC-${new Date().getFullYear()}-${nextIdNum}`;
    
    const rawString = `${certId}|${certData.studentName}|${certData.registerNumber}|${certData.department}|${certData.grade}|${certData.issueDate}`;
    const hash = await calculateSHA256(rawString);

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum || !walletConnected || !walletAddress) {
        throw new Error("MetaMask is not connected. Please connect your wallet first.");
      }

      // 1. Upload metadata JSON to IPFS
      addLog('IPFS Upload Initiated', `Uploading certificate metadata for ${certData.studentName} to Pinata...`, 'info');
      const ipfsCID = await uploadToIPFS({
        certId,
        studentName: certData.studentName,
        registerNumber: certData.registerNumber,
        department: certData.department,
        courseName: certData.courseName,
        certificateTitle: certData.certificateTitle,
        grade: certData.grade,
        institutionName: certData.institutionName,
        issueDate: certData.issueDate
      });
      addLog('IPFS Upload Successful', `Metadata stored at CID: ${ipfsCID.substring(0, 15)}...`, 'success');

      // 2. Instantiate Ethers contract
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress || contractAddress.includes('your_') || contractAddress === 'your_contract_address_here') {
        throw new Error("Contract address is not configured. Please deploy the contract and set VITE_CONTRACT_ADDRESS in your .env file.");
      }

      const contract = new ethers.Contract(contractAddress, blockCertABI, signer);
      
      // 3. Invoke contract transaction
      addLog('MetaMask Transaction Prompted', `Invoking storeCertificateHash on-chain...`, 'info');
      const txResponse = await contract.storeCertificateHash(certId, ipfsCID, hash);
      
      addLog('Transaction Submitted', `Waiting for block confirmation... Tx: ${txResponse.hash.substring(0, 12)}...`, 'info');
      const receipt = await txResponse.wait();
      
      if (!receipt) {
        throw new Error("Failed to retrieve transaction receipt.");
      }

      const realTxHash = receipt.hash;
      const realBlock = Number(receipt.blockNumber);
      const realGas = receipt.gasUsed.toString();

      // Sign the hash with MetaMask as well if requested (for cryptographic proof)
      let signature = '';
      if (signHash) {
        try {
          signature = await signHashWithMetaMask(hash);
        } catch (e) {
          console.warn("MetaMask signature skipped or rejected:", e);
        }
      }

      const newCert: Certificate = {
        id: certId,
        studentName: certData.studentName,
        registerNumber: certData.registerNumber,
        studentEmail: certData.studentEmail,
        department: certData.department,
        courseName: certData.courseName,
        certificateTitle: certData.certificateTitle,
        grade: certData.grade,
        institutionName: certData.institutionName,
        issueDate: certData.issueDate,
        hash,
        timestamp: new Date().toLocaleString(),
        status: 'Secured',
        ipfsCID: ipfsCID,
        txHash: realTxHash,
        blockNumber: realBlock,
        gasUsed: realGas,
        signature: signature || realTxHash,
        signerAddress: walletAddress
      };

      const newTx: BlockchainTx = {
        txHash: realTxHash,
        blockNumber: realBlock,
        timestamp: new Date().toLocaleString(),
        gasUsed: realGas,
        certId: certId,
        studentName: certData.studentName,
        action: 'storeCertificateHash',
        status: 'Success'
      };

      return await packageAndSync(newCert, newTx, certData);
    } catch (error: any) {
      console.error("Blockchain transaction failed:", error);
      addLog('Transaction Failed', error.reason || error.message || 'Smart contract execution failed', 'error');
      setIsLoading(false);
      throw error;
    }
  };

  // Helper to package and finalize state + DB sync inside addCertificate
  const packageAndSync = async (newCert: Certificate, newTx: BlockchainTx, certData: any) => {
    setCertificates(prev => [newCert, ...prev]);
    setBlockchainTxs(prev => [newTx, ...prev]);
    setActiveCertificate(newCert);

    let emailFailed = false;

    // Persist to backend database & Trigger Nodemailer Email Alert (Admins Only)
    if (token) {
      try {
        // Generate PDF base64 string on the fly
        const pdfBase64 = await generateCertificatePDFBase64(newCert);

        const response = await fetch('http://localhost:5000/api/certificates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...newCert,
            studentEmail: certData.studentEmail,
            pdfBase64: pdfBase64 || undefined
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.emailFailed) {
            emailFailed = true;
            addLog('Email Delivery Failed', `Certificate registered, but email to ${certData.studentEmail} could not be delivered.`, 'warning');
          } else {
            addLog('Email Delivered', `Graduation certificate successfully emailed to ${certData.studentEmail}`, 'success');
          }
        } else {
          console.warn("Backend certificate caching API returned an error.");
        }
      } catch (dbErr) {
        console.error("Backend database sync failed:", dbErr);
      }
    }

    const updatedCert = { ...newCert, emailFailed };
    setActiveCertificate(updatedCert);

    addLog(
      'Contract Transacted',
      `Certificate ${newCert.id} securely stored on-chain. TX: ${newCert.txHash?.substring(0, 10)}... | Block #${newCert.blockNumber}`,
      'success'
    );
    setIsLoading(false);
    return updatedCert;
  };

  const updateCertificate = async (id: string, updatedFields: Partial<Certificate>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setCertificates(prev => prev.map(cert => {
      if (cert.id === id) {
        return { ...cert, ...updatedFields };
      }
      return cert;
    }));

    setIsLoading(false);
  };

  const verifyCertificateById = async (id: string, method: VerificationAttempt['method'] = 'ID'): Promise<{ status: 'VERIFIED' | 'INVALID' | 'TAMPERED' | 'REVOKED'; cert: Certificate | null }> => {
    const attemptTimestamp = new Date().toLocaleString();

    try {
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress || contractAddress.includes('your_') || contractAddress === 'your_contract_address_here') {
        throw new Error("Contract address is not configured. Please deploy the contract first.");
      }

      const provider = getReadOnlyProvider();
      const contract = new ethers.Contract(contractAddress, blockCertABI, provider);

      addLog('Ledger Query', `Querying contract for certificate ID: ${id}...`, 'info');
      const data = await contract.getCertificateData(id);
      const [ipfsHash, sha256Hash, timestamp, issuedBy] = data;

      addLog('IPFS Retrieve', `Retrieving metadata from IPFS for CID: ${ipfsHash.substring(0, 10)}...`, 'info');
      const ipfsMetadata = await fetchFromIPFS(ipfsHash);

      const rawString = `${id}|${ipfsMetadata.studentName}|${ipfsMetadata.registerNumber}|${ipfsMetadata.department}|${ipfsMetadata.grade}|${ipfsMetadata.issueDate}`;
      const computedHash = await calculateSHA256(rawString);
      const isHashMatch = computedHash === sha256Hash;
      
      // Check if certificate is revoked on-chain
      const isRevoked = await contract.revokedCertificates(id);
      
      let resultStatus: 'VERIFIED' | 'INVALID' | 'TAMPERED' | 'REVOKED' = isHashMatch ? 'VERIFIED' : 'TAMPERED';
      if (isRevoked) {
        resultStatus = 'REVOKED';
      }

      const cert: Certificate = {
        id,
        studentName: ipfsMetadata.studentName,
        registerNumber: ipfsMetadata.registerNumber,
        department: ipfsMetadata.department,
        courseName: ipfsMetadata.courseName || 'Bachelor of Technology',
        certificateTitle: ipfsMetadata.certificateTitle || 'Degree of Bachelor of Technology',
        grade: ipfsMetadata.grade,
        institutionName: ipfsMetadata.institutionName || 'National Institute of Technology',
        issueDate: ipfsMetadata.issueDate,
        hash: sha256Hash,
        timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        status: resultStatus === 'VERIFIED' ? 'Secured' : resultStatus === 'REVOKED' ? 'Revoked' : 'Tampered',
        ipfsCID: ipfsHash,
        txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''), // placeholder since view call doesn't have receipt hash directly
        signerAddress: issuedBy
      };

      const newAttempt: VerificationAttempt = {
        id: `attempt-${Date.now()}`,
        certId: id,
        timestamp: attemptTimestamp,
        result: resultStatus,
        method,
        checkedHash: computedHash
      };

      setVerificationAttempts(prev => [newAttempt, ...prev]);

      // Log verification check to database
      try {
        await fetch('http://localhost:5000/api/verifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            certId: id,
            result: resultStatus,
            method,
            checkedHash: computedHash
          })
        });
      } catch (dbErr) {
        console.warn("Failed to log verification check to backend database:", dbErr);
      }

      if (resultStatus === 'VERIFIED') {
        addLog('Certificate Verified', `ID: ${id} successfully queried and hash matched against on-chain transaction block.`, 'success');
        
        // Ensure local certificate state is populated/updated
        setCertificates(prev => {
          const exists = prev.some(c => c.id === id);
          if (!exists) {
            return [cert, ...prev];
          }
          return prev.map(c => c.id === id ? { ...c, ...cert, status: 'Secured' } : c);
        });

        return { status: 'VERIFIED', cert };
      } else if (resultStatus === 'REVOKED') {
        addLog('Certificate Revoked', `ID: ${id} was queried and flagged as officially revoked on-chain.`, 'error');
        
        // Ensure local certificate status is updated to Revoked
        setCertificates(prev => {
          const exists = prev.some(c => c.id === id);
          if (!exists) {
            return [cert, ...prev];
          }
          return prev.map(c => c.id === id ? { ...c, ...cert, status: 'Revoked' } : c);
        });

        return { status: 'REVOKED', cert };
      } else {
        addLog('Security Tamper Alert', `Verification flag triggered for Certificate ID: ${id} (Integrity check failed)`, 'error');
        
        // Mark as tampered locally
        setCertificates(prev => prev.map(c => c.id === id ? { ...c, status: 'Tampered' } : c));

        return { status: 'TAMPERED', cert };
      }

    } catch (error: any) {
      console.warn(`On-chain verification failed or reverted for ID ${id}:`, error.message || error);
      
      const newAttempt: VerificationAttempt = {
        id: `attempt-${Date.now()}`,
        certId: id,
        timestamp: attemptTimestamp,
        result: 'INVALID',
        method,
        checkedHash: 'N/A'
      };
      setVerificationAttempts(prev => [newAttempt, ...prev]);

      // Log invalid verification attempt to database
      try {
        await fetch('http://localhost:5000/api/verifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            certId: id,
            result: 'INVALID',
            method,
            checkedHash: 'N/A'
          })
        });
      } catch (dbErr) {
        console.warn("Failed to log invalid verification check to backend database:", dbErr);
      }

      addLog('Verification Failed', `Registry query failed for ID: ${id} via ${method}`, 'error');
      return { status: 'INVALID', cert: null };
    }
  };

  const hashText = async (text: string): Promise<string> => {
    return calculateSHA256(text);
  };

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        logs,
        blockchainTxs,
        verificationAttempts,
        activeCertificate,
        isLoading,
        setIsLoading,
        
        // MetaMask Web3
        walletConnected,
        walletAddress,
        networkName,
        connectionStatus,
        connectWallet,
        disconnectWallet,
        signHashWithMetaMask,

        // Certs Management
        addCertificate,
        updateCertificate,
        verifyCertificateById,
        addLog,
        hashText,
        


        // Full-Stack Auth & Sessions
        user,
        token,
        isAuthenticated,
        login,
        logout,
        revokeCertificate,
        
        // Helpers
        generateIPFSCID
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};
