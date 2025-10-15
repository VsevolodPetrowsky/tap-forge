import { BaseDomainEvent } from './DomainEvent';

export interface MinerRegisteredEventData {
  playerAddress: string;
  tokenId: string;
  rarity: string;
  basePower: string;
  transactionHash: string;
}

export class MinerRegisteredEvent extends BaseDomainEvent {
  public readonly data: MinerRegisteredEventData;

  constructor(aggregateId: string, data: MinerRegisteredEventData) {
    super('MinerRegistered', aggregateId);
    this.data = data;
  }
}
