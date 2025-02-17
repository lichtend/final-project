/**
 * An object which manages a collection of variable sized sections.
 *
 * #### Notes
 * This class is an implementation detail. It is designed to manage
 * the variable row and column sizes for a data grid. User code will
 * not interact with this class directly.
 */
export declare class SectionList {
    /**
     * Construct a new section list.
     *
     * @param options - The options for initializing the list.
     */
    constructor(options: SectionList.IOptions);
    /**
     * The total size of all sections in the list.
     *
     * #### Complexity
     * Constant.
     */
    readonly totalSize: number;
    /**
     * The total number of sections in the list.
     *
     * #### Complexity
     * Constant.
     */
    readonly sectionCount: number;
    /**
     * Get the base size of sections in the list.
     *
     * #### Complexity
     * Constant.
     */
    /**
    * Set the base size of sections in the list.
    *
    * #### Complexity
    * Linear on the number of resized sections.
    */
    baseSize: number;
    /**
     * Find the index of the section which covers the given offset.
     *
     * @param offset - The offset of the section of interest.
     *
     * @returns The index of the section which covers the given offset,
     *   or `-1` if the offset is out of range.
     *
     * #### Complexity
     * Logarithmic on the number of resized sections.
     */
    sectionIndex(offset: number): number;
    /**
     * Find the offset of the section at the given index.
     *
     * @param index - The index of the section of interest.
     *
     * @returns The offset of the section at the given index, or `-1`
     *   if the index is out of range.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral.
     *
     * #### Complexity
     * Logarithmic on the number of resized sections.
     */
    sectionOffset(index: number): number;
    /**
     * Find the size of the section at the given index.
     *
     * @param index - The index of the section of interest.
     *
     * @returns The size of the section at the given index, or `-1`
     *   if the index is out of range.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral.
     *
     * #### Complexity
     * Logarithmic on the number of resized sections.
     */
    sectionSize(index: number): number;
    /**
     * Resize a section in the list.
     *
     * @param index - The index of the section to resize. This method
     *   is a no-op if this value is out of range.
     *
     * @param size - The new size of the section. This value will be
     *   clamped to an integer `>= 0`.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral.
     *
     * #### Complexity
     * Linear on the number of resized sections.
     */
    resizeSection(index: number, size: number): void;
    /**
     * Insert sections into the list.
     *
     * @param index - The index at which to insert the sections. This
     *   value will be clamped to the bounds of the list.
     *
     * @param count - The number of sections to insert. This method
     *   is a no-op if this value is `<= 0`.
     *
     * #### Undefined Behavior
     * An `index` or `count` which is non-integral.
     *
     * #### Complexity
     * Linear on the number of resized sections.
     */
    insertSections(index: number, count: number): void;
    /**
     * Remove sections from the list.
     *
     * @param index - The index of the first section to remove. This
     *   method is a no-op if this value is out of range.
     *
     * @param count - The number of sections to remove. This method
     *   is a no-op if this value is `<= 0`.
     *
     * #### Undefined Behavior
     * An `index` or `count` which is non-integral.
     *
     * #### Complexity
     * Linear on the number of resized sections.
     */
    removeSections(index: number, count: number): void;
    /**
     * Move sections within the list.
     *
     * @param index - The index of the first section to move. This method
     *   is a no-op if this value is out of range.
     *
     * @param count - The number of sections to move. This method is a
     *   no-op if this value is `<= 0`.
     *
     * @param destination - The destination index for the first section.
     *   This value will be clamped to the allowable range.
     *
     * #### Undefined Behavior
     * An `index`, `count`, or `destination` which is non-integral.
     *
     * #### Complexity
     * Linear on the number of moved resized sections.
     */
    moveSections(index: number, count: number, destination: number): void;
    /**
     * Reset all modified sections to the base size.
     *
     * #### Complexity
     * Constant.
     */
    reset(): void;
    /**
     * Remove all sections from the list.
     *
     * #### Complexity
     * Constant.
     */
    clear(): void;
    private _totalSize;
    private _baseSize;
    private _sectionCount;
    private _sections;
}
/**
 * The namespace for the `SectionList` class statics.
 */
export declare namespace SectionList {
    /**
     * An options object for initializing a section list.
     */
    interface IOptions {
        /**
         * The size of new sections added to the list.
         */
        baseSize: number;
    }
}
