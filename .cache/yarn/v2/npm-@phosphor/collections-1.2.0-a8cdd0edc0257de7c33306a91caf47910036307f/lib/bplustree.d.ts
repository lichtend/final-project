import { IIterable, IIterator, IRetroable, IterableOrArrayLike } from "@phosphor/algorithm";
/**
 * A generic B+ tree.
 *
 * #### Notes
 * Most operations have `O(log32 n)` or better complexity.
 */
export declare class BPlusTree<T> implements IIterable<T>, IRetroable<T> {
    /**
     * Construct a new B+ tree.
     *
     * @param cmp - The item comparison function for the tree.
     */
    constructor(cmp: (a: T, b: T) => number);
    /**
     * The item comparison function for the tree.
     *
     * #### Complexity
     * `O(1)`
     */
    readonly cmp: (a: T, b: T) => number;
    /**
     * Whether the tree is empty.
     *
     * #### Complexity
     * `O(1)`
     */
    readonly isEmpty: boolean;
    /**
     * The size of the tree.
     *
     * #### Complexity
     * `O(1)`
     */
    readonly size: number;
    /**
     * The first item in the tree.
     *
     * This is `undefined` if the tree is empty.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    readonly first: T | undefined;
    /**
     * The last item in the tree.
     *
     * This is `undefined` if the tree is empty.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    readonly last: T | undefined;
    /**
     * Create an iterator over the items in the tree.
     *
     * @returns A new iterator starting with the first item.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    iter(): IIterator<T>;
    /**
     * Create a reverse iterator over the items in the tree.
     *
     * @returns A new iterator starting with the last item.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    retro(): IIterator<T>;
    /**
     * Create an iterator for a slice of items in the tree.
     *
     * @param start - The index of the first item, inclusive. This
     *   should be `< stop`. Negative values are taken as an offset
     *   from the end of the tree. The default is `0`.
     *
     * @param stop - The index of the last item, exclusive. This
     *   should be `> start`. Negative values are taken as an offset
     *   from the end of the tree. The default is `size`.
     *
     * @returns A new iterator starting with the specified item.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    slice(start?: number, stop?: number): IIterator<T>;
    /**
     * Create a reverse iterator for a slice of items in the tree.
     *
     * @param start - The index of the first item, inclusive. This
     *   should be `> stop`. Negative values are taken as an offset
     *   from the end of the tree. The default is `size - 1`.
     *
     * @param stop - The index of the last item, exclusive. This
     *   should be `< start`. Negative values are taken as an offset
     *   from the end of the tree. The default is `-size - 1`.
     *
     * @returns A new reverse iterator starting with the specified item.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    retroSlice(start?: number, stop?: number): IIterator<T>;
    /**
     * Get the item at a particular index.
     *
     * @param index - The index of the item of interest. Negative
     *   values are taken as an offset from the end of the tree.
     *
     * @returns The item at the specified index, or `undefined` if
     *   the index is out of range.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    at(index: number): T | undefined;
    /**
     * Test whether the tree has an item which matches a key.
     *
     * @param key - The key of interest.
     *
     * @param cmp - A function which compares an item against the key.
     *
     * @returns `true` if the tree has an item which matches the given
     *   key, `false` otherwise.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    has<U>(key: U, cmp: (item: T, key: U) => number): boolean;
    /**
     * Get the index of an item which matches a key.
     *
     * @param key - The key of interest.
     *
     * @param cmp - A function which compares an item against the key.
     *
     * @returns The index of the item which matches the given key. A
     *   negative value means that a matching item does not exist in
     *   the tree, but if one did it would reside at `-index - 1`.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    indexOf<U>(key: U, cmp: (item: T, key: U) => number): number;
    /**
     * Get the item which matches a key.
     *
     * @param item - The key of interest.
     *
     * @param cmp - A function which compares an item against the key.
     *
     * @returns The item which matches the given key, or `undefined` if
     *   the tree does not have a matching item.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    get<U>(key: U, cmp: (item: T, key: U) => number): T | undefined;
    /**
     * Assign new items to the tree, replacing all current items.
     *
     * @param items - The items to assign to the tree.
     *
     * #### Complexity
     * `O(n log32 n)`
     */
    assign(items: IterableOrArrayLike<T>): void;
    /**
     * Insert an item into the tree.
     *
     * @param item - The item of interest.
     *
     * @returns If the given item matches an existing item in the tree,
     *   the given item will replace it, and the existing item will be
     *   returned. Otherwise, this method returns `undefined`.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    insert(item: T): T | undefined;
    /**
     * Update the tree with multiple items.
     *
     * @param items - The items to insert into the tree.
     *
     * #### Complexity
     * `O(k log32 n)`
     */
    update(items: IterableOrArrayLike<T>): void;
    /**
     * Delete an item which matches a particular key.
     *
     * @param key - The key of interest.
     *
     * @param cmp - A function which compares an item against the key.
     *
     * @returns The item removed from the tree, or `undefined` if no
     *   item matched the given key.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    delete<U>(key: U, cmp: (item: T, key: U) => number): T | undefined;
    /**
     * Remove an item at a particular index.
     *
     * @param index - The index of the item to remove. Negative
     *   values are taken as an offset from the end of the tree.
     *
     * @returns The item removed from the tree, or `undefined` if
     *   the given index is out of range.
     *
     * #### Complexity
     * `O(log32 n)`
     */
    remove(index: number): T | undefined;
    /**
     * Clear the contents of the tree.
     *
     * #### Complexity
     * `O(n)`
     */
    clear(): void;
    private _root;
}
/**
 * The namespace for the `BPlusTree` class statics.
 */
export declare namespace BPlusTree {
    /**
     * Create a new B+ tree populated with the given items.
     *
     * @param items - The items to add to the tree.
     *
     * @param cmp - The item comparison function for the tree.
     *
     * @returns A new B+ tree populated with the given items.
     *
     * #### Complexity
     * `O(n log32 n)`
     */
    function from<T>(items: IterableOrArrayLike<T>, cmp: (a: T, b: T) => number): BPlusTree<T>;
}
