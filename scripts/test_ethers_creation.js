import { network } from "hardhat";
try {
  const net = await network.create("localhost");
  console.log("Net keys:", Object.keys(net));
  if (net.ethers) {
    console.log("net.ethers exists!");
  } else {
    console.log("net.ethers is undefined, but net has keys:", Object.keys(net));
  }
} catch (error) {
  console.error("Error creating network:", error);
}
