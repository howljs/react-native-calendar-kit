/**
 * Recycle pool for maintaining recyclable items Availability check, add/remove
 * etc are all O(1), uses two maps to achieve constant time operation
 */

export default class RecycleItemPool {
  private _recyclableObjectSet: Set<string>;
  private _availabilitySet: Set<string>;

  constructor() {
    this._recyclableObjectSet = new Set();
    this._availabilitySet = new Set();
  }

  public putRecycledObject(object: string): void {
    if (!this._availabilitySet.has(object)) {
      this._recyclableObjectSet.add(object);
      this._availabilitySet.add(object);
    }
  }

  public getRecycledObject(): string | undefined {
    const recycledObject = this._recyclableObjectSet.values().next().value;
    if (recycledObject) {
      this._recyclableObjectSet.delete(recycledObject);
      this._availabilitySet.delete(recycledObject);
    }
    return recycledObject;
  }

  public removeFromPool(object: string): boolean {
    if (this._availabilitySet.has(object)) {
      this._recyclableObjectSet.delete(object);
      this._availabilitySet.delete(object);
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this._recyclableObjectSet.clear();
    this._availabilitySet.clear();
  }
}
