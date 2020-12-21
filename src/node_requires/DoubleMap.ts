export default class DoubleMap<forward, backward> {
    private forwardMap: Map<forward, backward>;
    private backwardMap: Map<backward, forward>;
    // Let's name forward keys as keys, and backward keys as values.

    hasKey(key: forward): boolean {

    }
    getKey(value: backward): forward {
        return this.backwardMap.get(value);
    }
    setKey(value: backward): void {

    }
    deleteKey(value: backward): void {

    }

    hasValue(value: forward): boolean {

    }
    getValue(key: forward): backward {
        return this.forwardMap.get(key);
    }
    setValue(): void {

    }
    deleteValue(): void {

    }

    forEach(predicate: (key: forward, value: backward) => void): void {
        this.backwardMap.forEach(predicate);
    }
}
