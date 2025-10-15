import { isAddress } from 'viem';

/**
 * Value Object for Ethereum addresses
 * Ensures address is valid and normalized
 */
export class Address {
  private readonly value: `0x${string}`;

  private constructor(address: string) {
    if (!isAddress(address)) {
      throw new Error(`Invalid Ethereum address: ${address}`);
    }
    this.value = address.toLowerCase() as `0x${string}`;
  }

  static create(address: string): Address {
    return new Address(address);
  }

  getValue(): `0x${string}` {
    return this.value;
  }

  equals(other: Address): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
