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
/** Zero configuration, default instance of TypeStyle */
var ts = new TypeStyle({ autoGenerateTag: true });
/** Sets the target tag where we write the css on style updates */
export var setStylesTarget = ts.setStylesTarget;
/**
 * Insert `raw` CSS as a string. This is useful for e.g.
 * - third party CSS that you are customizing with template strings
 * - generating raw CSS in JavaScript
 * - reset libraries like normalize.css that you can use without loaders
 */
export var cssRaw = ts.cssRaw;
/**
 * Takes CSSProperties and registers it to a global selector (body, html, etc.)
 */
export var cssRule = ts.cssRule;
/**
 * Renders styles to the singleton tag imediately
 * NOTE: You should only call it on initial render to prevent any non CSS flash.
 * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
 **/
export var forceRenderStyles = ts.forceRenderStyles;
/**
 * Utility function to register an @font-face
 */
export var fontFace = ts.fontFace;
/**
 * Allows use to use the stylesheet in a node.js environment
 */
export var getStyles = ts.getStyles;
/**
 * Takes keyframes and returns a generated animationName
 */
export var keyframes = ts.keyframes;
/**
 * Helps with testing. Reinitializes FreeStyle + raw
 */
export var reinit = ts.reinit;
/**
 * Takes CSSProperties and return a generated className you can use on your component
 */
export var style = ts.style;
/**
 * Takes an object where property names are ideal class names and property values are CSSProperties, and
 * returns an object where property names are the same ideal class names and the property values are
 * the actual generated class names using the ideal class name as the $debugName
 */
export var stylesheet = ts.stylesheet;
/**
 * Creates a new instance of TypeStyle separate from the default instance.
 *
 * - Use this for creating a different typestyle instance for a shadow dom component.
 * - Use this if you don't want an auto tag generated and you just want to collect the CSS.
 *
 * NOTE: styles aren't shared between different instances.
 */
export function createTypeStyle(target) {
    var instance = new TypeStyle({ autoGenerateTag: false });
    if (target) {
        instance.setStylesTarget(target);
    }
    return instance;
}
