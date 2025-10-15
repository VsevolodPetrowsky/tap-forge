/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  eventName: string;
  occurredAt: Date;
  aggregateId: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventName: string;
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  protected constructor(eventName: string, aggregateId: string) {
    this.eventName = eventName;
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
  }
}
