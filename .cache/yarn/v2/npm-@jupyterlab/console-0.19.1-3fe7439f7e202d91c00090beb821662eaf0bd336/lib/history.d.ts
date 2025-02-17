import { KernelMessage } from '@jupyterlab/services';
import { IDisposable } from '@phosphor/disposable';
import { IClientSession } from '@jupyterlab/apputils';
import { CodeEditor } from '@jupyterlab/codeeditor';
/**
 * The definition of a console history manager object.
 */
export interface IConsoleHistory extends IDisposable {
    /**
     * The client session used by the foreign handler.
     */
    readonly session: IClientSession;
    /**
     * The current editor used by the history widget.
     */
    editor: CodeEditor.IEditor | null;
    /**
     * The placeholder text that a history session began with.
     */
    readonly placeholder: string;
    /**
     * Get the previous item in the console history.
     *
     * @param placeholder - The placeholder string that gets temporarily added
     * to the history only for the duration of one history session. If multiple
     * placeholders are sent within a session, only the first one is accepted.
     *
     * @returns A Promise for console command text or `undefined` if unavailable.
     */
    back(placeholder: string): Promise<string>;
    /**
     * Get the next item in the console history.
     *
     * @param placeholder - The placeholder string that gets temporarily added
     * to the history only for the duration of one history session. If multiple
     * placeholders are sent within a session, only the first one is accepted.
     *
     * @returns A Promise for console command text or `undefined` if unavailable.
     */
    forward(placeholder: string): Promise<string>;
    /**
     * Add a new item to the bottom of history.
     *
     * @param item The item being added to the bottom of history.
     *
     * #### Notes
     * If the item being added is undefined or empty, it is ignored. If the item
     * being added is the same as the last item in history, it is ignored as well
     * so that the console's history will consist of no contiguous repetitions.
     */
    push(item: string): void;
    /**
     * Reset the history navigation state, i.e., start a new history session.
     */
    reset(): void;
}
/**
 * A console history manager object.
 */
export declare class ConsoleHistory implements IConsoleHistory {
    /**
     * Construct a new console history object.
     */
    constructor(options: ConsoleHistory.IOptions);
    /**
     * The client session used by the foreign handler.
     */
    readonly session: IClientSession;
    /**
     * The current editor used by the history manager.
     */
    editor: CodeEditor.IEditor | null;
    /**
     * The placeholder text that a history session began with.
     */
    readonly placeholder: string;
    /**
     * Get whether the console history manager is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the console history manager.
     */
    dispose(): void;
    /**
     * Get the previous item in the console history.
     *
     * @param placeholder - The placeholder string that gets temporarily added
     * to the history only for the duration of one history session. If multiple
     * placeholders are sent within a session, only the first one is accepted.
     *
     * @returns A Promise for console command text or `undefined` if unavailable.
     */
    back(placeholder: string): Promise<string>;
    /**
     * Get the next item in the console history.
     *
     * @param placeholder - The placeholder string that gets temporarily added
     * to the history only for the duration of one history session. If multiple
     * placeholders are sent within a session, only the first one is accepted.
     *
     * @returns A Promise for console command text or `undefined` if unavailable.
     */
    forward(placeholder: string): Promise<string>;
    /**
     * Add a new item to the bottom of history.
     *
     * @param item The item being added to the bottom of history.
     *
     * #### Notes
     * If the item being added is undefined or empty, it is ignored. If the item
     * being added is the same as the last item in history, it is ignored as well
     * so that the console's history will consist of no contiguous repetitions.
     */
    push(item: string): void;
    /**
     * Reset the history navigation state, i.e., start a new history session.
     */
    reset(): void;
    /**
     * Populate the history collection on history reply from a kernel.
     *
     * @param value The kernel message history reply.
     *
     * #### Notes
     * History entries have the shape:
     * [session: number, line: number, input: string]
     * Contiguous duplicates are stripped out of the API response.
     */
    protected onHistory(value: KernelMessage.IHistoryReplyMsg): void;
    /**
     * Handle a text change signal from the editor.
     */
    protected onTextChange(): void;
    /**
     * Handle an edge requested signal.
     */
    protected onEdgeRequest(editor: CodeEditor.IEditor, location: CodeEditor.EdgeLocation): void;
    /**
     * Handle the current kernel changing.
     */
    private _handleKernel;
    /**
     * Set the filter data.
     *
     * @param filterStr - The string to use when filtering the data.
     */
    protected setFilter(filterStr?: string): void;
    private _cursor;
    private _hasSession;
    private _history;
    private _placeholder;
    private _setByHistory;
    private _isDisposed;
    private _editor;
    private _filtered;
}
/**
 * A namespace for ConsoleHistory statics.
 */
export declare namespace ConsoleHistory {
    /**
     * The initialization options for a console history object.
     */
    interface IOptions {
        /**
         * The client session used by the foreign handler.
         */
        session: IClientSession;
    }
}
