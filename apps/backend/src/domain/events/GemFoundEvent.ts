import { BaseDomainEvent } from './DomainEvent';

export interface GemFoundEventData {
  playerAddress: string;
  gemType: string;
  rarity: string;
  multiplier: number;
  reward: string;
  blockNumber: string;
  transactionHash: string;
}

export class GemFoundEvent extends BaseDomainEvent {
  public readonly data: GemFoundEventData;

  constructor(aggregateId: string, data: GemFoundEventData) {
    super('GemFound', aggregateId);
    this.data = data;
  }
}
