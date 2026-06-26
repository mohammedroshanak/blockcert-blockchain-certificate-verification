import hre from "hardhat";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Helper to calculate SHA-256 in Node.js
function calculateSHA256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

// Helper to upload to Pinata IPFS using native fetch
async function uploadToPinata(metadata, apiKey, apiSecret) {
  if (!apiKey || !apiSecret || apiKey.includes("your_") || apiSecret.includes("your_")) {
    console.warn("⚠️ Pinata API keys missing. Falling back to simulated CID.");
    return null;
  }
  
  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "pinata_api_key": apiKey,
        "pinata_secret_api_key": apiSecret
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `BlockCert_${metadata.registerNumber}.json`
        }
      })
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Pinata request failed with status: ${response.status}. Falling back to simulated CID.`);
      return null;
    }
    
    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.warn("⚠️ Pinata upload error:", error.message, ". Falling back to simulated CID.");
    return null;
  }
}

// Fallback IPFS CID generator
function generateSimulatedCID(text) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hashResult = 'bafybeic';
  let sum = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < 35; i++) {
    const idx = (sum + i * 17) % chars.length;
    hashResult += chars[idx];
  }
  return hashResult;
}

const initialCertificates = [
  {
    certId: "BC-2026-1001",
    studentName: "Aarav Sharma",
    registerNumber: "CS20220891",
    department: "Computer Science & Engineering",
    courseName: "Bachelor of Technology",
    certificateTitle: "Degree of Bachelor of Technology in Computer Science",
    grade: "A+ (9.2 CGPA)",
    institutionName: "National Institute of Technology",
    issueDate: "2026-05-15"
  },
  {
    certId: "BC-2026-1002",
    studentName: "Ananya Iyer",
    registerNumber: "CS20220412",
    department: "Information Technology",
    courseName: "Bachelor of Technology",
    certificateTitle: "Degree of Bachelor of Technology in Information Technology",
    grade: "O (9.6 CGPA)",
    institutionName: "National Institute of Technology",
    issueDate: "2026-05-15"
  },
  {
    certId: "BC-2026-1003",
    studentName: "Rahul Verma",
    registerNumber: "CS20220734",
    department: "Software Engineering",
    courseName: "Bachelor of Technology",
    certificateTitle: "Degree of Bachelor of Technology in Software Engineering",
    grade: "A (8.5 CGPA)",
    institutionName: "National Institute of Technology",
    issueDate: "2026-05-20"
  }
];

async function main() {
  // Parse network from command line args
  let networkName = "localhost";
  const netIdx = process.argv.indexOf("--network");
  if (netIdx !== -1 && netIdx + 1 < process.argv.length) {
    networkName = process.argv[netIdx + 1];
  }

  console.log(`🚀 Starting BlockCert contract deployment on network: ${networkName}...`);
  
  const net = await hre.network.create(networkName);
  const { ethers } = net;
  
  const BlockCert = await ethers.getContractFactory("BlockCert");
  const contract = await BlockCert.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`\n✅ BlockCert contract deployed successfully! Address: ${contractAddress}`);
  
  const pinataKey = process.env.VITE_PINATA_API_KEY;
  const pinataSecret = process.env.VITE_PINATA_API_SECRET;
  
  console.log("\n📦 Pre-seeding contract with 3 default demo certificates...");
  
  for (const cert of initialCertificates) {
    const rawString = `${cert.certId}|${cert.studentName}|${cert.registerNumber}|${cert.department}|${cert.grade}|${cert.issueDate}`;
    const sha256Hash = calculateSHA256(rawString);
    
    // Attempt real Pinata upload
    let ipfsCID = await uploadToPinata(cert, pinataKey, pinataSecret);
    if (!ipfsCID) {
      ipfsCID = generateSimulatedCID(rawString);
      console.log(`ℹ️ Pre-seeded ${cert.certId} with simulated CID: ${ipfsCID}`);
    } else {
      console.log(`✅ Pre-seeded ${cert.certId} with real IPFS CID: ${ipfsCID}`);
    }
    
    // Register on the contract
    console.log(`✍️ Registering ${cert.certId} on-chain...`);
    const tx = await contract.storeCertificateHash(cert.certId, ipfsCID, sha256Hash);
    await tx.wait();
    console.log(`✅ Registered ${cert.certId}. Tx Hash: ${tx.hash}`);
  }
  
  console.log("\n🎉 Pre-seeding complete!");
  console.log(`=========================================`);
  console.log(`CONTRACT ADDRESS: ${contractAddress}`);
  console.log(`=========================================`);
  console.log(`Action required: Copy this contract address and paste it into your .env file as:`);
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
