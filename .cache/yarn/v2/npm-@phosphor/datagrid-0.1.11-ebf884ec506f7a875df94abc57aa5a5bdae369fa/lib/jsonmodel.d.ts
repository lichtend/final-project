import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { DataModel } from './datamodel';
/**
 * A data model implementation for in-memory JSON data.
 */
export declare class JSONModel extends DataModel {
    /**
     * Create a data model with static JSON data.
     *
     * @param options - The options for initializing the data model.
     */
    constructor(options: JSONModel.IOptions);
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
     * Get the metadata for a column in the data model.
     *
     * @param region - The cell region of interest.
     *
     * @param column - The index of the column of interest.
     *
     * @returns The metadata for the column.
     */
    metadata(region: DataModel.CellRegion, column: number): DataModel.Metadata;
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
     *
     * #### Notes
     * A `missingValue` as defined by the schema is converted to `null`.
     */
    data(region: DataModel.CellRegion, row: number, column: number): any;
    private _data;
    private _bodyFields;
    private _headerFields;
    private _missingValues;
}
/**
 * The namespace for the `JSONModel` class statics.
 */
export declare namespace JSONModel {
    /**
     * An object which describes a column of data in the model.
     *
     * #### Notes
     * This is based on the JSON Table Schema specification:
     * https://specs.frictionlessdata.io/table-schema/
     */
    interface IField {
        /**
         * The name of the column.
         *
         * This is used as the key to extract a value from a data record.
         * It is also used as the column header label, unless the `title`
         * property is provided.
         */
        readonly name: string;
        /**
         * The type of data held in the column.
         */
        readonly type?: string;
        /**
         * The format of the data in the column.
         */
        readonly format?: string;
        /**
         * The human readable name for the column.
         *
         * This is used as the label for the column header.
         */
        readonly title?: string;
    }
    /**
     * An object when specifies the schema for a data model.
     *
     * #### Notes
     * This is based on the JSON Table Schema specification:
     * https://specs.frictionlessdata.io/table-schema/
     */
    interface ISchema {
        /**
         * The fields which describe the data model columns.
         *
         * Primary key fields are rendered as row header columns.
         */
        readonly fields: IField[];
        /**
         * The values to treat as "missing" data.
         *
         * Missing values are automatically converted to `null`.
         */
        readonly missingValues?: string[];
        /**
         * The field names which act as primary keys.
         *
         * Primary key fields are rendered as row header columns.
         */
        readonly primaryKey?: string | string[];
    }
    /**
     * A type alias for a data source for a JSON data model.
     *
     * A data source is an array of JSON object records which represent
     * the rows of the table. The keys of the records correspond to the
     * field names of the columns.
     */
    type DataSource = ReadonlyArray<ReadonlyJSONObject>;
    /**
     * An options object for initializing a JSON data model.
     */
    interface IOptions {
        /**
         * The schema for the for the data model.
         *
         * The schema should be treated as an immutable object.
         */
        schema: ISchema;
        /**
         * The data source for the data model.
         *
         * The data model takes full ownership of the data source.
         */
        data: DataSource;
    }
}
