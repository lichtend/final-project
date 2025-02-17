import { IClientSession } from '@jupyterlab/apputils';
import { DataConnector } from '@jupyterlab/coreutils';
import { Session } from '@jupyterlab/services';
import { CompletionHandler } from './handler';
/**
 * A kernel connector for completion handlers.
 */
export declare class KernelConnector extends DataConnector<CompletionHandler.IReply, void, CompletionHandler.IRequest> {
    /**
     * Create a new kernel connector for completion requests.
     *
     * @param options - The instatiation options for the kernel connector.
     */
    constructor(options: KernelConnector.IOptions);
    /**
     * Fetch completion requests.
     *
     * @param request - The completion request text and details.
     */
    fetch(request: CompletionHandler.IRequest): Promise<CompletionHandler.IReply>;
    private _session;
}
/**
 * A namespace for kernel connector statics.
 */
export declare namespace KernelConnector {
    /**
     * The instantiation options for cell completion handlers.
     */
    interface IOptions {
        /**
         * The session used by the kernel connector.
         */
        session: IClientSession | Session.ISession;
    }
}
