/**
 * Value Object for tap rewards
 */
export class Reward {
  private readonly baseAmount: bigint;
  private readonly multiplier: number;
  private readonly isCritical: boolean;

  private constructor(baseAmount: bigint, multiplier: number, isCritical: boolean) {
    if (baseAmount < 0n) {
      throw new Error('Base amount cannot be negative');
    }
    if (multiplier < 1) {
      throw new Error('Multiplier must be at least 1');
    }
    this.baseAmount = baseAmount;
    this.multiplier = multiplier;
    this.isCritical = isCritical;
  }

  static create(baseAmount: bigint, multiplier: number = 1, isCritical: boolean = false): Reward {
    return new Reward(baseAmount, multiplier, isCritical);
  }

  getTotalAmount(): bigint {
    return this.baseAmount * BigInt(this.multiplier);
  }

  getBaseAmount(): bigint {
    return this.baseAmount;
  }

  getMultiplier(): number {
    return this.multiplier;
  }

  isCriticalHit(): boolean {
    return this.isCritical;
  }
}
