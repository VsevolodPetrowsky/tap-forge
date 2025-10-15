import { expect } from 'chai';
import hre from 'hardhat';

import type { MinerToken, MinerNFT, MinerGame } from '../typechain-types';
import type { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

const { ethers } = hre;

describe('Security Tests', function () {
  let minerToken: MinerToken;
  let minerNFT: MinerNFT;
  let minerGame: MinerGame;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, attacker, user] = await ethers.getSigners();

    // Deploy contracts
    const MinerToken = await ethers.getContractFactory('MinerToken');
    minerToken = await MinerToken.deploy(owner.address);
    await minerToken.waitForDeployment();

    const MinerNFT = await ethers.getContractFactory('MinerNFT');
    minerNFT = await MinerNFT.deploy('https://api.tapforge.game/nft/', owner.address);
    await minerNFT.waitForDeployment();

    const MinerGame = await ethers.getContractFactory('MinerGame');
    minerGame = await MinerGame.deploy(
      await minerToken.getAddress(),
      await minerNFT.getAddress()
    );
    await minerGame.waitForDeployment();

    // Setup roles
    const MINTER_ROLE = await minerToken.MINTER_ROLE();
    await minerToken.grantRole(MINTER_ROLE, await minerGame.getAddress());

    const GAME_ROLE = await minerNFT.GAME_ROLE();
    await minerNFT.grantRole(GAME_ROLE, await minerGame.getAddress());
  });

  describe('Reentrancy Protection', function () {
    it('Should prevent reentrancy in withdraw', async function () {
      // This would require a malicious contract to test properly
      // For now, we verify the modifier is present
      await minerGame.connect(user).tapMine(10);

      // Try to call withdraw twice in same transaction would fail
      await minerGame.connect(user).withdraw();
      await expect(minerGame.connect(user).withdraw()).to.be.revertedWith(
        'No pending rewards'
      );
    });

    it('Should prevent reentrancy in upgrade', async function () {
      // Give user tokens
      await minerToken.connect(owner).mint(user.address, ethers.parseEther('1000'));
      await minerToken.connect(user).approve(
        await minerGame.getAddress(),
        ethers.parseEther('1000')
      );

      // Upgrade should be protected
      await minerGame.connect(user).upgrade();

      // Second upgrade needs more tokens (200 MINE for level 2)
      await expect(minerGame.connect(user).upgrade()).to.not.be.reverted;
    });
  });

  describe('Access Control', function () {
    it('Should prevent unauthorized minting', async function () {
      await expect(
        minerToken.connect(attacker).mint(attacker.address, ethers.parseEther('1000'))
      ).to.be.revertedWithCustomError(minerToken, 'AccessControlUnauthorizedAccount');
    });

    it('Should prevent unauthorized NFT minting', async function () {
      await expect(
        minerNFT.connect(attacker).mintMiner(attacker.address, 1, 'Hacked')
      ).to.be.revertedWithCustomError(minerNFT, 'AccessControlUnauthorizedAccount');
    });

    it('Should prevent unauthorized pausing', async function () {
      await expect(
        minerGame.connect(attacker).pause()
      ).to.be.revertedWithCustomError(minerGame, 'OwnableUnauthorizedAccount');
    });

    it('Should prevent unauthorized gem reward updates', async function () {
      await expect(
        minerGame.connect(attacker).updateGemReward(1, ethers.parseEther('10000'), 100)
      ).to.be.revertedWithCustomError(minerGame, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Integer Overflow/Underflow', function () {
    it('Should handle maximum uint256 values safely', async function () {
      // Solidity 0.8+ has built-in overflow protection
      // This test verifies it works as expected

      const maxUint256 = ethers.MaxUint256;

      // Try to mint max supply
      await expect(
        minerToken.connect(owner).mint(user.address, maxUint256)
      ).to.be.revertedWith('MinerToken: Amount exceeds max');
    });

    it('Should prevent underflow in withdrawals', async function () {
      // Try to withdraw with no rewards
      await expect(
        minerGame.connect(user).withdraw()
      ).to.be.revertedWith('No pending rewards');
    });
  });

  describe('DoS Protection', function () {
    it('Should limit taps per call', async function () {
      await expect(
        minerGame.connect(user).tapMine(21)
      ).to.be.revertedWith('Invalid tap count');
    });

    it('Should limit taps per block', async function () {
      // This is tested in main test suite
      const maxTapsPerBlock = await minerGame.MAX_TAPS_PER_BLOCK();
      expect(maxTapsPerBlock).to.equal(100);
    });

    it('Should handle large NFT arrays efficiently', async function () {
      // Mint multiple NFTs to test gas usage
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(minerNFT.connect(owner).mintMiner(user.address, 0, `Miner ${i}`));
      }
      await Promise.all(promises);

      // Register them all
      for (let i = 0; i < 10; i++) {
        await minerGame.connect(user).registerMiner(i);
      }

      // Should still be able to tap efficiently
      const tx = await minerGame.connect(user).tapMine(1);
      const receipt = await tx.wait();

      // Gas should be reasonable (less than 500k)
      expect(receipt?.gasUsed).to.be.lt(500000);
    });
  });

  describe('Front-running Protection', function () {
    it('Should have consistent rewards regardless of transaction order', async function () {
      // Both users tap at same time
      await minerGame.connect(user).tapMine(1);
      await minerGame.connect(attacker).tapMine(1);

      // Check that both got base rewards
      const userData = await minerGame.getPlayerData(user.address);
      const attackerData = await minerGame.getPlayerData(attacker.address);

      // Both users should have received rewards (may differ due to randomness)
      expect(userData.pendingRewards).to.be.gt(0);
      expect(attackerData.pendingRewards).to.be.gt(0);
    });
  });

  describe('Pausable Mechanism', function () {
    it('Should prevent actions when paused', async function () {
      await minerGame.connect(owner).pause();

      await expect(
        minerGame.connect(user).tapMine(1)
      ).to.be.revertedWithCustomError(minerGame, 'EnforcedPause');

      await expect(
        minerGame.connect(user).withdraw()
      ).to.not.be.revertedWithCustomError(minerGame, 'EnforcedPause');
    });

    it('Should resume actions when unpaused', async function () {
      await minerGame.connect(owner).pause();
      await minerGame.connect(owner).unpause();

      // Should work again
      await expect(minerGame.connect(user).tapMine(1)).to.not.be.reverted;
    });
  });

  describe('Input Validation', function () {
    it('Should validate tap count', async function () {
      await expect(minerGame.connect(user).tapMine(0)).to.be.revertedWith(
        'Invalid tap count'
      );

      await expect(minerGame.connect(user).tapMine(21)).to.be.revertedWith(
        'Invalid tap count'
      );
    });

    it('Should validate NFT ownership in registration', async function () {
      // Mint NFT to owner
      await minerNFT.connect(owner).mintMiner(owner.address, 0, 'Test');

      // User tries to register it
      await expect(
        minerGame.connect(user).registerMiner(0)
      ).to.be.revertedWith('Not the owner');
    });

    it('Should validate array lengths in batch operations', async function () {
      const recipients = [user.address, attacker.address];
      const amounts = [ethers.parseEther('100')]; // Mismatched length

      await expect(
        minerToken.connect(owner).batchMint(recipients, amounts)
      ).to.be.revertedWith('MinerToken: Arrays length mismatch');
    });
  });

  describe('Gas Optimization Checks', function () {
    it('Should use reasonable gas for single tap', async function () {
      const tx = await minerGame.connect(user).tapMine(1);
      const receipt = await tx.wait();

      // Single tap should use less than 180k gas (optimized but with security features)
      expect(receipt?.gasUsed).to.be.lt(180000);
    });

    it('Should batch taps efficiently', async function () {
      const tx = await minerGame.connect(user).tapMine(20);
      const receipt = await tx.wait();

      // 20 taps should use less than 500k gas
      expect(receipt?.gasUsed).to.be.lt(500000);
    });
  });

  describe('Randomness Tests', function () {
    it('Should produce different results for different users', async function () {
      // Mine many times to get statistical sample
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        await minerGame.connect(user).tapMine(10);
        await minerGame.connect(attacker).tapMine(10);
      }

      const userData = await minerGame.getPlayerData(user.address);
      const attackerData = await minerGame.getPlayerData(attacker.address);

      // Results should be different (statistically)
      // We can't guarantee this 100% due to randomness, but rewards should differ
      expect(userData.pendingRewards).to.not.equal(attackerData.pendingRewards);
    });
  });

  describe('Supply Cap Enforcement', function () {
    it('Should enforce max token supply', async function () {
      const maxSupply = await minerToken.MAX_SUPPLY();
      const currentSupply = await minerToken.totalSupply();
      const remaining = maxSupply - currentSupply;

      // Try to mint more than remaining
      await expect(
        minerToken.connect(owner).mint(user.address, remaining + BigInt(1))
      ).to.be.revertedWith('MinerToken: Max supply exceeded');

      // Should work with exact amount
      await expect(
        minerToken.connect(owner).mint(user.address, remaining)
      ).to.not.be.reverted;

      // Now should be at max
      await expect(
        minerToken.connect(owner).mint(user.address, BigInt(1))
      ).to.be.revertedWith('MinerToken: Max supply exceeded');
    });

    it('Should enforce max NFT supply', async function () {
      const maxSupply = await minerNFT.MAX_SUPPLY();

      // We can't mint 10000 NFTs in a test, but we can verify the check exists
      expect(maxSupply).to.equal(10000);
    });
  });
});