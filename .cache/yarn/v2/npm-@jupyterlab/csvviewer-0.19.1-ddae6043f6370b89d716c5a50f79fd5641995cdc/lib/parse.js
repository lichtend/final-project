"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Possible parser states.
 */
var STATE;
(function (STATE) {
    STATE[STATE["QUOTED_FIELD"] = 0] = "QUOTED_FIELD";
    STATE[STATE["QUOTED_FIELD_QUOTE"] = 1] = "QUOTED_FIELD_QUOTE";
    STATE[STATE["UNQUOTED_FIELD"] = 2] = "UNQUOTED_FIELD";
    STATE[STATE["NEW_FIELD"] = 3] = "NEW_FIELD";
    STATE[STATE["NEW_ROW"] = 4] = "NEW_ROW";
})(STATE || (STATE = {}));
/**
 * Possible row delimiters for the parser.
 */
var ROW_DELIMITER;
(function (ROW_DELIMITER) {
    ROW_DELIMITER[ROW_DELIMITER["CR"] = 0] = "CR";
    ROW_DELIMITER[ROW_DELIMITER["CRLF"] = 1] = "CRLF";
    ROW_DELIMITER[ROW_DELIMITER["LF"] = 2] = "LF";
})(ROW_DELIMITER || (ROW_DELIMITER = {}));
/**
 * Parse delimiter-separated data.
 *
 * @param options: The parser options
 * @returns An object giving the offsets for the rows or columns parsed.
 *
 * #### Notes
 * This implementation is based on [RFC 4180](https://tools.ietf.org/html/rfc4180).
 */
