import { IObservableJSON } from '@jupyterlab/observables';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { CodeEditor } from './editor';
/**
 * A widget for editing observable JSON.
 */
export declare class JSONEditor extends Widget {
    /**
     * Construct a new JSON editor.
     */
    constructor(options: JSONEditor.IOptions);
    /**
     * The code editor used by the editor.
     */
    readonly editor: CodeEditor.IEditor;
    /**
     * The code editor model used by the editor.
     */
    readonly model: CodeEditor.IModel;
    /**
     * Whether the editor is collapsible.
     */
    readonly collapsible: boolean;
    /**
     * The title of the editor.
     */
    editorTitle: string;
    /**
     * Get the editor host node used by the JSON editor.
     */
    readonly editorHostNode: HTMLElement;
    /**
     * Get the header node used by the JSON editor.
     */
    readonly headerNode: HTMLElement;
    /**
     * Get the title node used by the JSON editor.
     */
    readonly titleNode: HTMLElement;
    /**
     * Get the collapser node used by the JSON editor.
     */
    readonly collapserNode: HTMLElement;
    /**
     * Get the revert button used by the JSON editor.
     */
    readonly revertButtonNode: HTMLElement;
    /**
     * Get the commit button used by the JSON editor.
     */
    readonly commitButtonNode: HTMLElement;
    /**
     * The observable source.
     */
    source: IObservableJSON | null;
    /**
     * Get whether the editor is dirty.
     */
    readonly isDirty: boolean;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the notebook panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Handle `after-attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `after-show` messages for the widget.
     */
    protected onAfterShow(msg: Message): void;
    /**
     * Handle `update-request` messages for the widget.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle a change to the metadata of the source.
     */
    private _onSourceChanged;
    /**
     * Handle change events.
     */
    private _onValueChanged;
    /**
     * Handle blur events for the text area.
     */
    private _evtBlur;
    /**
     * Handle click events for the buttons.
     */
    private _evtClick;
    /**
     * Merge the user content.
     */
    private _mergeContent;
    /**
     * Set the value given the owner contents.
     */
    private _setValue;
    private _dataDirty;
    private _inputDirty;
    private _source;
    private _originalValue;
    private _changeGuard;
}
/**
 * The static namespace JSONEditor class statics.
 */
export declare namespace JSONEditor {
    /**
     * The options used to initialize a json editor.
     */
    interface IOptions {
        /**
         * The editor factory used by the editor.
         */
        editorFactory: CodeEditor.Factory;
        /**
         * The title of the editor. Defaults to an empty string.
         */
        title?: string;
        /**
         * Whether the title should be collapsible. Defaults to `false`.
         */
        collapsible?: boolean;
    }
}
