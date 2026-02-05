import type { ICarrier, OperationType } from '../interfaces/carrier.interface.js';
import { CarrierNotFoundError } from '../errors/carrier.error.js';
import type { Result } from '../../utils/result.js';
import { ok, err } from '../../utils/result.js';

export class CarrierRegistry {
  private static instance: CarrierRegistry;
  private carriers: Map<string, ICarrier> = new Map();

  private constructor() {}

  static getInstance(): CarrierRegistry {
    if (!CarrierRegistry.instance) {
      CarrierRegistry.instance = new CarrierRegistry();
    }
    return CarrierRegistry.instance;
  }

  register(carrier: ICarrier): void {
    if (this.carriers.has(carrier.id)) {
      throw new Error(`Carrier "${carrier.id}" is already registered`);
    }
    this.carriers.set(carrier.id, carrier);
  }

  get(carrierId: string): Result<ICarrier, CarrierNotFoundError> {
    const carrier = this.carriers.get(carrierId);
    if (!carrier) {
      return err(new CarrierNotFoundError(carrierId));
    }
    return ok(carrier);
  }

  getAll(): ICarrier[] {
    return Array.from(this.carriers.values());
  }

  getByOperation(operation: OperationType): ICarrier[] {
    return this.getAll().filter((c) => c.supportsOperation(operation));
  }

  has(carrierId: string): boolean {
    return this.carriers.has(carrierId);
  }

  unregister(carrierId: string): boolean {
    return this.carriers.delete(carrierId);
  }

  clear(): void {
    this.carriers.clear();
  }

  get size(): number {
    return this.carriers.size;
  }
}
