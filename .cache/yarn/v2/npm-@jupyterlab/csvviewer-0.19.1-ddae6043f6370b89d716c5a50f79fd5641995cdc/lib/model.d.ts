import { DataModel } from '@phosphor/datagrid';
import { IDisposable } from '@phosphor/disposable';
/**
 * A data model implementation for in-memory delimiter-separated data.
 *
 * #### Notes
 * This model handles data with up to 2**32 characters.
 */
export declare class DSVModel extends DataModel implements IDisposable {
    /**
     * Create a data model with static CSV data.
     *
     * @param options - The options for initializing the data model.
     */
    constructor(options: DSVModel.IOptions);
    /**
     * Whether this model has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * A promise that resolves when the model has parsed all of its data.
     */
    readonly ready: Promise<void>;
    /**
     * Get the row count for a region in the data model.
     *
     * @param region - The row region of interest.
     *
     * @returns - The row count for the region.
     */
    rowCount(region: DataModel.RowRegion): number;
    /**
     * Get the column count for a region in the data model.
     *
     * @param region - The column region of interest.
     *
     * @returns - The column count for the region.
     */
    columnCount(region: DataModel.ColumnRegion): number;
    /**
     * Get the data value for a cell in the data model.
     *
     * @param region - The cell region of interest.
     *
     * @param row - The row index of the cell of interest.
     *
     * @param column - The column index of the cell of interest.
     *
     * @param returns - The data value for the specified cell.
     */
    data(region: DataModel.CellRegion, row: number, column: number): string;
    /**
     * Dispose the resources held by this model.
     */
    dispose(): void;
    /**
     * Compute the row offsets and initialize the column offset cache.
     *
     * @param endRow - The last row to parse, from the start of the data (first
     * row is row 1).
     *
     * #### Notes
     * This method supports parsing the data incrementally by calling it with
     * incrementally higher endRow. Rows that have already been parsed will not be
     * parsed again.
     */
    private _computeRowOffsets;
    /**
     * Get the parsed string field for a row and column.
     *
     * @param row - The row number of the data item.
     * @param column - The column number of the data item.
     * @returns The parsed string for the data item.
     */
    private _getField;
    /**
     * Get the index in the data string for the first character of a row and
     * column.
     *
     * @param row - The row of the data item.
     * @param column - The column of the data item.
     * @returns - The index into the data string where the data item starts.
     */
    private _getOffsetIndex;
    /**
     * Parse the data string asynchronously.
     *
     * #### Notes
     * It can take several seconds to parse a several hundred megabyte string, so
     * we parse the first 500 rows to get something up on the screen, then we
     * parse the full data string asynchronously.
     */
    private _parseAsync;
    /**
     * Reset the parser state.
     */
    private _resetParser;
    private _delimiter;
    private _quote;
    private _quoteEscaped;
    private _parser;
    private _rowDelimiter;
    private _data;
    private _rowCount;
    private _columnCount;
    /**
     * The header strings.
     */
    private _header;
    /**
     * The column offset cache, starting with row _columnOffsetsStartingRow
     *
     * #### Notes
     * The index of the first character in the data string for row r, column c is
     * _columnOffsets[(r-this._columnOffsetsStartingRow)*numColumns+c]
     */
    private _columnOffsets;
    /**
     * The row that _columnOffsets[0] represents.
     */
    private _columnOffsetsStartingRow;
    /**
     * The maximum number of rows to parse when there is a cache miss.
     */
    private _maxCacheGet;
    /**
     * The index for the start of each row.
     */
    private _rowOffsets;
    /**
     * The number of rows to parse initially before doing a delayed parse of the
     * entire data.
     */
    private _initialRows;
    private _delayedParse;
    private _startedParsing;
    private _doneParsing;
    private _isDisposed;
    private _ready;
}
/**
 * The namespace for the `DSVModel` class statics.
 */
export declare namespace DSVModel {
    /**
     * An options object for initializing a delimiter-separated data model.
     */
    interface IOptions {
        /**
         * The field delimiter, such as ',' or '\t'.
         *
         * #### Notes
         * The field delimiter must be a single character.
         */
        delimiter: string;
        /**
         * The data source for the data model.
         */
        data: string;
        /**
         * Whether the data has a one-row header.
         */
        header?: boolean;
        /**
         * Row delimiter.
         *
         * #### Notes
         * Any carriage return or newline character that is not a delimiter should
         * be in a quoted field, regardless of the row delimiter setting.
         */
        rowDelimiter?: '\r\n' | '\r' | '\n';
        /**
         * Quote character.
         *
         * #### Notes
         * Quotes are escaped by repeating them, as in RFC 4180. The quote must be a
         * single character.
         */
        quote?: string;
        /**
         * Whether to use the parser that can handle quoted delimiters.
         *
         * #### Notes
         * Setting this to false uses a much faster parser, but assumes there are
         * not any field or row delimiters that are quoted in fields. If this is not
         * set, it defaults to true if any quotes are found in the data, and false
         * otherwise.
         */
        quoteParser?: boolean;
        /**
         * The maximum number of initial rows to parse before doing a asynchronous
         * full parse of the data. This should be greater than 0.
         */
        initialRows?: number;
    }
}
