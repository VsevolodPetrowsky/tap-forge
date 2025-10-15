import { writeFileSync } from "fs";
import { join } from "path";

import * as dotenv from "dotenv";
import hre from "hardhat";

const { ethers } = hre;

dotenv.config();

async function main() {
  console.log("Starting TapForge deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy MinerToken
  console.log("1. Deploying MinerToken...");
  const MinerToken = await ethers.getContractFactory("MinerToken");
  const minerToken = await MinerToken.deploy(deployer.address);
  await minerToken.waitForDeployment();
  const minerTokenAddress = await minerToken.getAddress();
  console.log("MinerToken deployed to:", minerTokenAddress);

  // Deploy MinerNFT
  console.log("\n2. Deploying MinerNFT...");
  const baseURI = process.env.NFT_BASE_URI || "https://api.tapforge.game/nft/";
  const MinerNFT = await ethers.getContractFactory("MinerNFT");
  const minerNFT = await MinerNFT.deploy(baseURI, deployer.address);
  await minerNFT.waitForDeployment();
  const minerNFTAddress = await minerNFT.getAddress();
  console.log("MinerNFT deployed to:", minerNFTAddress);

  // Deploy MinerGame
  console.log("\n3. Deploying MinerGame...");
  const MinerGame = await ethers.getContractFactory("MinerGame");
  const minerGame = await MinerGame.deploy(minerTokenAddress, minerNFTAddress);
  await minerGame.waitForDeployment();
  const minerGameAddress = await minerGame.getAddress();
  console.log("MinerGame deployed to:", minerGameAddress);

  // Setup roles and permissions
  console.log("\n4. Setting up roles and permissions...");

  // Grant MINTER_ROLE to MinerGame for MinerToken
  const MINTER_ROLE = await minerToken.MINTER_ROLE();
  await minerToken.grantRole(MINTER_ROLE, minerGameAddress);
  console.log("Granted MINTER_ROLE to MinerGame for MinerToken");

  // Grant GAME_ROLE to MinerGame for MinerNFT
  const GAME_ROLE = await minerNFT.GAME_ROLE();
  await minerNFT.grantRole(GAME_ROLE, minerGameAddress);
  console.log("Granted GAME_ROLE to MinerGame for MinerNFT");

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  const deployment = {
    network: network.name,
    chainId: chainId,
    contracts: {
      MinerToken: minerTokenAddress,
      MinerNFT: minerNFTAddress,
      MinerGame: minerGameAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  // Write deployment info to file
  const deploymentPath = join(__dirname, `../deployments/deployment-${chainId}.json`);
  writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);

  // Update .env files with contract addresses
  console.log("\n5. Contract Addresses Summary:");
  console.log("================================");
  console.log(`MINER_TOKEN_ADDRESS=${minerTokenAddress}`);
  console.log(`MINER_NFT_ADDRESS=${minerNFTAddress}`);
  console.log(`MINER_GAME_ADDRESS=${minerGameAddress}`);
  console.log("================================");
  console.log("\nPlease update your .env files with these addresses!");

  // Verify contracts on Etherscan (if API key is available)
  if (process.env.ETHERSCAN_API_KEY && chainId !== "31337") {
    console.log("\n6. Waiting for block confirmations before verification...");

    // Wait for 5 block confirmations
    await minerToken.deploymentTransaction()?.wait(5);
    await minerNFT.deploymentTransaction()?.wait(5);
    await minerGame.deploymentTransaction()?.wait(5);

    console.log("Starting contract verification...");

    try {
      await verifyContract(minerTokenAddress, [deployer.address]);
      await verifyContract(minerNFTAddress, [baseURI, deployer.address]);
      await verifyContract(minerGameAddress, [minerTokenAddress, minerNFTAddress]);
      console.log("All contracts verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error);
      console.log("You can verify manually using:");
      console.log(`npx hardhat verify --network ${network.name} ${minerTokenAddress} "${deployer.address}"`);
      console.log(`npx hardhat verify --network ${network.name} ${minerNFTAddress} "${baseURI}" "${deployer.address}"`);
      console.log(`npx hardhat verify --network ${network.name} ${minerGameAddress} "${minerTokenAddress}" "${minerNFTAddress}"`);
    }
  }

  console.log("\n✅ Deployment completed successfully!");
}

async function verifyContract(address: string, constructorArguments: any[]) {
  try {
    const { run } = await import("hardhat");
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
    console.log(`Contract ${address} verified`);
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log(`Contract ${address} is already verified`);
    } else {
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });