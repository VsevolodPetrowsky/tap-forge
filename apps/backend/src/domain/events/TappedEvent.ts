import { BaseDomainEvent } from './DomainEvent';

export interface TappedEventData {
  playerAddress: string;
  taps: number;
  totalReward: string;
  criticalHits: number;
  blockNumber: string;
  transactionHash: string;
}

export class TappedEvent extends BaseDomainEvent {
  public readonly data: TappedEventData;

  constructor(aggregateId: string, data: TappedEventData) {
    super('PlayerTapped', aggregateId);
    this.data = data;
  }
}
