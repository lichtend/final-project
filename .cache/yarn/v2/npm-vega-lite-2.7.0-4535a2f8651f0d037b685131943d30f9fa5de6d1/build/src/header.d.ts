import { TextBaseline } from 'vega';
import { Guide } from './guide';
import { FontWeight, VgTitleConfig } from './vega.schema';
export declare const HEADER_TITLE_PROPERTIES_MAP: {
    [k in keyof HeaderConfig]: keyof VgTitleConfig;
};
export declare const HEADER_LABEL_PROPERTIES_MAP: {
    [k in keyof HeaderConfig]: keyof VgTitleConfig;
};
export declare const HEADER_TITLE_PROPERTIES: string[];
export declare const HEADER_LABEL_PROPERTIES: string[];
export interface HeaderConfig {
    /**
     * The anchor position for placing the title. One of `"start"`, `"middle"`, or `"end"`. For example, with an orientation of top these anchor positions map to a left-, center-, or right-aligned title.
     *
     * __Default value:__ `"middle"` for [single](https://vega.github.io/vega-lite/docs/spec.html) and [layered](https://vega.github.io/vega-lite/docs/layer.html) views.
     * `"start"` for other composite views.
     *
     * __Note:__ [For now](https://github.com/vega/vega-lite/issues/2875), `anchor` is only customizable only for [single](https://vega.github.io/vega-lite/docs/spec.html) and [layered](https://vega.github.io/vega-lite/docs/layer.html) views.  For other composite views, `anchor` is always `"start"`.
     */
    titleAnchor?: string;
    /**
     * The rotation angle of the header title.
     *
     * __Default value:__ `0`.
     *
     * @minimum -360
     * @maximum 360
     */
    titleAngle?: number;
    /**
     * Vertical text baseline for the header title. One of `"top"`, `"bottom"`, `"middle"`.
     *
     * __Default value:__ `"middle"`
     */
    titleBaseline?: TextBaseline;
    /**
     * Color of the header title, can be in hex color code or regular color name.
     */
    titleColor?: string;
    /**
     * Font of the header title. (e.g., `"Helvetica Neue"`).
     */
    titleFont?: string;
    /**
     * Font size of the header title.
     *
     * @minimum 0
     */
    titleFontSize?: number;
    /**
     * Font weight of the header title.
     * This can be either a string (e.g `"bold"`, `"normal"`) or a number (`100`, `200`, `300`, ..., `900` where `"normal"` = `400` and `"bold"` = `700`).
     */
    titleFontWeight?: FontWeight;
    /**
     * The maximum length of the header title in pixels. The text value will be automatically truncated if the rendered size exceeds the limit.
     *
     * __Default value:__ `0`, indicating no limit
     */
    titleLimit?: number;
    /**
     * The rotation angle of the header labels.
     *
     * __Default value:__ `0`.
     *
     * @minimum -360
     * @maximum 360
     */
    labelAngle?: number;
    /**
     * The color of the header label, can be in hex color code or regular color name.
     */
    labelColor?: string;
    /**
     * The font of the header label.
     */
    labelFont?: string;
    /**
     * The font size of the header label, in pixels.
     *
     * @minimum 0
     */
    labelFontSize?: number;
    /**
     * The maximum length of the header label in pixels. The text value will be automatically truncated if the rendered size exceeds the limit.
     *
     * __Default value:__ `0`, indicating no limit
     */
    labelLimit?: number;
}
/**
 * Headers of row / column channels for faceted plots.
 */
export interface Header extends HeaderConfig, Guide {
}
