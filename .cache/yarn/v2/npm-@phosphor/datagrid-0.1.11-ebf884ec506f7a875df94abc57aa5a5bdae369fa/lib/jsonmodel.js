"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var datamodel_1 = require("./datamodel");
/**
 * A data model implementation for in-memory JSON data.
 */
var JSONModel = /** @class */ (function (_super) {
    __extends(JSONModel, _super);
    /**
     * Create a data model with static JSON data.
     *
     * @param options - The options for initializing the data model.
     */
    function JSONModel(options) {
        var _this = _super.call(this) || this;
        var split = Private.splitFields(options.schema);
        _this._data = options.data;
        _this._bodyFields = split.bodyFields;
        _this._headerFields = split.headerFields;
        _this._missingValues = Private.createMissingMap(options.schema);
        return _this;
    }
    /**
     * Get the row count for a region in the data model.
     *
     * @param region - The row region of interest.
     *
     * @returns - The row count for the region.
     */
    JSONModel.prototype.rowCount = function (region) {
        if (region === 'body') {
            return this._data.length;
        }
        return 1; // TODO multiple column-header rows?
    };
    /**
     * Get the column count for a region in the data model.
     *
     * @param region - The column region of interest.
     *
     * @returns - The column count for the region.
     */
    JSONModel.prototype.columnCount = function (region) {
        if (region === 'body') {
            return this._bodyFields.length;
        }
        return this._headerFields.length;
    };
    /**
     * Get the metadata for a column in the data model.
     *
     * @param region - The cell region of interest.
     *
     * @param column - The index of the column of interest.
     *
     * @returns The metadata for the column.
     */
    JSONModel.prototype.metadata = function (region, column) {
        if (region === 'body' || region === 'column-header') {
            return this._bodyFields[column];
        }
        return this._headerFields[column];
    };
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
    JSONModel.prototype.data = function (region, row, column) {
        // Set up the field and value variables.
        var field;
        var value;
        // Look up the field and value for the region.
        switch (region) {
            case 'body':
                field = this._bodyFields[column];
                value = this._data[row][field.name];
                break;
            case 'column-header':
                field = this._bodyFields[column];
                value = field.title || field.name;
                break;
            case 'row-header':
                field = this._headerFields[column];
                value = this._data[row][field.name];
                break;
            case 'corner-header':
                field = this._headerFields[column];
                value = field.title || field.name;
                break;
            default:
                throw 'unreachable';
        }
        // Test whether the value is a missing value.
        var missing = (this._missingValues !== null &&
            typeof value === 'string' &&
            this._missingValues[value] === true);
        // Return the final value.
        return missing ? null : value;
    };
    return JSONModel;
}(datamodel_1.DataModel));
exports.JSONModel = JSONModel;
/**
 * The namespace for the module implementation details.
 */
var Private;
(function (Private) {
    /**
     * Split the schema fields into header and body fields.
     */
    function splitFields(schema) {
        // Normalize the primary keys.
        var primaryKeys;
        if (schema.primaryKey === undefined) {
            primaryKeys = [];
        }
        else if (typeof schema.primaryKey === 'string') {
            primaryKeys = [schema.primaryKey];
        }
        else {
            primaryKeys = schema.primaryKey;
        }
        // Separate the fields for the body and header.
        var bodyFields = [];
        var headerFields = [];
        for (var _i = 0, _a = schema.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            if (primaryKeys.indexOf(field.name) === -1) {
                bodyFields.push(field);
            }
            else {
                headerFields.push(field);
            }
        }
        // Return the separated fields.
        return { bodyFields: bodyFields, headerFields: headerFields };
    }
    Private.splitFields = splitFields;
    /**
     * Create a missing values map for a schema.
     *
     * This returns `null` if there are no missing values.
     */
    function createMissingMap(schema) {
        // Bail early if there are no missing values.
        if (!schema.missingValues || schema.missingValues.length === 0) {
            return null;
        }
        // Collect the missing values into a map.
        var result = Object.create(null);
        for (var _i = 0, _a = schema.missingValues; _i < _a.length; _i++) {
            var value = _a[_i];
            result[value] = true;
        }
        // Return the populated map.
        return result;
    }
    Private.createMissingMap = createMissingMap;
})(Private || (Private = {}));
