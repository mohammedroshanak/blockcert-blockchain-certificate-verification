# BLOCKCERT – Decentralized Blockchain-Based Certificate Verification System

BLOCKCERT is a production-quality, enterprise-ready blockchain platform designed for the secure issuance, cryptographic verification, and permanent revocation of academic certificates. The platform integrates Ethereum Sepolia smart contracts, decentralized IPFS metadata storage via Pinata, MetaMask wallet authentication, a Node.js/Express backend server, a Prisma/SQLite relational registry, and a React/TypeScript frontend to create an immutable, tamper-proof global academic ledger.

---

## 🚀 Key Features

* **Admin Portal Authentication**: Secure, role-based access control (RBAC) supporting **Super Admin**, **Registrar**, and **HOD** roles, with JWT-based session state and BCrypt hashing.
* **Academic Certificate Generation**: Comprehensive metadata input (Student Name, Registration Number, Course, Grade, Date, and Student Email) with full validation.
* **SHA-256 Cryptographic Fingerprinting**: Client-side and server-side hashing using the Web Crypto API to generate unique, deterministic 64-character SHA-256 fingerprints.
* **Decentralized IPFS Storage**: Real-time upload of certificate metadata JSON packages to Pinata IPFS, returning authentic CIDv1 hashes for permanent, decentralized data availability.
* **MetaMask Web3 Integration**: Direct browser wallet connection, live network detection (Ethereum Sepolia Testnet), and automated wallet transaction signing.
* **Ethereum Sepolia Smart Contract (`BlockCert.sol`)**: An immutable global ledger storing certificate hashes, IPFS CIDs, transaction metadata, and revocation flags on-chain.
* **Certificate Revocation System**: Permanent, on-chain revocation of certificates by authorized university wallet signatures with real-time database syncing and audit logging.
* **Decentralized Verification Portal**: Public verification portal allowing third-party validators to instantly check authenticity via Certificate ID lookup, SHA-256 hash comparison, and Sepolia smart contract queries.
* **Camera QR Scanner & Upload**: Frame-by-frame webcam scanner and drag-and-drop QR image uploader using `jsQR` to instantly decode Certificate IDs and query status.
* **Custom Blockchain Explorer**: Dedicated custom explorer displaying block heights, transaction tables, gas usage, IPFS CIDs, certificate status, and authorized signer addresses.
* **Data Pipeline Flow**: Dynamic visual mapping of the system's decentralized data architecture and administrative workflows.
* **Automated Email Notifications**: Backend integration using Nodemailer SMTP to automatically dispatch high-resolution graduation certificates (PDFs and PNGs) with custom verification QR codes directly to student emails.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Framework**: React 18, TypeScript, Vite
* **Styling**: Vanilla CSS, Tailwind CSS (Utility accents)
* **Icons**: Lucide React
* **QR Decoding**: jsQR
* **Exports**: html2canvas

### Backend (Server)
* **Runtime**: Node.js, Express, TypeScript
* **ORM**: Prisma ORM
* **Database**: SQLite (local transactional registry)
* **Authentication**: JWT, BCrypt
* **Mailing**: Nodemailer (SMTP Gateway)
* **Web3/RPC Provider**: Ethers.js v6

### Smart Contract & Web3
* **Language**: Solidity (^0.8.19)
* **Framework**: Hardhat
* **Networks**: Ethereum Sepolia Testnet, Local Hardhat Network
* **Storage**: Pinata IPFS API

---

## 📁 Project Structure

