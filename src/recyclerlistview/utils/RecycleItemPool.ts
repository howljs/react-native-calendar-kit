/***
 * Recycle pool for maintaining recyclable items
 * Availability check, add/remove etc are all O(1), uses two maps to achieve constant time operation
 */

interface PseudoSet {
  [key: string]: string;
}
interface NullablePseudoSet {
  [key: string]: string | null;
}

export default class RecycleItemPool {
  private _recyclableObjectMap: { [key: string]: NullablePseudoSet };
  private _availabilitySet: PseudoSet;

  constructor() {
    this._recyclableObjectMap = {};
    this._availabilitySet = {};
  }

  public putRecycledObject(object: string): void {
    const objectSet = this._getRelevantSet();
    if (!this._availabilitySet[object]) {
      objectSet[object] = null;
      this._availabilitySet[object] = 'item';
    }
  }

  public getRecycledObject(): string | undefined {
    const objectSet = this._getRelevantSet();
    let recycledObject;
    for (const property in objectSet) {
      if (objectSet.hasOwnProperty(property)) {
        recycledObject = property;
        break;
      }
    }

    if (recycledObject) {
      delete objectSet[recycledObject];
      delete this._availabilitySet[recycledObject];
    }
    return recycledObject;
  }

  public removeFromPool(object: string): boolean {
    if (this._availabilitySet[object]) {
      delete this._getRelevantSet()[object];
      delete this._availabilitySet[object];
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this._recyclableObjectMap = {};
    this._availabilitySet = {};
  }

  private _getRelevantSet(): NullablePseudoSet {
    let objectSet = this._recyclableObjectMap.item;
    if (!objectSet) {
      objectSet = {};
      this._recyclableObjectMap.item = objectSet;
    }
    return objectSet;
  }
}
