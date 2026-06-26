import { network } from "hardhat";
try {
  const net = await network.connect();
  console.log("Connected net name:", net.networkName);
  console.log("Has ethers:", net.ethers !== undefined);
} catch (error) {
  console.error("Error in connect:", error);
}
