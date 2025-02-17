"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const messaging_1 = require("@phosphor/messaging");
const signaling_1 = require("@phosphor/signaling");
/**
 * A class added to editors that can host a completer.
 */
const COMPLETER_ENABLED_CLASS = 'jp-mod-completer-enabled';
/**
 * A class added to editors that have an active completer.
 */
const COMPLETER_ACTIVE_CLASS = 'jp-mod-completer-active';
/**
 * A completion handler for editors.
 */
class CompletionHandler {
    /**
     * Construct a new completion handler for a widget.
     */
    constructor(options) {
        this._editor = null;
        this._enabled = false;
        this._pending = 0;
        this._isDisposed = false;
        this.completer = options.completer;
        this.completer.selected.connect(this.onCompletionSelected, this);
        this.completer.visibilityChanged.connect(this.onVisibilityChanged, this);
        this._connector = options.connector;
    }
    /**
     * The data connector used to populate completion requests.
     *
     * #### Notes
     * The only method of this connector that will ever be called is `fetch`, so
     * it is acceptable for the other methods to be simple functions that return
     * rejected promises.
     */
    get connector() {
        return this._connector;
    }
    set connector(connector) {
        this._connector = connector;
    }
    /**
     * The editor used by the completion handler.
     */
    get editor() {
        return this._editor;
    }
    set editor(newValue) {
        if (newValue === this._editor) {
            return;
        }
        let editor = this._editor;
        // Clean up and disconnect from old editor.
        if (editor && !editor.isDisposed) {
            const model = editor.model;
            editor.host.classList.remove(COMPLETER_ENABLED_CLASS);
            model.selections.changed.disconnect(this.onSelectionsChanged, this);
            model.value.changed.disconnect(this.onTextChanged, this);
        }
        // Reset completer state.
        this.completer.reset();
        this.completer.editor = newValue;
        // Update the editor and signal connections.
        editor = this._editor = newValue;
        if (editor) {
            const model = editor.model;
            this._enabled = false;
            model.selections.changed.connect(this.onSelectionsChanged, this);
            model.value.changed.connect(this.onTextChanged, this);
            // On initial load, manually check the cursor position.
            this.onSelectionsChanged();
        }
    }
    /**
     * Get whether the completion handler is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources used by the handler.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        signaling_1.Signal.clearData(this);
    }
    /**
     * Invoke the handler and launch a completer.
     */
    invoke() {
        messaging_1.MessageLoop.sendMessage(this, CompletionHandler.Msg.InvokeRequest);
    }
    /**
     * Process a message sent to the completion handler.
     */
    processMessage(msg) {
        switch (msg.type) {
            case CompletionHandler.Msg.InvokeRequest.type:
                this.onInvokeRequest(msg);
                break;
            default:
                break;
        }
    }
    /**
     * Get the state of the text editor at the given position.
     */
    getState(editor, position) {
        return {
            text: editor.model.value.text,
            lineHeight: editor.lineHeight,
            charWidth: editor.charWidth,
            line: position.line,
            column: position.column
        };
    }
    /**
     * Handle a completion selected signal from the completion widget.
     */
    onCompletionSelected(completer, value) {
        const model = completer.model;
        const editor = this._editor;
        if (!editor || !model) {
            return;
        }
        const patch = model.createPatch(value);
        if (!patch) {
            return;
        }
        const { offset, text } = patch;
        editor.model.value.text = text;
        const position = editor.getPositionAt(offset);
        if (position) {
            editor.setCursorPosition(position);
        }
    }
    /**
     * Handle `invoke-request` messages.
     */
    onInvokeRequest(msg) {
        // If there is no completer model, bail.
        if (!this.completer.model) {
            return;
        }
        // If a completer session is already active, bail.
        if (this.completer.model.original) {
            return;
        }
        let editor = this._editor;
        if (editor) {
            this._makeRequest(editor.getCursorPosition()).catch(reason => {
                console.log('Invoke request bailed', reason);
            });
        }
    }
    /**
     * Handle selection changed signal from an editor.
     *
     * #### Notes
     * If a sub-class reimplements this method, then that class must either call
     * its super method or it must take responsibility for adding and removing
     * the completer completable class to the editor host node.
     *
     * Despite the fact that the editor widget adds a class whenever there is a
     * primary selection, this method checks independently for two reasons:
     *
     * 1. The editor widget connects to the same signal to add that class, so
     *    there is no guarantee that the class will be added before this method
     *    is invoked so simply checking for the CSS class's existence is not an
     *    option. Secondarily, checking the editor state should be faster than
     *    querying the DOM in either case.
     * 2. Because this method adds a class that indicates whether completer
     *    functionality ought to be enabled, relying on the behavior of the
     *    `jp-mod-has-primary-selection` to filter out any editors that have
     *    a selection means the semantic meaning of `jp-mod-completer-enabled`
     *    is obscured because there may be cases where the enabled class is added
     *    even though the completer is not available.
     */
    onSelectionsChanged() {
        const model = this.completer.model;
        const editor = this._editor;
        if (!editor) {
            return;
        }
        const host = editor.host;
        // If there is no model, return.
        if (!model) {
            this._enabled = false;
            host.classList.remove(COMPLETER_ENABLED_CLASS);
            return;
        }
        const position = editor.getCursorPosition();
        const line = editor.getLine(position.line);
        if (!line) {
            this._enabled = false;
            model.reset(true);
            host.classList.remove(COMPLETER_ENABLED_CLASS);
            return;
        }
        const { start, end } = editor.getSelection();
        // If there is a text selection, return.
        if (start.column !== end.column || start.line !== end.line) {
            this._enabled = false;
            model.reset(true);
            host.classList.remove(COMPLETER_ENABLED_CLASS);
            return;
        }
        // If the part of the line before the cursor is white space, return.
        if (line.slice(0, position.column).match(/^\s*$/)) {
            this._enabled = false;
            model.reset(true);
            host.classList.remove(COMPLETER_ENABLED_CLASS);
            return;
        }
        // Enable completion.
        if (!this._enabled) {
            this._enabled = true;
            host.classList.add(COMPLETER_ENABLED_CLASS);
        }
        // Dispatch the cursor change.
        model.handleCursorChange(this.getState(editor, editor.getCursorPosition()));
    }
    /**
     * Handle a text changed signal from an editor.
     */
    onTextChanged() {
        const model = this.completer.model;
        if (!model || !this._enabled) {
            return;
        }
        // If there is a text selection, no completion is allowed.
        const editor = this.editor;
        if (!editor) {
            return;
        }
        const { start, end } = editor.getSelection();
        if (start.column !== end.column || start.line !== end.line) {
            return;
        }
        // Dispatch the text change.
        model.handleTextChange(this.getState(editor, editor.getCursorPosition()));
    }
    /**
     * Handle a visibility change signal from a completer widget.
     */
    onVisibilityChanged(completer) {
        // Completer is not active.
        if (completer.isDisposed || completer.isHidden) {
            if (this._editor) {
                this._editor.host.classList.remove(COMPLETER_ACTIVE_CLASS);
                this._editor.focus();
            }
            return;
        }
        // Completer is active.
        if (this._editor) {
            this._editor.host.classList.add(COMPLETER_ACTIVE_CLASS);
        }
    }
    /**
     * Make a completion request.
     */
    _makeRequest(position) {
        const editor = this.editor;
        if (!editor) {
            return Promise.reject(new Error('No active editor'));
        }
        const text = editor.model.value.text;
        const offset = coreutils_1.Text.jsIndexToCharIndex(editor.getOffsetAt(position), text);
        const pending = ++this._pending;
        const state = this.getState(editor, position);
        const request = { text, offset };
        return this._connector
            .fetch(request)
            .then(reply => {
            if (this.isDisposed) {
                throw new Error('Handler is disposed');
            }
            // If a newer completion request has created a pending request, bail.
            if (pending !== this._pending) {
                throw new Error('A newer completion request is pending');
            }
            this._onReply(state, reply);
        })
            .catch(reason => {
            // Completion request failures or negative results fail silently.
            const model = this.completer.model;
            if (model) {
                model.reset(true);
            }
        });
    }
    /**
     * Receive a completion reply from the connector.
     *
     * @param state - The state of the editor when completion request was made.
     *
     * @param reply - The API response returned for a completion request.
     */
    _onReply(state, reply) {
        const model = this.completer.model;
        const text = state.text;
        if (!model) {
            return;
        }
        // Update the original request.
        model.original = state;
        // Dedupe the matches.
        const matches = [];
        const matchSet = new Set(reply.matches || []);
        if (reply.matches) {
            matchSet.forEach(match => {
                matches.push(match);
            });
        }
        // Extract the optional type map. The current implementation uses
        // _jupyter_types_experimental which provide string type names. We make no
        // assumptions about the names of the types, so other kernels can provide
        // their own types.
        // Even though the `metadata` field is required, it has historically not
        // been used. Defensively check if it exists.
        const metadata = reply.metadata || {};
        const types = metadata._jupyter_types_experimental;
        const typeMap = {};
        if (types) {
            types.forEach((item) => {
                // For some reason the _jupyter_types_experimental list has two entries
                // for each match, with one having a type of "<unknown>". Discard those
                // and use undefined to indicate an unknown type.
                const text = item.text;
                const type = item.type;
                if (matchSet.has(text) && type !== '<unknown>') {
                    typeMap[text] = type;
                }
            });
        }
        // Update the options, including the type map.
        model.setOptions(matches, typeMap);
        // Update the cursor.
        model.cursor = {
            start: coreutils_1.Text.charIndexToJsIndex(reply.start, text),
            end: coreutils_1.Text.charIndexToJsIndex(reply.end, text)
        };
    }
}
exports.CompletionHandler = CompletionHandler;
/**
 * A namespace for cell completion handler statics.
 */
(function (CompletionHandler) {
    /**
     * A namespace for completion handler messages.
     */
    let Msg;
    (function (Msg) {
        /* tslint:disable */
        /**
         * A singleton `'invoke-request'` message.
         */
        Msg.InvokeRequest = new messaging_1.Message('invoke-request');
        /* tslint:enable */
    })(Msg = CompletionHandler.Msg || (CompletionHandler.Msg = {}));
})(CompletionHandler = exports.CompletionHandler || (exports.CompletionHandler = {}));
