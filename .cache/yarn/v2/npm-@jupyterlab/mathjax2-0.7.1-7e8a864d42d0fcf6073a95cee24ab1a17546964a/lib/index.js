"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
require("../style/index.css");
/**
 * The MathJax Typesetter.
 */
class MathJaxTypesetter {
    /**
     * Create a new MathJax typesetter.
     */
    constructor(options) {
        this._initPromise = new coreutils_1.PromiseDelegate();
        this._initialized = false;
        this._url = options.url;
        this._config = options.config;
    }
    /**
     * Typeset the math in a node.
     *
     * #### Notes
     * MathJax schedules the typesetting asynchronously,
     * but there are not currently any callbacks or Promises
     * firing when it is done.
     */
    typeset(node) {
        if (!this._initialized) {
            this._init();
        }
        this._initPromise.promise.then(() => {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub, node]);
            try {
                MathJax.Hub.Queue(['Require', MathJax.Ajax, '[MathJax]/extensions/TeX/AMSmath.js'], () => {
                    MathJax.InputJax.TeX.resetEquationNumbers();
                });
            }
            catch (e) {
                console.error('Error queueing resetEquationNumbers:', e);
            }
        });
    }
    /**
     * Initialize MathJax.
     */
    _init() {
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `${this._url}?config=${this._config}&amp;delayStartupUntil=configured" charset="utf-8"`;
        head.appendChild(script);
        script.addEventListener('load', () => {
            this._onLoad();
        });
        this._initialized = true;
    }
    /**
     * Handle MathJax loading.
     */
    _onLoad() {
        MathJax.Hub.Config({
            tex2jax: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            // Center justify equations in code and markdown cells. Elsewhere
            // we use CSS to left justify single line equations in code cells.
            displayAlign: 'center',
            CommonHTML: {
                linebreaks: { automatic: true }
            },
            'HTML-CSS': {
                availableFonts: [],
                imageFont: null,
                preferredFont: null,
                webFont: 'STIX-Web',
                styles: { '.MathJax_Display': { margin: 0 } },
                linebreaks: { automatic: true }
            },
            skipStartupTypeset: true
        });
        MathJax.Hub.Configured();
        this._initPromise.resolve(void 0);
    }
}
exports.MathJaxTypesetter = MathJaxTypesetter;
