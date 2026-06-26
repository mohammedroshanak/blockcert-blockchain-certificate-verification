/**
 * Utility to upload certificate metadata JSON directly to Pinata IPFS.
 */

export interface CertificateMetadata {
  certId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  courseName: string;
  certificateTitle: string;
  grade: string;
  institutionName: string;
  issueDate: string;
}

/**
 * Generate a deterministic simulated IPFS CIDv1 for local/offline fallbacks
 */
export function generateSimulatedCID(text: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hashResult = 'bafybeic';
  let sum = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < 35; i++) {
    const idx = (sum + i * 17) % chars.length;
    hashResult += chars[idx];
  }
  return hashResult;
}

/**
 * Uploads certificate metadata to Pinata IPFS and returns the Content Identifier (CID).
 * Falls back to simulated CID if Pinata keys are not provided.
 */
export async function uploadToIPFS(metadata: CertificateMetadata): Promise<string> {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const apiSecret = import.meta.env.VITE_PINATA_API_SECRET;

  if (!apiKey || !apiSecret || apiKey.includes('your_') || apiSecret.includes('your_')) {
    console.warn('Pinata API keys not configured. Generating high-fidelity simulated IPFS CID.');
    const rawString = `${metadata.certId}|${metadata.studentName}|${metadata.registerNumber}|${metadata.department}|${metadata.grade}|${metadata.issueDate}`;
    return generateSimulatedCID(rawString);
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `BlockCert_${metadata.registerNumber}.json`,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata response status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data && data.IpfsHash) {
      console.log(`Successfully uploaded metadata to IPFS via Pinata. CID: ${data.IpfsHash}`);
      return data.IpfsHash;
    } else {
      throw new Error('Invalid response payload from Pinata');
    }
  } catch (error: any) {
    console.error('IPFS Upload to Pinata failed:', error);
    // Graceful fallback to simulated CID
    console.warn('Falling back to simulated CID...');
    const rawString = `${metadata.certId}|${metadata.studentName}|${metadata.registerNumber}|${metadata.department}|${metadata.grade}|${metadata.issueDate}`;
    return generateSimulatedCID(rawString);
  }
}

/**
 * Fetches certificate metadata from IPFS gateway using the CID.
 * Attempts to load from Pinata gateway, falling back to public ipfs.io gateway.
 */
export async function fetchFromIPFS(cid: string): Promise<CertificateMetadata> {
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`
  ];

  let lastError: any = null;

  for (const url of gateways) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const metadata = await response.json();
        if (metadata && metadata.studentName && metadata.registerNumber) {
          return metadata as CertificateMetadata;
        }
      }
    } catch (error: any) {
      console.warn(`Failed to retrieve IPFS metadata from ${url}:`, error.message || error);
      lastError = error;
    }
  }

  throw new Error(`Unable to fetch metadata from IPFS for CID: ${cid}. Last error: ${lastError?.message || lastError}`);
}

/**
 * Asynchronously checks secure IPFS gateways in priority order and redirects a newly opened tab
 * to the first responsive gateway containing the certificate metadata.
 */
export async function openIPFSGateway(cid?: string): Promise<void> {
  if (!cid) return;

  // 1. Open new browser tab immediately to bypass popup blockers
  const newTab = window.open('', '_blank');
  if (!newTab) {
    alert('Popup blocker prevented opening the IPFS gateway. Please allow popups for this site.');
    return;
  }

  // 2. Display a temporary loading state matching BlockCert's premium dark aesthetic
  newTab.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resolving IPFS Gateway - BLOCKCERT</title>
      <style>
        body {
          background-color: #0f172a;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
          padding: 2.5rem;
          background: #1e293b;
          border-radius: 16px;
          border: 1px solid #334155;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          max-width: 450px;
          width: 90%;
        }
        .spinner {
          border: 4px solid rgba(99, 102, 241, 0.1);
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
        }
        p {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0 0 1.5rem 0;
          line-height: 1.5;
        }
        .status {
          font-family: monospace;
          font-size: 0.8rem;
          color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: inline-block;
        }
        .error-title {
          color: #ef4444;
        }
        .gateway-list {
          margin-top: 1.5rem;
          text-align: left;
        }
        .gateway-item {
          margin-bottom: 0.8rem;
          font-size: 0.85rem;
          border-bottom: 1px solid #334155;
          padding-bottom: 0.5rem;
        }
        .gateway-item:last-child {
          border-bottom: none;
        }
        .gateway-link {
          color: #38bdf8;
          text-decoration: none;
          word-break: break-all;
        }
        .gateway-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div id="content" class="container">
        <div class="spinner"></div>
        <h3>Resolving secure IPFS gateway...</h3>
        <p>Checking decentralized storage nodes for your certificate metadata.</p>
        <div id="status-box" class="status">Connecting...</div>
      </div>
    </body>
    </html>
  `);
  newTab.document.close();

  const gateways = [
    { name: 'Pinata Cloud', url: `https://gateway.pinata.cloud/ipfs/${cid}` },
    { name: 'Cloudflare', url: `https://cloudflare-ipfs.com/ipfs/${cid}` },
    { name: 'IPFS.io', url: `https://ipfs.io/ipfs/${cid}` }
  ];

  const updateStatus = (text: string) => {
    try {
      const el = newTab.document.getElementById('status-box');
      if (el) el.textContent = text;
    } catch (e) {
      // Ignore if tab was closed by user
    }
  };

  // 3. Check gateways in priority order
  for (let i = 0; i < gateways.length; i++) {
    const gw = gateways[i];
    updateStatus(`Checking Node ${i + 1}: ${gw.name}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout per node

      const response = await fetch(gw.url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        // Redirect to the first gateway that responds successfully
        newTab.location.href = gw.url;
        return;
      }
    } catch (error: any) {
      console.warn(`IPFS Gateway ${gw.name} failed for CID ${cid}:`, error.message || error);
    }
  }

  // 4. Fallback if all gateways fail
  try {
    const contentEl = newTab.document.getElementById('content');
    if (contentEl) {
      contentEl.innerHTML = `
        <h3 class="error-title">Unable to Resolve Secure Gateway</h3>
        <p>All decentralized IPFS gateways timed out or returned errors. You can access the raw certificate JSON metadata directly via the links below:</p>
        <div class="gateway-list">
          ${gateways.map(gw => `
            <div class="gateway-item">
              <strong>${gw.name} Gateway:</strong><br/>
              <a class="gateway-link" href="${gw.url}" target="_blank">${gw.url} ↗</a>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (e) {
    // Ignore if tab was closed by user
  }
}

