import hre from "hardhat";
console.log("Config plugins:", hre.config.plugins);
console.log("Ethers in HRE:", hre.ethers !== undefined);
