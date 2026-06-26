import ethersPlugin from "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";
dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/dummy-key";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const isValidHexKey = /^(0x)?[0-9a-fA-F]{64}$/.test(PRIVATE_KEY.trim());
const accounts = isValidHexKey 
  ? [PRIVATE_KEY.trim().startsWith("0x") ? PRIVATE_KEY.trim() : `0x${PRIVATE_KEY.trim()}`] 
  : [];

export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  plugins: [ethersPlugin],
  networks: {
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL,
      accounts: accounts,
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545"
    }
  },
};
