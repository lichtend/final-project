import { CodeEditor } from '@jupyterlab/codeeditor';
import { DataConnector } from '@jupyterlab/coreutils';
import { CompletionHandler } from './handler';
/**
 * A context connector for completion handlers.
 */
export declare class ContextConnector extends DataConnector<CompletionHandler.IReply, void, CompletionHandler.IRequest> {
    /**
     * Create a new context connector for completion requests.
     *
     * @param options - The instatiation options for the context connector.
     */
    constructor(options: ContextConnector.IOptions);
    /**
     * Fetch completion requests.
     *
     * @param request - The completion request text and details.
     */
    fetch(request: CompletionHandler.IRequest): Promise<CompletionHandler.IReply>;
    private _editor;
}
/**
 * A namespace for context connector statics.
 */
export declare namespace ContextConnector {
    /**
     * The instantiation options for cell completion handlers.
     */
    interface IOptions {
        /**
         * The session used by the context connector.
         */
        editor: CodeEditor.IEditor;
    }
}