function parseDSV(options) {
    const { data, columnOffsets, delimiter = ',', startIndex = 0, maxRows = 0xffffffff, rowDelimiter = '\r\n', quote = '"' } = options;
    // ncols will be set automatically if it is undefined.
    let ncols = options.ncols;
    // The number of rows we've already parsed.
    let nrows = 0;
    // The row or column offsets we return.
    let offsets = [];
    // Set up some useful local variables.
    const CH_DELIMITER = delimiter.charCodeAt(0);
    const CH_QUOTE = quote.charCodeAt(0);
    const CH_LF = 10; // \n
    const CH_CR = 13; // \r
    const endIndex = data.length;
    const { QUOTED_FIELD, QUOTED_FIELD_QUOTE, UNQUOTED_FIELD, NEW_FIELD, NEW_ROW } = STATE;
    const { CR, LF, CRLF } = ROW_DELIMITER;
    const [rowDelimiterCode, rowDelimiterLength] = rowDelimiter === '\r\n'
        ? [CRLF, 2]
        : rowDelimiter === '\r'
            ? [CR, 1]
            : [LF, 1];
    // Always start off at the beginning of a row.
    let state = NEW_ROW;
    // Set up the starting index.
    let i = startIndex;
    // We initialize to 0 just in case we are asked to parse past the end of the
    // string. In that case, we want the number of columns to be 0.
    let col = 0;
    // Declare some useful temporaries
    let char;
    // Loop through the data string
    while (i < endIndex) {
        // i is the index of a character in the state.
        // If we just hit a new row, and there are still characters left, push a new
        // offset on and reset the column counter. We want this logic at the top of
        // the while loop rather than the bottom because we don't want a trailing
        // row delimiter at the end of the data to trigger a new row offset.
        if (state === NEW_ROW) {
            // Start a new row and reset the column counter.
            offsets.push(i);
            col = 1;
        }
        // Below, we handle this character, modify the parser state and increment the index to be consistent.
        // Get the integer code for the current character, so the comparisons below
        // are faster.
        char = data.charCodeAt(i);
        // Update the parser state. This switch statement is responsible for
        // updating the state to be consistent with the index i+1 (we increment i
        // after the switch statement). In some situations, we may increment i
        // inside this loop to skip over indices as a shortcut.
        switch (state) {
            // At the beginning of a row or field, we can have a quote, row delimiter, or field delimiter.
            case NEW_ROW:
            case NEW_FIELD:
                switch (char) {
                    // If we have a quote, we are starting an escaped field.
                    case CH_QUOTE:
                        state = QUOTED_FIELD;
                        break;
                    // A field delimiter means we are starting a new field.
                    case CH_DELIMITER:
                        state = NEW_FIELD;
                        break;
                    // A row delimiter means we are starting a new row.
                    case CH_CR:
                        if (rowDelimiterCode === CR) {
                            state = NEW_ROW;
                        }
                        else if (rowDelimiterCode === CRLF &&
                            data.charCodeAt(i + 1) === CH_LF) {
                            // If we see an expected \r\n, then increment to the end of the delimiter.
                            i++;
                            state = NEW_ROW;
                        }
                        else {
                            throw `string index ${i} (in row ${nrows}, column ${col}): carriage return found, but not as part of a row delimiter C ${data.charCodeAt(i + 1)}`;
                        }
                        break;
                    case CH_LF:
                        if (rowDelimiterCode === LF) {
                            state = NEW_ROW;
                        }
                        else {
                            throw `string index ${i} (in row ${nrows}, column ${col}): line feed found, but row delimiter starts with a carriage return`;
                        }
                        break;
                    // Otherwise, we are starting an unquoted field.
                    default:
                        state = UNQUOTED_FIELD;
                        break;
                }
                break;
            // We are in a quoted field.
            case QUOTED_FIELD:
                // Skip ahead until we see another quote, which either ends the quoted
                // field or starts an escaped quote.
                i = data.indexOf(quote, i);
                if (i < 0) {
                    throw `string index ${i} (in row ${nrows}, column ${col}): mismatched quote`;
                }
                state = QUOTED_FIELD_QUOTE;
                break;
            // We just saw a quote in a quoted field. This could be the end of the
            // field, or it could be a repeated quote (i.e., an escaped quote according
            // to RFC 4180).
            case QUOTED_FIELD_QUOTE:
                switch (char) {
                    // Another quote means we just saw an escaped quote, so we are still in
                    // the quoted field.
                    case CH_QUOTE:
                        state = QUOTED_FIELD;
                        break;
                    // A field or row delimiter means the quoted field just ended and we are
                    // going into a new field or new row.
                    case CH_DELIMITER:
                        state = NEW_FIELD;
                        break;
                    // A row delimiter means we are starting a new row in the next index.
                    case CH_CR:
                        if (rowDelimiterCode === CR) {
                            state = NEW_ROW;
                        }
                        else if (rowDelimiterCode === CRLF &&
                            data.charCodeAt(i + 1) === CH_LF) {
                            // If we see an expected \r\n, then increment to the end of the delimiter.
                            i++;
                            state = NEW_ROW;
                        }
                        else {
                            throw `string index ${i} (in row ${nrows}, column ${col}): carriage return found, but not as part of a row delimiter C ${data.charCodeAt(i + 1)}`;
                        }
                        break;
                    case CH_LF:
                        if (rowDelimiterCode === LF) {
                            state = NEW_ROW;
                        }
                        else {
                            throw `string index ${i} (in row ${nrows}, column ${col}): line feed found, but row delimiter starts with a carriage return`;
                        }
                        break;
                    default:
                        throw `string index ${i} (in row ${nrows}, column ${col}): quote in escaped field not followed by quote, delimiter, or row delimiter`;
                }
                break;
            // We are in an unquoted field, so the only thing we look for is the next
            // row or field delimiter.
            case UNQUOTED_FIELD:
                // Skip ahead to either the next field delimiter or possible start of a
                // row delimiter (CR or LF).
                while (i < endIndex) {
                    char = data.charCodeAt(i);
                    if (char === CH_DELIMITER || char === CH_LF || char === CH_CR) {
                        break;
                    }
                    i++;
                }
                // Process the character we're seeing in an unquoted field.
                switch (char) {
                    // A field delimiter means we are starting a new field.
                    case CH_DELIMITER:
                        state = NEW_FIELD;
                        break;
                    // A row delimiter means we are starting a new row in the next index.
                    case CH_CR:
                        if (rowDelimiterCode === CR) {
                            state = NEW_ROW;
                        }
                        else if (rowDelimiterCode === CRLF &&
                            data.charCodeAt(i + 1) === CH_LF) {
                            // If we see an expected \r\n, then increment to the end of the delimiter.
                            i++;
                            state = NEW_ROW;
                        }
                        else {
                            throw `string index ${i} (in row ${nrows}, column ${col}): carriage return found, but not as part of a row delimiter C ${data.charCodeAt(i + 1)}`;
                        }
                        break;
                    case CH_LF:
                        if (rowDelimiterCode === LF) {
                            state = NEW_ROW;
                        }
                        else {
                            throw `string index ${i} (in row ${nrows}, column ${col}): line feed found, but row delimiter starts with a carriage return`;
                        }
                        break;
                    // Otherwise, we continue on in the unquoted field.
                    default:
                        continue;
                }
                break;
            // We should never reach this point since the parser state is handled above,
            // so throw an error if we do.
            default:
                throw `string index ${i} (in row ${nrows}, column ${col}): state not recognized`;
        }
        // Increment i to the next character index
        i++;
        // Update return values based on state.
        switch (state) {
            case NEW_ROW:
                nrows++;
                // If we just parsed the first row and the ncols is undefined, set it to
                // the number of columns we found in the first row.
                if (nrows === 1 && ncols === undefined) {
                    ncols = col;
                }
                // Pad or truncate the column offsets in the previous row if we are
                // returning them.
                if (columnOffsets === true) {
                    if (col < ncols) {
                        // We didn't have enough columns, so add some more column offsets that
                        // point to just before the row delimiter we just saw.
                        for (; col < ncols; col++) {
                            offsets.push(i - rowDelimiterLength);
                        }
                    }
                    else if (col > ncols) {
                        // We had too many columns, so truncate them.
                        offsets.length = offsets.length - (col - ncols);
                    }
                }
                // Shortcut return if nrows reaches the maximum rows we are to parse.
                if (nrows === maxRows) {
                    return { nrows, ncols: columnOffsets ? ncols : 0, offsets };
                }
                break;
            case NEW_FIELD:
                // If we are returning column offsets, log the current index.
                if (columnOffsets === true) {
                    offsets.push(i);
                }
                // Update the column counter.
                col++;
                break;
            default:
                break;
        }
    }
    // If we finished parsing and we are *not* in the NEW_ROW state, then do the
    // column padding/truncation for the last row. Also make sure ncols is
    // defined.
    if (state !== NEW_ROW) {
        nrows++;
        if (columnOffsets === true) {
            // If ncols is *still* undefined, then we only parsed one row and didn't
            // have a newline, so set it to the number of columns we found.
            if (ncols === undefined) {
                ncols = col;
            }
            if (col < ncols) {
                // We didn't have enough columns, so add some more column offsets that
                // point to just before the row delimiter we just saw.
                for (; col < ncols; col++) {
                    offsets.push(i - (rowDelimiterLength - 1));
                }
            }
            else if (col > ncols) {
                // We had too many columns, so truncate them.
                offsets.length = offsets.length - (col - ncols);
            }
        }
    }
    return { nrows, ncols: columnOffsets ? ncols : 0, offsets };
}
exports.parseDSV = parseDSV;
/**
 * Parse delimiter-separated data where no delimiter is quoted.
 *
 * @param options: The parser options
 * @returns An object giving the offsets for the rows or columns parsed.
 *
 * #### Notes
 * This function is an optimized parser for cases where there are no field or
 * row delimiters in quotes. Note that the data can have quotes, but they are
 * not interpreted in any special way. This implementation is based on [RFC
 * 4180](https://tools.ietf.org/html/rfc4180), but disregards quotes.
 */
