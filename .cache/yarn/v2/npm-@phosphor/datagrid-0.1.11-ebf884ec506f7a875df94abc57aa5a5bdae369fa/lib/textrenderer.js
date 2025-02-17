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
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
var cellrenderer_1 = require("./cellrenderer");
/**
 * A cell renderer which renders data values as text.
 */
var TextRenderer = /** @class */ (function (_super) {
    __extends(TextRenderer, _super);
    /**
     * Construct a new text renderer.
     *
     * @param options - The options for initializing the renderer.
     */
    function TextRenderer(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.font = options.font || '12px sans-serif';
        _this.textColor = options.textColor || '#000000';
        _this.backgroundColor = options.backgroundColor || '';
        _this.verticalAlignment = options.verticalAlignment || 'center';
        _this.horizontalAlignment = options.horizontalAlignment || 'left';
        _this.format = options.format || TextRenderer.formatGeneric();
        return _this;
    }
    /**
     * Paint the content for a cell.
     *
     * @param gc - The graphics context to use for drawing.
     *
     * @param config - The configuration data for the cell.
     */
    TextRenderer.prototype.paint = function (gc, config) {
        this.drawBackground(gc, config);
        this.drawText(gc, config);
    };
    /**
     * Prepare the graphics context for drawing a column of cells.
     *
     * @param gc - The graphics context to prepare.
     *
     * @param row - The index of the first row to be rendered.
     *
     * @param col - The index of the column to be rendered.
     *
     * @param field - The field descriptor for the column, or `null`.
     */
    TextRenderer.prototype.prepare = function (gc, config) {
        // Look up the default state from the renderer.
        var _a = this, font = _a.font, textColor = _a.textColor, backgroundColor = _a.backgroundColor, horizontalAlignment = _a.horizontalAlignment;
        // Set up the default font.
        if (font && typeof font === 'string') {
            gc.font = font;
        }
        // Set up the default fill style.
        if (backgroundColor && typeof backgroundColor === 'string') {
            gc.fillStyle = backgroundColor;
        }
        else if (textColor && typeof textColor === 'string') {
            gc.fillStyle = textColor;
        }
        // Set up the default text alignment.
        if (typeof horizontalAlignment === 'string') {
            gc.textAlign = horizontalAlignment;
        }
        else {
            gc.textAlign = 'left';
        }
        // Set up the default text baseline.
        gc.textBaseline = 'bottom';
    };
    /**
     * Draw the background for the cell.
     *
     * @param gc - The graphics context to use for drawing.
     *
     * @param config - The configuration data for the cell.
     */
    TextRenderer.prototype.drawBackground = function (gc, config) {
        // Resolve the background color for the cell.
        var color = cellrenderer_1.CellRenderer.resolveOption(this.backgroundColor, config);
        // Bail if there is no background color to draw.
        if (!color) {
            return;
        }
        // Fill the cell with the background color.
        gc.fillStyle = color;
        gc.fillRect(config.x, config.y, config.width, config.height);
    };
    /**
     * Draw the text for the cell.
     *
     * @param gc - The graphics context to use for drawing.
     *
     * @param config - The configuration data for the cell.
     */
    TextRenderer.prototype.drawText = function (gc, config) {
        // Resolve the font for the cell.
        var font = cellrenderer_1.CellRenderer.resolveOption(this.font, config);
        // Bail if there is no font to draw.
        if (!font) {
            return;
        }
        // Resolve the text color for the cell.
        var color = cellrenderer_1.CellRenderer.resolveOption(this.textColor, config);
        // Bail if there is no text color to draw.
        if (!color) {
            return;
        }
        // Format the cell value to text.
        var format = this.format;
        var text = format(config);
        // Bail if there is no text to draw.
        if (!text) {
            return;
        }
        // Resolve the vertical and horizontal alignment.
        var vAlign = cellrenderer_1.CellRenderer.resolveOption(this.verticalAlignment, config);
        var hAlign = cellrenderer_1.CellRenderer.resolveOption(this.horizontalAlignment, config);
        // Compute the padded text box height for the specified alignment.
        var boxHeight = config.height - (vAlign === 'center' ? 1 : 2);
        // Bail if the text box has no effective size.
        if (boxHeight <= 0) {
            return;
        }
        // Compute the text height for the gc font.
        var textHeight = TextRenderer.measureFontHeight(font);
        // Set up the text position variables.
        var textX;
        var textY;
        // Compute the Y position for the text.
        switch (vAlign) {
            case 'top':
                textY = config.y + 2 + textHeight;
                break;
            case 'center':
                textY = config.y + config.height / 2 + textHeight / 2;
                break;
            case 'bottom':
                textY = config.y + config.height - 2;
                break;
            default:
                throw 'unreachable';
        }
        // Compute the X position for the text.
        switch (hAlign) {
            case 'left':
                textX = config.x + 2;
                break;
            case 'center':
                textX = config.x + config.width / 2;
                break;
            case 'right':
                textX = config.x + config.width - 3;
                break;
            default:
                throw 'unreachable';
        }
        // Clip the cell if the text is taller than the text box height.
        if (textHeight > boxHeight) {
            gc.beginPath();
            gc.rect(config.x, config.y, config.width, config.height - 1);
            gc.clip();
        }
        // Set the gc state.
        gc.font = font;
        gc.fillStyle = color;
        gc.textAlign = hAlign;
        gc.textBaseline = 'bottom';
        // Draw the text for the cell.
        gc.fillText(text, textX, textY);
    };
    return TextRenderer;
}(cellrenderer_1.CellRenderer));
exports.TextRenderer = TextRenderer;
/**
 * The namespace for the `TextRenderer` class statics.
 */
