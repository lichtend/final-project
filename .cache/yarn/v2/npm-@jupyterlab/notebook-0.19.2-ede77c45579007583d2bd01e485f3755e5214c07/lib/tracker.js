"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
/* tslint:disable */
/**
 * The notebook tracker token.
 */
exports.INotebookTracker = new coreutils_1.Token('@jupyterlab/notebook:INotebookTracker');
/* tslint:enable */
class NotebookTracker extends apputils_1.InstanceTracker {
    constructor() {
        super(...arguments);
        this._activeCell = null;
        this._activeCellChanged = new signaling_1.Signal(this);
        this._selectionChanged = new signaling_1.Signal(this);
    }
    /**
     * The currently focused cell.
     *
     * #### Notes
     * This is a read-only property. If there is no cell with the focus, then this
     * value is `null`.
     */
    get activeCell() {
        let widget = this.currentWidget;
        if (!widget) {
            return null;
        }
        return widget.content.activeCell || null;
    }
    /**
     * A signal emitted when the current active cell changes.
     *
     * #### Notes
     * If there is no cell with the focus, then `null` will be emitted.
     */
    get activeCellChanged() {
        return this._activeCellChanged;
    }
    /**
     * A signal emitted when the selection state changes.
     */
    get selectionChanged() {
        return this._selectionChanged;
    }
    /**
     * Add a new notebook panel to the tracker.
     *
     * @param panel - The notebook panel being added.
     */
    add(panel) {
        const promise = super.add(panel);
        panel.content.activeCellChanged.connect(this._onActiveCellChanged, this);
        panel.content.selectionChanged.connect(this._onSelectionChanged, this);
        return promise;
    }
    /**
     * Dispose of the resources held by the tracker.
     */
    dispose() {
        this._activeCell = null;
        super.dispose();
    }
    /**
     * Handle the current change event.
     */
    onCurrentChanged(widget) {
        // Store an internal reference to active cell to prevent false positives.
        let activeCell = this.activeCell;
        if (activeCell && activeCell === this._activeCell) {
            return;
        }
        this._activeCell = activeCell;
        if (!widget) {
            return;
        }
        // Since the notebook has changed, immediately signal an active cell change
        this._activeCellChanged.emit(widget.content.activeCell || null);
    }
    _onActiveCellChanged(sender, cell) {
        // Check if the active cell change happened for the current notebook.
        if (this.currentWidget && this.currentWidget.content === sender) {
            this._activeCell = cell || null;
            this._activeCellChanged.emit(this._activeCell);
        }
    }
    _onSelectionChanged(sender) {
        // Check if the selection change happened for the current notebook.
        if (this.currentWidget && this.currentWidget.content === sender) {
            this._selectionChanged.emit(void 0);
        }
    }
}
exports.NotebookTracker = NotebookTracker;
