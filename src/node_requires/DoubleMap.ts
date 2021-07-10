/**
 * A two-way map where each piece of a pair may act as a key.
 * Forward keys are referred to as simply "keys"; backward keys are referred to as "values".
 * Both keys and values must be unique.
 *
 * Throws errors when trying to get a non-existing key.
 *
 * Can be used as a generic class in TypeScript to enforce types on both keys and values.
 *
 * @class
 */
export default class DoubleMap<forward, backward> {
    private forwardMap: Map<forward, backward>;
    private backwardMap: Map<backward, forward>;
    // Let's name forward keys as keys, and backward keys as values.

    constructor() {
        this.forwardMap = new Map();
        this.backwardMap = new Map();
    }

    hasKey(key: forward): boolean {
        return this.forwardMap.has(key);
    }
    getKey(value: backward): forward {
        if (!this.hasValue(value)) {
            throw new Error(`[ct-DoubleMap] Attempt to get a non-existing key; value ${value} does not exist`);
        }
        return this.backwardMap.get(value);
    }
    deleteByKey(key: forward): void {
        const value = this.forwardMap.get(key);
        this.backwardMap.delete(value);
        this.forwardMap.delete(key);
    }

    hasValue(value: backward): boolean {
        return this.backwardMap.has(value);
    }
    getValue(key: forward): backward {
        if (!this.hasKey(key)) {
            throw new Error(`[ct-DoubleMap] Attempt to get a non-existing key; key ${key} does not exist`);
        }
        return this.forwardMap.get(key);
    }
    deleteByValue(value: backward): void {
        const key = this.backwardMap.get(value);
        this.forwardMap.delete(key);
        this.backwardMap.delete(value);
    }

    putKeyValue(key: forward, value: backward): void {
        if (this.hasKey(key)) {
            throw new Error(`The key ${key} already exists`);
        }
        if (this.hasValue(value)) {
            throw new Error(`The value ${value} already exists`);
        }
        this.forwardMap.set(key, value);
        this.backwardMap.set(value, key);
    }

    updateValueByKey(key: forward, value: backward): void {
        if (!this.hasKey(key)) {
            throw new Error(`The key ${key} does not exist.`);
        }
        const oldValue = this.forwardMap.get(key);
        this.backwardMap.delete(oldValue);
        this.forwardMap.set(key, value);
        this.backwardMap.set(value, key);
    }

    updateKeyByValue(value: backward, key: forward): void {
        if (!this.hasValue(value)) {
            throw new Error(`The value ${value} does not exist.`);
        }
        const oldKey = this.backwardMap.get(value);
        this.forwardMap.delete(oldKey);
        this.backwardMap.set(value, key);
        this.forwardMap.set(key, value);
    }

    forEach(predicate: (key: forward, value: backward) => void): void {
        this.backwardMap.forEach(predicate);
    }
}
