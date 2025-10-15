/**
 * Value Object for NFT Token IDs
 * Ensures token ID is valid
 */
export class TokenId {
  private readonly value: bigint;

  private constructor(tokenId: bigint) {
    if (tokenId < 0n) {
      throw new Error(`Invalid token ID: ${tokenId}`);
    }
    this.value = tokenId;
  }

  static create(tokenId: bigint | number | string): TokenId {
    return new TokenId(BigInt(tokenId));
  }

  getValue(): bigint {
    return this.value;
  }

  equals(other: TokenId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