function parseDSVNoQuotes(options) {
    // Set option defaults.
    const { data, columnOffsets, delimiter = ',', rowDelimiter = '\r\n', startIndex = 0, maxRows = 0xffffffff } = options;
    // ncols will be set automatically if it is undefined.
    let ncols = options.ncols;
    // Set up our return variables.
    let offsets = [];
    let nrows = 0;
    // Set up various state variables.
    let rowDelimiterLength = rowDelimiter.length;
    let currRow = startIndex;
    let len = data.length;
    let nextRow;
    let col;
    let rowString;
    let colIndex;
    // The end of the current row.
    let rowEnd;
    // Start parsing at the start index.
    nextRow = startIndex;
    // Loop through rows until we run out of data or we've reached maxRows.
    while (nextRow !== -1 && nrows < maxRows && currRow < len) {
        // Store the offset for the beginning of the row and increment the rows.
        offsets.push(currRow);
        nrows++;
        // Find the next row delimiter.
        nextRow = data.indexOf(rowDelimiter, currRow);
        // If the next row delimiter is not found, set the end of the row to the
        // end of the data string.
        rowEnd = nextRow === -1 ? len : nextRow;
        // If we are returning column offsets, push them onto the array.
        if (columnOffsets === true) {
            // Find the next field delimiter. We slice the current row out so that
            // the indexOf will stop at the end of the row. It may possibly be faster
            // to just use a loop to check each character.
            col = 1;
            rowString = data.slice(currRow, rowEnd);
            colIndex = rowString.indexOf(delimiter);
            if (ncols === undefined) {
                // If we don't know how many columns we need, loop through and find all
                // of the field delimiters in this row.
                while (colIndex !== -1) {
                    offsets.push(currRow + colIndex + 1);
                    col++;
                    colIndex = rowString.indexOf(delimiter, colIndex + 1);
                }
                // Set ncols to the number of fields we found.
                ncols = col;
            }
            else {
                // If we know the number of columns we expect, find the field delimiters
                // up to that many columns.
                while (colIndex !== -1 && col < ncols) {
                    offsets.push(currRow + colIndex + 1);
                    col++;
                    colIndex = rowString.indexOf(delimiter, colIndex + 1);
                }
                // If we didn't reach the number of columns we expected, pad the offsets
                // with the offset just before the row delimiter.
                while (col < ncols) {
                    offsets.push(rowEnd);
                    col++;
                }
            }
        }
        // Skip past the row delimiter at the end of the row.
        currRow = rowEnd + rowDelimiterLength;
    }
    return { nrows, ncols: columnOffsets ? ncols : 0, offsets };
}
exports.parseDSVNoQuotes = parseDSVNoQuotes;
