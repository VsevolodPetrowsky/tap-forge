import { readFileSync } from "fs";
import { join } from "path";

import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  console.log("TapForge Faucet Script");
  console.log("======================");
  console.log("Network:", network.name);
  console.log("Chain ID:", chainId);
  console.log("Deployer:", deployer.address);
  console.log();

  // Load deployment addresses
  const deploymentPath = join(__dirname, `../deployments/deployment-${chainId}.json`);
  let deployment;

  try {
    deployment = JSON.parse(readFileSync(deploymentPath, "utf-8"));
  } catch (error) {
    console.error("Could not load deployment file. Please run deploy script first.");
    process.exit(1);
  }

  // Get contract instances
  const minerToken = await ethers.getContractAt("MinerToken", deployment.contracts.MinerToken);
  const minerNFT = await ethers.getContractAt("MinerNFT", deployment.contracts.MinerNFT);

  // Get recipient address from command line or use a default
  const recipient = process.argv[2] || deployer.address;

  console.log("Recipient:", recipient);
  console.log();

  // Mint tokens
  console.log("1. Minting MINE tokens...");
  const tokenAmount = ethers.parseEther("1000"); // 1000 MINE
  const tokenTx = await minerToken.mint(recipient, tokenAmount);
  await tokenTx.wait();
  console.log(`✅ Minted ${ethers.formatEther(tokenAmount)} MINE to ${recipient}`);

  // Mint NFTs
  console.log("\n2. Minting NFT miners...");

  // Mint one of each rarity
  const rarities = [
    { name: "Common", value: 0 },
    { name: "Rare", value: 1 },
    { name: "Epic", value: 2 },
    { name: "Legendary", value: 3 },
  ];

  for (const rarity of rarities) {
    const nftTx = await minerNFT.mintMiner(
      recipient,
      rarity.value,
      `${rarity.name} Miner #1`
    );
    const receipt = await nftTx.wait();

    // Get token ID from event
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = minerNFT.interface.parseLog(log);
        return parsed?.name === "MinerMinted";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsed = minerNFT.interface.parseLog(event);
      console.log(`✅ Minted ${rarity.name} miner (Token ID: ${parsed?.args[1]})`);
    }
  }

  // Display balances
  console.log("\n3. Final Balances:");
  console.log("==================");

  const tokenBalance = await minerToken.balanceOf(recipient);
  console.log(`MINE tokens: ${ethers.formatEther(tokenBalance)}`);

  const nftBalance = await minerNFT.balanceOf(recipient);
  console.log(`NFT miners: ${nftBalance.toString()}`);

  // Display owned NFTs
  if (nftBalance > 0) {
    console.log("\nOwned NFTs:");
    for (let i = 0; i < nftBalance; i++) {
      const tokenId = await minerNFT.tokenOfOwnerByIndex(recipient, i);
      const minerData = await minerNFT.getMiner(tokenId);
      const rarityName = ["Common", "Rare", "Epic", "Legendary"][Number(minerData.rarity)];
      console.log(`  - Token #${tokenId}: ${rarityName}, Power: ${minerData.power}`);
    }
  }

  console.log("\n✅ Faucet completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });