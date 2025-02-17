import * as types from '../types';
export declare type StylesTarget = {
    textContent: string | null;
};
/**
 * Maintains a single stylesheet and keeps it in sync with requested styles
 */
export declare class TypeStyle {
    private _autoGenerateTag;
    private _freeStyle;
    private _pending;
    private _pendingRawChange;
    private _raw;
    private _tag?;
    /**
     * We have a single stylesheet that we update as components register themselves
     */
    private _lastFreeStyleChangeId;
    constructor({autoGenerateTag}: {
        autoGenerateTag: boolean;
    });
    /**
     * Only calls cb all sync operations settle
     */
    private _afterAllSync(cb);
    private _getTag();
    /** Checks if the style tag needs updating and if so queues up the change */
    private _styleUpdated();
    /**
     * Insert `raw` CSS as a string. This is useful for e.g.
     * - third party CSS that you are customizing with template strings
     * - generating raw CSS in JavaScript
     * - reset libraries like normalize.css that you can use without loaders
     */
    cssRaw: (mustBeValidCSS: string) => void;
    /**
     * Takes CSSProperties and registers it to a global selector (body, html, etc.)
     */
    cssRule: (selector: string, ...objects: types.NestedCSSProperties[]) => void;
    /**
     * Renders styles to the singleton tag imediately
     * NOTE: You should only call it on initial render to prevent any non CSS flash.
     * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
     **/
    forceRenderStyles: () => void;
    /**
     * Utility function to register an @font-face
     */
    fontFace: (...fontFace: types.FontFace[]) => void;
    /**
     * Allows use to use the stylesheet in a node.js environment
     */
    getStyles: () => string;
    /**
     * Takes keyframes and returns a generated animationName
     */
    keyframes: (frames: types.KeyFrames) => string;
    /**
     * Helps with testing. Reinitializes FreeStyle + raw
     */
    reinit: () => void;
    /** Sets the target tag where we write the css on style updates */
    setStylesTarget: (tag: StylesTarget) => void;
    /**
     * Takes CSSProperties and return a generated className you can use on your component
     */
    style(...objects: (types.NestedCSSProperties | undefined)[]): string;
    style(...objects: (types.NestedCSSProperties | null | false | undefined)[]): string;
    /**
     * Takes an object where property names are ideal class names and property values are CSSProperties, and
     * returns an object where property names are the same ideal class names and the property values are
     * the actual generated class names using the ideal class name as the $debugName
     */
    stylesheet: <Names extends string = any>(classes: Record<Names, types.NestedCSSProperties>) => Record<Names, string>;
}
