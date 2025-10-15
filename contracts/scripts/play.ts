import { readFileSync } from "fs";
import { join } from "path";

import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config();

async function main() {
  const [player] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  console.log("TapForge Game Interaction Script");
  console.log("=================================");
  console.log("Network:", network.name);
  console.log("Player:", player.address);
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
  const minerGame = await ethers.getContractAt("MinerGame", deployment.contracts.MinerGame);

  // Display initial stats
  console.log("Initial Player Stats:");
  console.log("=====================");
  await displayPlayerStats(player.address, minerGame, minerToken, minerNFT);

  // Register any owned NFTs
  console.log("\n1. Registering NFT Miners...");
  const nftBalance = await minerNFT.balanceOf(player.address);

  if (nftBalance > 0) {
    const registeredMiners = await minerGame.getRegisteredMiners(player.address);
    const registeredSet = new Set(registeredMiners.map(id => id.toString()));

    for (let i = 0; i < nftBalance; i++) {
      const tokenId = await minerNFT.tokenOfOwnerByIndex(player.address, i);

      if (!registeredSet.has(tokenId.toString())) {
        try {
          const tx = await minerGame.registerMiner(tokenId);
          await tx.wait();
          console.log(`✅ Registered miner #${tokenId}`);
        } catch (error) {
          console.log(`⚠️ Could not register miner #${tokenId}`);
        }
      } else {
        console.log(`ℹ️ Miner #${tokenId} already registered`);
      }
    }
  } else {
    console.log("⚠️ No NFT miners owned. Get some from the faucet first!");
  }

  // Perform tap mining
  console.log("\n2. Tap Mining...");
  const taps = 10;
  console.log(`Performing ${taps} taps...`);

  const tx = await minerGame.tapMine(taps);
  const receipt = await tx.wait();

  // Parse events from receipt
  if (receipt) {
    const tappedEvents = receipt.logs
      .map((log: any) => {
        try {
          return minerGame.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter((event: any) => event?.name === "Tapped");

    const gemEvents = receipt.logs
      .map((log: any) => {
        try {
          return minerGame.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter((event: any) => event?.name === "GemFound");

    if (tappedEvents.length > 0) {
      const mainEvent = tappedEvents[tappedEvents.length - 1];
      console.log(`✅ Tapped ${mainEvent?.args[1]} times`);
      console.log(`   Total reward: ${ethers.formatEther(mainEvent?.args[2])} MINE`);

      if (mainEvent?.args[3]) {
        console.log(`   🎯 Critical hits detected!`);
      }
    }

    if (gemEvents.length > 0) {
      for (const gemEvent of gemEvents) {
        const gemType = ["None", "Ruby", "Sapphire", "Diamond"][Number(gemEvent?.args[1])];
        console.log(`   💎 Found ${gemType}! Bonus: ${ethers.formatEther(gemEvent?.args[2])} MINE`);
      }
    }
  }

  // Check if we should withdraw
  console.log("\n3. Checking Rewards...");
  const playerData = await minerGame.getPlayerData(player.address);

  if (playerData.pendingRewards > 0) {
    console.log(`Pending rewards: ${ethers.formatEther(playerData.pendingRewards)} MINE`);

    const action = process.argv[2];
    if (action === "withdraw") {
      console.log("Withdrawing rewards...");
      const withdrawTx = await minerGame.withdraw();
      await withdrawTx.wait();
      console.log("✅ Rewards withdrawn!");
    } else {
      console.log("ℹ️ Run with 'withdraw' argument to claim rewards");
    }
  } else {
    console.log("No pending rewards");
  }

  // Check if we should upgrade
  if (action === "upgrade") {
    console.log("\n4. Upgrading Player Level...");
    const currentLevel = playerData.level;
    const upgradeCost = (currentLevel + 1n) * ethers.parseEther("100");

    console.log(`Current level: ${currentLevel}`);
    console.log(`Upgrade cost: ${ethers.formatEther(upgradeCost)} MINE`);

    const balance = await minerToken.balanceOf(player.address);

    if (balance >= upgradeCost) {
      // Approve spending
      const approveTx = await minerToken.approve(
        deployment.contracts.MinerGame,
        upgradeCost
      );
      await approveTx.wait();

      // Upgrade
      const upgradeTx = await minerGame.upgrade();
      await upgradeTx.wait();
      console.log("✅ Level upgraded!");
    } else {
      console.log(`⚠️ Insufficient balance. Need ${ethers.formatEther(upgradeCost - balance)} more MINE`);
    }
  }

  // Display final stats
  console.log("\n\nFinal Player Stats:");
  console.log("===================");
  await displayPlayerStats(player.address, minerGame, minerToken, minerNFT);
}

async function displayPlayerStats(
  playerAddress: string,
  minerGame: any,
  minerToken: any,
  minerNFT: any
) {
  const playerData = await minerGame.getPlayerData(playerAddress);
  const tokenBalance = await minerToken.balanceOf(playerAddress);
  const nftBalance = await minerNFT.balanceOf(playerAddress);

  console.log(`MINE Balance: ${ethers.formatEther(tokenBalance)}`);
  console.log(`NFT Miners: ${nftBalance}`);
  console.log(`Player Level: ${playerData.level}`);
  console.log(`Total Power: ${playerData.totalPower}`);
  console.log(`Total Taps: ${playerData.totalTaps}`);
  console.log(`Critical Hits: ${playerData.criticalHits}`);
  console.log(`Total Mined: ${ethers.formatEther(playerData.totalMined)} MINE`);
  console.log(`Pending Rewards: ${ethers.formatEther(playerData.pendingRewards)} MINE`);
}

const action = process.argv[2];

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });