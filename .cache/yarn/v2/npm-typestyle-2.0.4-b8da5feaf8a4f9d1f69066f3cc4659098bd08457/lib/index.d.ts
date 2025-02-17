import { TypeStyle } from './internal/typestyle';
export { TypeStyle };
/**
 * All the CSS types in the 'types' namespace
 */
import * as types from './types';
export { types };
/**
 * Export certain utilities
 */
export { extend, classes, media } from './internal/utilities';
/** Sets the target tag where we write the css on style updates */
export declare const setStylesTarget: (tag: {
    textContent: string | null;
}) => void;
/**
 * Insert `raw` CSS as a string. This is useful for e.g.
 * - third party CSS that you are customizing with template strings
 * - generating raw CSS in JavaScript
 * - reset libraries like normalize.css that you can use without loaders
 */
export declare const cssRaw: (mustBeValidCSS: string) => void;
/**
 * Takes CSSProperties and registers it to a global selector (body, html, etc.)
 */
export declare const cssRule: (selector: string, ...objects: types.NestedCSSProperties[]) => void;
/**
 * Renders styles to the singleton tag imediately
 * NOTE: You should only call it on initial render to prevent any non CSS flash.
 * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
 **/
export declare const forceRenderStyles: () => void;
/**
 * Utility function to register an @font-face
 */
export declare const fontFace: (...fontFace: types.FontFace[]) => void;
/**
 * Allows use to use the stylesheet in a node.js environment
 */
export declare const getStyles: () => string;
/**
 * Takes keyframes and returns a generated animationName
 */
export declare const keyframes: (frames: types.KeyFrames) => string;
/**
 * Helps with testing. Reinitializes FreeStyle + raw
 */
export declare const reinit: () => void;
/**
 * Takes CSSProperties and return a generated className you can use on your component
 */
export declare const style: {
    (...objects: (types.NestedCSSProperties | undefined)[]): string;
    (...objects: (false | types.NestedCSSProperties | null | undefined)[]): string;
};
/**
 * Takes an object where property names are ideal class names and property values are CSSProperties, and
 * returns an object where property names are the same ideal class names and the property values are
 * the actual generated class names using the ideal class name as the $debugName
 */
export declare const stylesheet: <Names extends string = any>(classes: Record<Names, types.NestedCSSProperties>) => Record<Names, string>;
/**
 * Creates a new instance of TypeStyle separate from the default instance.
 *
 * - Use this for creating a different typestyle instance for a shadow dom component.
 * - Use this if you don't want an auto tag generated and you just want to collect the CSS.
 *
 * NOTE: styles aren't shared between different instances.
 */
export declare function createTypeStyle(target?: {
    textContent: string | null;
}): TypeStyle;
