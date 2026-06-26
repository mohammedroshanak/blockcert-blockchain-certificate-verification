import { network } from "hardhat";
console.log("Network keys:", Object.keys(network));
if (network.create) {
  console.log("network.create exists!");
}