```text
├── contracts/                  # Solidity Smart Contracts
│   └── BlockCert.sol           # Core Ledger & Revocation Contract
├── scripts/                    # Deployment & Seeding Scripts
│   └── deploy.cjs              # Hardhat Sepolia Deployment Script
├── src/                        # Frontend React Application
│   ├── components/             # Reusable UI Components
│   │   ├── ArchitectureView.tsx # Data Pipeline Flow View
│   │   ├── BlockchainExplorer.tsx # Custom Sepolia Explorer
│   │   ├── BlockchainRoadmap.tsx  # Current Development Status
│   │   ├── CertificateForm.tsx    # Academic Generation Engine
│   │   ├── CertificatePreview.tsx # Certificate Visualizer & Exporter
│   │   ├── CertificateRegistry.tsx # Administrative Ledger Table
│   │   ├── Dashboard.tsx          # Real-time Metrics & Logs Dashboard
│   │   ├── Login.tsx              # Secure Admin Login Portal
│   │   ├── QRScanner.tsx          # Camera & Image QR Decoder
│   │   ├── TamperDetection.tsx    # Avalanche Effect Sandbox
│   │   └── VerificationPortal.tsx # Public Search & Verify Portal
│   ├── context/                # Global React State & Web3 Context
│   │   └── CertificateContext.tsx # Context Provider
│   ├── App.tsx                 # Core Router and Layout
│   └── index.css               # Premium CSS Styles & Theme Tokens
├── server/                     # Backend API Node.js Server
│   ├── prisma/                 # Relational Database Schema
│   │   ├── schema.prisma       # SQLite Models (Certificates & Logs)
│   │   └── dev.db              # SQLite Database
│   ├── src/                    # API Controller & Routes
│   │   └── index.ts            # Server Entry point & Endpoints
│   ├── package.json            # Server Dependencies
│   └── .env                    # Server Environment Variables
├── hardhat.config.js           # Hardhat Configuration
├── package.json                # Frontend Dependencies
└── .env                        # Frontend Environment Variables
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v18 or later
* **npm**: v9 or later
* **MetaMask Extension**: Installed in your browser
* **Git**: Installed on your system

### 1. Clone & Install Dependencies
Clone the project and install packages in both the frontend and backend:

```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (frontend):
```env
# Sepolia Smart Contract Address
VITE_CONTRACT_ADDRESS=0x623b82f7b35f39f4dcEe1725A859D3699D35c277

# Pinata IPFS Keys (Optional - Falls back to high-fidelity simulation if empty)
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_API_SECRET=your_pinata_api_secret_here
```

Create a `.env` file in the `server/` directory (backend):
```env
# SQLite Database Path for Prisma
DATABASE_URL="file:./dev.db"

# JSON Web Token Secret
JWT_SECRET="your_jwt_secret_here"

# Server Port
PORT=5000

# Nodemailer SMTP Gateway Configuration (e.g. Gmail App Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
SMTP_FROM="BLOCKCERT University Registrar <your_email@gmail.com>"

# Blockchain Backend Credentials
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key"
PRIVATE_KEY="your_wallet_private_key"
VITE_CONTRACT_ADDRESS="0x623b82f7b35f39f4dcEe1725A859D3699D35c277"
```

### 3. Initialize the Database
Set up the Prisma SQLite database and run the migrations:

```bash
cd server
npx prisma db push
cd ..
```

### 4. Smart Contract Compilation & Deployment (Optional)
The contract is already pre-compiled and deployed to Sepolia at `0x623b82f7b35f39f4dcEe1725A859D3699D35c277`. If you wish to compile or re-deploy:

```bash
# Compile Solidity contract
npx hardhat compile

# Deploy to Sepolia network
npx hardhat run scripts/deploy.cjs --network sepolia
```

---

## 🏃 Running the Application

To run the full-stack system locally, open two separate terminal sessions:

### Session 1: Run the Backend Server
```bash
cd server
npm run dev
```
*The API will start running on `http://localhost:5000`.*

### Session 2: Run the Frontend Application
```bash
# From the root directory
npm run dev
```
*The Vite development server will start on `http://localhost:5173`.*

---

## 📝 Smart Contract Architecture

### `BlockCert.sol`
* **Network**: Ethereum Sepolia Testnet
* **Solidity Version**: `^0.8.19`
* **Core Functions**:
  * `storeCertificateHash(string memory certId, string memory ipfsHash, string memory sha256Hash)`: Writes the certificate metadata fingerprint and IPFS link to the blockchain.
  * `verifyCertificateHash(string memory certId, string memory sha256Hash)`: Public view function checking if the current hash matches the on-chain registry hash.
  * `getCertificateData(string memory certId)`: Retrieves the owner address, block number, IPFS hash, and revocation status.
  * `revokeCertificate(string memory certId)`: Calls the on-chain revocation mapping, permanently invalidating the certificate hash.
  * `isCertificateRevoked(string memory certId)`: View function returning the revocation status.

---

## 🧪 Verification & Audit Workflows

* **Issuance**: Admin inputs data → MetaMask prompts transaction signature → Mined on Sepolia → Saved in local SQLite DB → Sent as high-resolution PDF/PNG with a custom QR code to the student email.
* **Public Verification**: Third-party validator inputs Certificate ID or scans QR code → System queries Sepolia contract -> Validates SHA-256 fingerprint integrity -> Confirms if active or revoked.
* **Permanent Revocation**: Admin clicks "Revoke" → Prompts MetaMask Sepolia signature → Mined on-chain → DB updates immediately → Registry displays `🔴 REVOKED` and custom Explorer modal displays revocation transaction, block, signer wallet, and timestamps.
