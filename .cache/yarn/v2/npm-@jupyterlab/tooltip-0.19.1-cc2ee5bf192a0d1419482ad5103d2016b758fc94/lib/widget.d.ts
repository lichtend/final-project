import { JSONObject } from '@phosphor/coreutils';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
/**
 * A tooltip widget.
 */
export declare class Tooltip extends Widget {
    /**
     * Instantiate a tooltip.
     */
    constructor(options: Tooltip.IOptions);
    /**
     * The anchor widget that the tooltip widget tracks.
     */
    readonly anchor: Widget;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the dock panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Handle `'after-attach'` messages.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle `'update-request'` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle scroll events for the widget
     */
    private _evtScroll;
    /**
     * Set the geometry of the tooltip widget.
     */
    private _setGeometry;
    private _content;
    private _editor;
    private _rendermime;
}
/**
 * A namespace for tooltip widget statics.
 */
export declare namespace Tooltip {
    /**
     * Instantiation options for a tooltip widget.
     */
    interface IOptions {
        /**
         * The anchor widget that the tooltip widget tracks.
         */
        anchor: Widget;
        /**
         * The data that populates the tooltip widget.
         */
        bundle: JSONObject;
        /**
         * The editor referent of the tooltip model.
         */
        editor: CodeEditor.IEditor;
        /**
         * The rendermime instance used by the tooltip model.
         */
        rendermime: RenderMimeRegistry;
    }
}
