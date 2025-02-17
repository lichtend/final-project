import { IIterator, IterableOrArrayLike } from './iter';
/**
 * Enumerate an iterable object.
 *
 * @param object - The iterable or array-like object of interest.
 *
 * @param start - The starting enum value. The default is `0`.
 *
 * @returns An iterator which yields the enumerated values.
 *
 * #### Example
 * ```typescript
 * import { enumerate, toArray } from '@phosphor/algorithm';
 *
 * let data = ['foo', 'bar', 'baz'];
 *
 * let stream = enumerate(data, 1);
 *
 * toArray(stream);  // [[1, 'foo'], [2, 'bar'], [3, 'baz']]
 * ```
 */
export declare function enumerate<T>(object: IterableOrArrayLike<T>, start?: number): IIterator<[number, T]>;
/**
 * An iterator which enumerates the source values.
 */
export declare class EnumerateIterator<T> implements IIterator<[number, T]> {
    /**
     * Construct a new enumerate iterator.
     *
     * @param source - The iterator of values of interest.
     *
     * @param start - The starting enum value.
     */
    constructor(source: IIterator<T>, start: number);
    /**
     * Get an iterator over the object's values.
     *
     * @returns An iterator which yields the object's values.
     */
    iter(): IIterator<[number, T]>;
    /**
     * Create an independent clone of the iterator.
     *
     * @returns A new independent clone of the iterator.
     */
    clone(): IIterator<[number, T]>;
    /**
     * Get the next value from the iterator.
     *
     * @returns The next value from the iterator, or `undefined`.
     */
    next(): [number, T] | undefined;
    private _source;
    private _index;
}