(function (TextRenderer) {
    /**
     * Create a generic text format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new generic text format function.
     *
     * #### Notes
     * This formatter uses the builtin `String()` to coerce any value
     * to a string.
     */
    function formatGeneric(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            return String(value);
        };
    }
    TextRenderer.formatGeneric = formatGeneric;
    /**
     * Create a fixed decimal format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new fixed decimal format function.
     *
     * #### Notes
     * This formatter uses the builtin `Number()` and `toFixed()` to
     * coerce values.
     *
     * The `formatIntlNumber()` formatter is more flexible, but slower.
     */
    function formatFixed(options) {
        if (options === void 0) { options = {}; }
        var digits = options.digits;
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            return Number(value).toFixed(digits);
        };
    }
    TextRenderer.formatFixed = formatFixed;
    /**
     * Create a significant figure format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new significant figure format function.
     *
     * #### Notes
     * This formatter uses the builtin `Number()` and `toPrecision()`
     * to coerce values.
     *
     * The `formatIntlNumber()` formatter is more flexible, but slower.
     */
    function formatPrecision(options) {
        if (options === void 0) { options = {}; }
        var digits = options.digits;
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            return Number(value).toPrecision(digits);
        };
    }
    TextRenderer.formatPrecision = formatPrecision;
    /**
     * Create a scientific notation format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new scientific notation format function.
     *
     * #### Notes
     * This formatter uses the builtin `Number()` and `toExponential()`
     * to coerce values.
     *
     * The `formatIntlNumber()` formatter is more flexible, but slower.
     */
    function formatExponential(options) {
        if (options === void 0) { options = {}; }
        var digits = options.digits;
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            return Number(value).toExponential(digits);
        };
    }
    TextRenderer.formatExponential = formatExponential;
    /**
     * Create an international number format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new international number format function.
     *
     * #### Notes
     * This formatter uses the builtin `Intl.NumberFormat` object to
     * coerce values.
     *
     * This is the most flexible (but slowest) number formatter.
     */
    function formatIntlNumber(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        var nft = new Intl.NumberFormat(options.locales, options.options);
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            return nft.format(value);
        };
    }
    TextRenderer.formatIntlNumber = formatIntlNumber;
    /**
     * Create a date format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new date format function.
     *
     * #### Notes
     * This formatter uses `Date.toDateString()` to format the values.
     *
     * If a value is not a `Date` object, `new Date(value)` is used to
     * coerce the value to a date.
     *
     * The `formatIntlDateTime()` formatter is more flexible, but slower.
     */
    function formatDate(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            if (value instanceof Date) {
                return value.toDateString();
            }
            return (new Date(value)).toDateString();
        };
    }
    TextRenderer.formatDate = formatDate;
    /**
     * Create a time format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new time format function.
     *
     * #### Notes
     * This formatter uses `Date.toTimeString()` to format the values.
     *
     * If a value is not a `Date` object, `new Date(value)` is used to
     * coerce the value to a date.
     *
     * The `formatIntlDateTime()` formatter is more flexible, but slower.
     */
    function formatTime(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            if (value instanceof Date) {
                return value.toTimeString();
            }
            return (new Date(value)).toTimeString();
        };
    }
    TextRenderer.formatTime = formatTime;
    /**
     * Create an ISO datetime format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new ISO datetime format function.
     *
     * #### Notes
     * This formatter uses `Date.toISOString()` to format the values.
     *
     * If a value is not a `Date` object, `new Date(value)` is used to
     * coerce the value to a date.
     *
     * The `formatIntlDateTime()` formatter is more flexible, but slower.
     */
    function formatISODateTime(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            return (new Date(value)).toISOString();
        };
    }
    TextRenderer.formatISODateTime = formatISODateTime;
    /**
     * Create a UTC datetime format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new UTC datetime format function.
     *
     * #### Notes
     * This formatter uses `Date.toUTCString()` to format the values.
     *
     * If a value is not a `Date` object, `new Date(value)` is used to
     * coerce the value to a date.
     *
     * The `formatIntlDateTime()` formatter is more flexible, but slower.
     */
    function formatUTCDateTime(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            if (value instanceof Date) {
                return value.toUTCString();
            }
            return (new Date(value)).toUTCString();
        };
    }
    TextRenderer.formatUTCDateTime = formatUTCDateTime;
    /**
     * Create an international datetime format function.
     *
     * @param options - The options for creating the format function.
     *
     * @returns A new international datetime format function.
     *
     * #### Notes
     * This formatter uses the builtin `Intl.DateTimeFormat` object to
     * coerce values.
     *
     * This is the most flexible (but slowest) datetime formatter.
     */
    function formatIntlDateTime(options) {
        if (options === void 0) { options = {}; }
        var missing = options.missing || '';
        var dtf = new Intl.DateTimeFormat(options.locales, options.options);
        return function (_a) {
            var value = _a.value;
            if (value === null || value === undefined) {
                return missing;
            }
            return dtf.format(value);
        };
    }
    TextRenderer.formatIntlDateTime = formatIntlDateTime;
    /**
     * Measure the height of a font.
     *
     * @param font - The CSS font string of interest.
     *
     * @returns The height of the font bounding box.
     *
     * #### Notes
     * This function uses a temporary DOM node to measure the text box
     * height for the specified font. The first call for a given font
     * will incur a DOM reflow, but the return value is cached, so any
     * subsequent call for the same font will return the cached value.
     */
    function measureFontHeight(font) {
        // Look up the cached font height.
        var height = Private.fontHeightCache[font];
        // Return the cached font height if it exists.
        if (height !== undefined) {
            return height;
        }
        // Normalize the font.
        Private.fontMeasurementGC.font = font;
        var normFont = Private.fontMeasurementGC.font;
        // Set the font on the measurement node.
        Private.fontMeasurementNode.style.font = normFont;
        // Add the measurement node to the document.
        document.body.appendChild(Private.fontMeasurementNode);
        // Measure the node height.
        height = Private.fontMeasurementNode.offsetHeight;
        // Remove the measurement node from the document.
        document.body.removeChild(Private.fontMeasurementNode);
        // Cache the measured height for the font and norm font.
        Private.fontHeightCache[font] = height;
        Private.fontHeightCache[normFont] = height;
        // Return the measured height.
        return height;
    }
    TextRenderer.measureFontHeight = measureFontHeight;
})(TextRenderer = exports.TextRenderer || (exports.TextRenderer = {}));
exports.TextRenderer = TextRenderer;
/**
 * The namespace for the module implementation details.
 */
var Private;
(function (Private) {
    /**
     * A cache of measured font heights.
     */
    Private.fontHeightCache = Object.create(null);
    /**
     * The DOM node used for font height measurement.
     */
    Private.fontMeasurementNode = (function () {
        var node = document.createElement('div');
        node.style.position = 'absolute';
        node.style.top = '-99999px';
        node.style.left = '-99999px';
        node.style.visibility = 'hidden';
        node.textContent = 'M';
        return node;
    })();
    /**
     * The GC used for font measurement.
     */
    Private.fontMeasurementGC = (function () {
        var canvas = document.createElement('canvas');
        canvas.width = 0;
        canvas.height = 0;
        return canvas.getContext('2d');
    })();
})(Private || (Private = {}));
