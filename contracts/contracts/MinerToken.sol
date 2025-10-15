// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title MinerToken
 * @notice MINE token - the in-game currency for TapForge
 * @dev ERC20 token with minting/burning capabilities and access control
 */
contract MinerToken is ERC20, ERC20Burnable, AccessControl, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1M MINE
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M MINE

    uint256 public totalMinted;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(address defaultAdmin)
        ERC20("Miner Token", "MINE")
        ERC20Permit("Miner Token")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);

        // Mint initial supply to admin
        _mint(defaultAdmin, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;

        emit TokensMinted(defaultAdmin, INITIAL_SUPPLY);
    }

    /**
     * @notice Mint new tokens (only MINTER_ROLE)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        uint256 currentSupply = totalSupply();
        require(amount <= MAX_SUPPLY, "MinerToken: Amount exceeds max");
        require(currentSupply <= MAX_SUPPLY - amount, "MinerToken: Max supply exceeded");

        totalMinted += amount;
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @notice Batch mint to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param amounts Array of amounts to mint
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyRole(MINTER_ROLE) {
        require(recipients.length > 0, "MinerToken: Empty arrays");
        require(recipients.length == amounts.length, "MinerToken: Arrays length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            // Check for pure arithmetic overflow
            require(totalAmount + amounts[i] >= totalAmount, "MinerToken: Arithmetic overflow");
            totalAmount += amounts[i];
        }

        uint256 currentSupply = totalSupply();
        require(currentSupply <= MAX_SUPPLY - totalAmount, "MinerToken: Max supply exceeded");

        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            totalMinted += amounts[i];
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }

    /**
     * @notice Override burn to emit custom event
     */
    function burn(uint256 value) public override {
        super.burn(value);
        emit TokensBurned(msg.sender, value);
    }

    /**
     * @notice Override burnFrom to emit custom event
     */
    function burnFrom(address account, uint256 value) public override {
        super.burnFrom(account, value);
        emit TokensBurned(account, value);
    }
}