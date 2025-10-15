// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MinerNFT
 * @notice NFT collection of miners with different rarities and power levels
 * @dev ERC721 token with enumerable and URI storage extensions
 */
contract MinerNFT is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    uint256 private _tokenIdCounter;

    enum Rarity {
        COMMON,
        RARE,
        EPIC,
        LEGENDARY
    }

    struct MinerData {
        Rarity rarity;
        uint256 power;
        uint256 mintedAt;
        string name;
    }

    mapping(uint256 => MinerData) public miners;

    // Base power for each rarity
    uint256 public constant COMMON_POWER = 1;
    uint256 public constant RARE_POWER = 3;
    uint256 public constant EPIC_POWER = 7;
    uint256 public constant LEGENDARY_POWER = 15;

    uint256 public constant MAX_SUPPLY = 10000;

    string private _baseTokenURI;

    event MinerMinted(
        address indexed to,
        uint256 indexed tokenId,
        Rarity rarity,
        uint256 power
    );
    event MinerUpgraded(uint256 indexed tokenId, uint256 newPower);
    event MinerRenamed(uint256 indexed tokenId, string newName);

    constructor(string memory baseURI, address defaultAdmin)
        ERC721("TapForge Miners", "TFMINER")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mint a new miner NFT
     * @param to Address to mint to
     * @param rarity Rarity of the miner
     * @param name Optional name for the miner
     */
    function mintMiner(
        address to,
        Rarity rarity,
        string memory name
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(totalSupply() < MAX_SUPPLY, "MinerNFT: Max supply reached");
        require(bytes(name).length <= 32, "MinerNFT: Name too long");

        uint256 tokenId = _tokenIdCounter++;

        _safeMint(to, tokenId);

        uint256 power = _getPowerByRarity(rarity);

        miners[tokenId] = MinerData({
            rarity: rarity,
            power: power,
            mintedAt: block.timestamp,
            name: name
        });

        // No longer tracking in ownerTokens - use ERC721Enumerable's tokenOfOwnerByIndex

        emit MinerMinted(to, tokenId, rarity, power);

        return tokenId;
    }

    /**
     * @notice Batch mint miners
     * @param to Address to mint to
     * @param rarities Array of rarities
     * @param count Number of miners to mint
     */
    function batchMintMiners(
        address to,
        Rarity[] calldata rarities,
        uint256 count
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(count > 0 && count <= 20, "MinerNFT: Invalid count");
        require(rarities.length == count, "MinerNFT: Arrays mismatch");
        require(totalSupply() + count <= MAX_SUPPLY, "MinerNFT: Max supply exceeded");

        uint256[] memory tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = mintMiner(to, rarities[i], "");
        }

        return tokenIds;
    }

    /**
     * @notice Get power by rarity
     */
    function _getPowerByRarity(Rarity rarity) private pure returns (uint256) {
        if (rarity == Rarity.COMMON) return COMMON_POWER;
        if (rarity == Rarity.RARE) return RARE_POWER;
        if (rarity == Rarity.EPIC) return EPIC_POWER;
        if (rarity == Rarity.LEGENDARY) return LEGENDARY_POWER;
        return COMMON_POWER;
    }

    /**
     * @notice Upgrade miner power (only GAME_ROLE)
     * @param tokenId Token ID to upgrade
     * @param additionalPower Additional power to add
     */
    function upgradeMiner(uint256 tokenId, uint256 additionalPower)
        external
        onlyRole(GAME_ROLE)
    {
        require(_ownerOf(tokenId) != address(0), "MinerNFT: Token does not exist");

        uint256 currentPower = miners[tokenId].power;
        require(currentPower + additionalPower >= currentPower, "MinerNFT: Power overflow");
        require(currentPower + additionalPower <= type(uint256).max / 1000, "MinerNFT: Power too high");

        miners[tokenId].power = currentPower + additionalPower;
        emit MinerUpgraded(tokenId, miners[tokenId].power);
    }

    /**
     * @notice Rename a miner (only owner)
     * @param tokenId Token ID to rename
     * @param newName New name for the miner
     */
    function renameMiner(uint256 tokenId, string memory newName) external {
        require(ownerOf(tokenId) == msg.sender, "MinerNFT: Not the owner");
        require(bytes(newName).length <= 32, "MinerNFT: Name too long");
        miners[tokenId].name = newName;
        emit MinerRenamed(tokenId, newName);
    }

    /**
     * @notice Get all token IDs owned by an address
     * @param owner Address to query
     */
    function getOwnerTokens(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokens;
    }

    /**
     * @notice Get miner data
     * @param tokenId Token ID to query
     */
    function getMiner(uint256 tokenId) external view returns (MinerData memory) {
        require(_ownerOf(tokenId) != address(0), "MinerNFT: Token does not exist");
        return miners[tokenId];
    }

    /**
     * @notice Get total power of all miners owned by an address
     * @param owner Address to query
     */
    function getTotalPower(address owner) external view returns (uint256) {
        uint256 totalPower = 0;
        uint256 balance = balanceOf(owner);

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            totalPower += miners[tokenId].power;
        }

        return totalPower;
    }

    /**
     * @notice Set base URI for tokens
     */
    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Override _baseURI function
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Override _update for ERC721Enumerable
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        // Simply call parent implementation
        // ERC721Enumerable already tracks ownership efficiently
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Override required functions
     */
    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}