import { CellRenderer } from './cellrenderer';
import { GraphicsContext } from './graphicscontext';
/**
 * A cell renderer which renders data values as text.
 */
export declare class TextRenderer extends CellRenderer {
    /**
     * Construct a new text renderer.
     *
     * @param options - The options for initializing the renderer.
     */
    constructor(options?: TextRenderer.IOptions);
    /**
     * The CSS shorthand font for drawing the text.
     */
    readonly font: CellRenderer.ConfigOption<string>;
    /**
     * The CSS color for drawing the text.
     */
    readonly textColor: CellRenderer.ConfigOption<string>;
    /**
     * The CSS color for the cell background.
     */
    readonly backgroundColor: CellRenderer.ConfigOption<string>;
    /**
     * The vertical alignment for the cell text.
     */
    readonly verticalAlignment: CellRenderer.ConfigOption<TextRenderer.VerticalAlignment>;
    /**
     * The horizontal alignment for the cell text.
     */
    readonly horizontalAlignment: CellRenderer.ConfigOption<TextRenderer.HorizontalAlignment>;
    /**
     * The format function for the cell value.
     */
    readonly format: TextRenderer.FormatFunc;
    /**
     * Paint the content for a cell.
     *
     * @param gc - The graphics context to use for drawing.
     *
     * @param config - The configuration data for the cell.
     */
    paint(gc: GraphicsContext, config: CellRenderer.ICellConfig): void;
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
    prepare(gc: GraphicsContext, config: CellRenderer.IColumnConfig): void;
    /**
     * Draw the background for the cell.
     *
     * @param gc - The graphics context to use for drawing.
     *
     * @param config - The configuration data for the cell.
     */
    drawBackground(gc: GraphicsContext, config: CellRenderer.ICellConfig): void;
    /**
     * Draw the text for the cell.
     *
     * @param gc - The graphics context to use for drawing.
     *
     * @param config - The configuration data for the cell.
     */
    drawText(gc: GraphicsContext, config: CellRenderer.ICellConfig): void;
}
/**
 * The namespace for the `TextRenderer` class statics.
 */
export declare namespace TextRenderer {
    /**
     * A type alias for the supported vertical alignment modes.
     */
    type VerticalAlignment = 'top' | 'center' | 'bottom';
    /**
     * A type alias for the supported horizontal alignment modes.
     */
    type HorizontalAlignment = 'left' | 'center' | 'right';
    /**
     * An options object for initializing a text renderer.
     */
    interface IOptions {
        /**
         * The font for drawing the cell text.
         *
         * The default is `'12px sans-serif'`.
         */
        font?: CellRenderer.ConfigOption<string>;
        /**
         * The color for the drawing the cell text.
         *
         * The default `'#000000'`.
         */
        textColor?: CellRenderer.ConfigOption<string>;
        /**
         * The background color for the cells.
         *
         * The default is `''`.
         */
        backgroundColor?: CellRenderer.ConfigOption<string>;
        /**
         * The vertical alignment for the cell text.
         *
         * The default is `'center'`.
         */
        verticalAlignment?: CellRenderer.ConfigOption<VerticalAlignment>;
        /**
         * The horizontal alignment for the cell text.
         *
         * The default is `'left'`.
         */
        horizontalAlignment?: CellRenderer.ConfigOption<HorizontalAlignment>;
        /**
         * The format function for the renderer.
         *
         * The default is `TextRenderer.formatGeneric()`.
         */
        format?: FormatFunc;
    }
    /**
     * A type alias for a format function.
     */
    type FormatFunc = CellRenderer.ConfigFunc<string>;
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
    function formatGeneric(options?: formatGeneric.IOptions): FormatFunc;
    /**
     * The namespace for the `formatGeneric` function statics.
     */
    namespace formatGeneric {
        /**
         * The options for creating a generic format function.
         */
        interface IOptions {
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatFixed(options?: formatFixed.IOptions): FormatFunc;
    /**
     * The namespace for the `formatFixed` function statics.
     */
    namespace formatFixed {
        /**
         * The options for creating a fixed format function.
         */
        interface IOptions {
            /**
             * The number of digits to include after the decimal point.
             *
             * The default is determined by the user agent.
             */
            digits?: number;
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatPrecision(options?: formatPrecision.IOptions): FormatFunc;
    /**
     * The namespace for the `formatPrecision` function statics.
     */
    namespace formatPrecision {
        /**
         * The options for creating a precision format function.
         */
        interface IOptions {
            /**
             * The number of significant figures to include in the value.
             *
             * The default is determined by the user agent.
             */
            digits?: number;
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatExponential(options?: formatExponential.IOptions): FormatFunc;
    /**
     * The namespace for the `formatExponential` function statics.
     */
    namespace formatExponential {
        /**
         * The options for creating an exponential format function.
         */
        interface IOptions {
            /**
             * The number of digits to include after the decimal point.
             *
             * The default is determined by the user agent.
             */
            digits?: number;
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatIntlNumber(options?: formatIntlNumber.IOptions): FormatFunc;
    /**
     * The namespace for the `formatIntlNumber` function statics.
     */
    namespace formatIntlNumber {
        /**
         * The options for creating an intl number format function.
         */
        interface IOptions {
            /**
             * The locales to pass to the `Intl.NumberFormat` constructor.
             *
             * The default is determined by the user agent.
             */
            locales?: string | string[];
            /**
             * The options to pass to the `Intl.NumberFormat` constructor.
             *
             * The default is determined by the user agent.
             */
            options?: Intl.NumberFormatOptions;
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatDate(options?: formatDate.IOptions): FormatFunc;
    /**
     * The namespace for the `formatDate` function statics.
     */
    namespace formatDate {
        /**
         * The options for creating a date format function.
         */
        interface IOptions {
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatTime(options?: formatTime.IOptions): FormatFunc;
    /**
     * The namespace for the `formatTime` function statics.
     */
    namespace formatTime {
        /**
         * The options for creating a time format function.
         */
        interface IOptions {
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatISODateTime(options?: formatISODateTime.IOptions): FormatFunc;
    /**
     * The namespace for the `formatISODateTime` function statics.
     */
    namespace formatISODateTime {
        /**
         * The options for creating an ISO datetime format function.
         */
        interface IOptions {
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatUTCDateTime(options?: formatUTCDateTime.IOptions): FormatFunc;
    /**
     * The namespace for the `formatUTCDateTime` function statics.
     */
    namespace formatUTCDateTime {
        /**
         * The options for creating a UTC datetime format function.
         */
        interface IOptions {
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function formatIntlDateTime(options?: formatIntlDateTime.IOptions): FormatFunc;
    /**
     * The namespace for the `formatIntlDateTime` function statics.
     */
    namespace formatIntlDateTime {
        /**
         * The options for creating an intl datetime format function.
         */
        interface IOptions {
            /**
             * The locales to pass to the `Intl.DateTimeFormat` constructor.
             *
             * The default is determined by the user agent.
             */
            locales?: string | string[];
            /**
             * The options to pass to the `Intl.DateTimeFormat` constructor.
             *
             * The default is determined by the user agent.
             */
            options?: Intl.DateTimeFormatOptions;
            /**
             * The text to use for a `null` or `undefined` data value.
             *
             * The default is `''`.
             */
            missing?: string;
        }
    }
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
    function measureFontHeight(font: string): number;
}
