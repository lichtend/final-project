import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { ServerConnection } from '../serverconnection';
/**
 * The workspaces API service manager.
 */
export declare class WorkspaceManager {
    /**
     * Create a new workspace manager.
     */
    constructor(options?: WorkspaceManager.IOptions);
    /**
     * The server settings used to make API requests.
     */
    readonly serverSettings: ServerConnection.ISettings;
    /**
     * Fetch a workspace.
     *
     * @param id - The workspaces's ID.
     *
     * @returns A promise that resolves if successful.
     */
    fetch(id: string): Promise<Workspace.IWorkspace>;
    /**
     * Fetch the list of workspace IDs that exist on the server.
     *
     * @returns A promise that resolves if successful.
     */
    list(): Promise<string[]>;
    /**
     * Remove a workspace from the server.
     *
     * @param id - The workspaces's ID.
     *
     * @returns A promise that resolves if successful.
     */
    remove(id: string): Promise<void>;
    /**
     * Save a workspace.
     *
     * @param id - The workspace's ID.
     *
     * @param workspace - The workspace being saved.
     *
     * @returns A promise that resolves if successful.
     */
    save(id: string, workspace: Workspace.IWorkspace): Promise<void>;
}
/**
 * A namespace for `WorkspaceManager` statics.
 */
export declare namespace WorkspaceManager {
    /**
     * The instantiation options for a workspace manager.
     */
    interface IOptions {
        /**
         * The server settings used to make API requests.
         */
        serverSettings?: ServerConnection.ISettings;
    }
}
/**
 * A namespace for workspace API interfaces.
 */
export declare namespace Workspace {
    /**
     * The interface for the workspace API manager.
     */
    interface IManager extends WorkspaceManager {
    }
    /**
     * The interface describing a workspace API response.
     */
    interface IWorkspace {
        /**
         * The workspace data.
         */
        data: ReadonlyJSONObject;
        /**
         * The metadata for a workspace.
         */
        metadata: {
            /**
             * The workspace ID.
             */
            id: string;
        };
    }
}
