"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const signaling_1 = require("@phosphor/signaling");
const observables_1 = require("@jupyterlab/observables");
/**
 * A namespace for code editors.
 *
 * #### Notes
 * - A code editor is a set of common assumptions which hold for all concrete editors.
 * - Changes in implementations of the code editor should only be caused by changes in concrete editors.
 * - Common JLab services which are based on the code editor should belong to `IEditorServices`.
 */
var CodeEditor;
(function (CodeEditor) {
    /**
     * The default selection style.
     */
    CodeEditor.defaultSelectionStyle = {
        className: '',
        displayName: '',
        color: 'black'
    };
    /**
     * The default implementation of the editor model.
     */
    class Model {
        /**
         * Construct a new Model.
         */
        constructor(options) {
            this._isDisposed = false;
            this._mimeTypeChanged = new signaling_1.Signal(this);
            options = options || {};
            if (options.modelDB) {
                this.modelDB = options.modelDB;
            }
            else {
                this.modelDB = new observables_1.ModelDB();
            }
            let value = this.modelDB.createString('value');
            value.text = value.text || options.value || '';
            let mimeType = this.modelDB.createValue('mimeType');
            mimeType.set(options.mimeType || 'text/plain');
            mimeType.changed.connect(this._onMimeTypeChanged, this);
            this.modelDB.createMap('selections');
        }
        /**
         * A signal emitted when a mimetype changes.
         */
        get mimeTypeChanged() {
            return this._mimeTypeChanged;
        }
        /**
         * Get the value of the model.
         */
        get value() {
            return this.modelDB.get('value');
        }
        /**
         * Get the selections for the model.
         */
        get selections() {
            return this.modelDB.get('selections');
        }
        /**
         * A mime type of the model.
         */
        get mimeType() {
            return this.modelDB.getValue('mimeType');
        }
        set mimeType(newValue) {
            const oldValue = this.mimeType;
            if (oldValue === newValue) {
                return;
            }
            this.modelDB.setValue('mimeType', newValue);
        }
        /**
         * Whether the model is disposed.
         */
        get isDisposed() {
            return this._isDisposed;
        }
        /**
         * Dispose of the resources used by the model.
         */
        dispose() {
            if (this._isDisposed) {
                return;
            }
            this._isDisposed = true;
            signaling_1.Signal.clearData(this);
        }
        _onMimeTypeChanged(mimeType, args) {
            this._mimeTypeChanged.emit({
                name: 'mimeType',
                oldValue: args.oldValue,
                newValue: args.newValue
            });
        }
    }
    CodeEditor.Model = Model;
    /**
     * The default configuration options for an editor.
     */
    CodeEditor.defaultConfig = {
        fontFamily: null,
        fontSize: null,
        lineHeight: null,
        lineNumbers: false,
        lineWrap: 'on',
        wordWrapColumn: 80,
        readOnly: false,
        tabSize: 4,
        insertSpaces: true,
        matchBrackets: true,
        autoClosingBrackets: true
    };
})(CodeEditor = exports.CodeEditor || (exports.CodeEditor = {}));
