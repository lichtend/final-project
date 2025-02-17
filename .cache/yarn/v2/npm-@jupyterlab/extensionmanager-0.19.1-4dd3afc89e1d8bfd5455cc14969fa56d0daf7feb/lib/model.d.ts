import { VDomModel } from '@jupyterlab/apputils';
import { ServerConnection, ServiceManager } from '@jupyterlab/services';
import { Searcher, ISearchResult } from './query';
/**
 * Information about an extension.
 */
export interface IEntry {
    /**
     * The name of the extension.
     */
    name: string;
    /**
     * A short description of the extension.
     */
    description: string;
    /**
     * A representative link of the package.
     */
    url: string;
    /**
     * Whether the extension is currently installed.
     */
    installed: boolean;
    /**
     * Whether the extension is currently enabled.
     */
    enabled: boolean;
    /**
     * A flag indicating the status of an installed extension.
     */
    status: 'ok' | 'warning' | 'error' | 'deprecated' | null;
    /**
     * The latest version of the extension.
     */
    latest_version: string;
    /**
     * The installed version of the extension.
     */
    installed_version: string;
}
/**
 * Wire format for installed extensions.
 */
export interface IInstalledEntry {
    /**
     * The name of the extension.
     */
    name: string;
    /**
     * A short description of the extension.
     */
    description: string;
    /**
     * A representative link of the package.
     */
    url: string;
    /**
     * Whether the extension is currently installed.
     */
    installed?: boolean;
    /**
     * Whether the extension is currently enabled.
     */
    enabled: boolean;
    /**
     * The latest version of the extension.
     */
    latest_version: string;
    /**
     * The installed version of the extension.
     */
    installed_version: string;
    /**
     * A flag indicating the status of an installed extension.
     */
    status: 'ok' | 'warning' | 'error' | 'deprecated' | null;
}
/**
 * An object representing a server reply to performing an action.
 */
export interface IActionReply {
    /**
     * The status category of the reply.
     */
    status: 'ok' | 'warning' | 'error' | null;
    /**
     * An optional message when the status is not 'ok'.
     */
    message?: string;
}
/**
 * Extension actions that the server API accepts
 */
export declare type Action = 'install' | 'uninstall' | 'enable' | 'disable';
/**
 * Model for an extension list.
 */
export declare class ListModel extends VDomModel {
    constructor(serviceManager: ServiceManager);
    /**
     * A readonly array of the installed extensions.
     */
    readonly installed: ReadonlyArray<IEntry>;
    /**
     * A readonly array containing the latest search result
     */
    readonly searchResult: ReadonlyArray<IEntry>;
    /**
     * The current NPM repository search query.
     *
     * Setting its value triggers a new search.
     */
    query: string | null;
    /**
     * The current NPM repository search page.
     *
     * The npm repository search is paginated by the `pagination` attribute.
     * The `page` value selects which page is used.
     *
     * Setting its value triggers a new search.
     */
    page: number;
    /**
     * The NPM repository search pagination.
     *
     * The npm repository search is paginated by the `pagination` attribute.
     * The `page` value selects which page is used.
     *
     * Setting its value triggers a new search.
     */
    pagination: number;
    /**
     * The total number of results in the current search.
     */
    readonly totalEntries: number;
    /**
     * Initialize the model.
     */
    initialize(): void;
    /**
     * Whether there are currently any actions pending.
     */
    hasPendingActions(): boolean;
    /**
     * Install an extension.
     *
     * @param entry An entry indicating which extension to install.
     */
    install(entry: IEntry): Promise<void>;
    /**
     * Uninstall an extension.
     *
     * @param entry An entry indicating which extension to uninstall.
     */
    uninstall(entry: IEntry): void;
    /**
     * Enable an extension.
     *
     * @param entry An entry indicating which extension to enable.
     */
    enable(entry: IEntry): void;
    /**
     * Disable an extension.
     *
     * @param entry An entry indicating which extension to disable.
     */
    disable(entry: IEntry): void;
    /**
     * Check for companion packages in kernels or server.
     *
     * @param entry An entry indicating which extension to check.
     */
    checkCompanionPackages(entry: IEntry): Promise<boolean>;
    /**
     * Trigger a build check to incorporate actions taken.
     */
    triggerBuildCheck(): void;
    /**
     * Perform a build on the server
     */
    performBuild(): void;
    /**
     * Ignore a build recommendation
     */
    ignoreBuildRecommendation(): void;
    /**
     * Ignore a build recommendation
     */
    refreshInstalled(): void;
    /**
     * Translate search results from an npm repository query into entries
     * and remove entries with 'deprecated' in the keyword list
     *
     * @param res Promise to an npm query result.
     */
    protected translateSearchResult(res: Promise<ISearchResult>): Promise<{
        [key: string]: IEntry;
    }>;
    /**
     * Translate installed extensions information from the server into entries.
     *
     * @param res Promise to the server reply data.
     */
    protected translateInstalled(res: Promise<IInstalledEntry[]>): Promise<{
        [key: string]: IEntry;
    }>;
    /**
     * Make a request to the server for info about its installed extensions.
     */
    protected fetchInstalled(refreshInstalled?: boolean): Promise<IInstalledEntry[]>;
    /**
     * Search with current query.
     *
     * Sets searchError and totalEntries as appropriate.
     *
     * @returns {Promise<{ [key: string]: IEntry; }>} The search result as a map of entries.
     */
    protected performSearch(): Promise<{
        [key: string]: IEntry;
    }>;
    /**
     * Query the installed extensions.
     *
     * Sets installedError as appropriate.
     *
     * @returns {Promise<{ [key: string]: IEntry; }>} A map of installed extensions.
     */
    protected queryInstalled(refreshInstalled: boolean): Promise<{
        [key: string]: IEntry;
    }>;
    /**
     * Update the current model.
     *
     * This will query the NPM repository, and the notebook server.
     *
     * Emits the `stateChanged` signal on successful completion.
     */
    protected update(refreshInstalled?: boolean): Promise<void>;
    /**
     * Send a request to the server to perform an action on an extension.
     *
     * @param action A valid action to perform.
     * @param entry The extension to perform the action on.
     */
    protected _performAction(action: string, entry: IEntry): Promise<IActionReply>;
    /**
     * Add a pending action.
     *
     * @param pending A promise that resolves when the action is completed.
     */
    protected _addPendingAction(pending: Promise<any>): void;
    /**
     * Contains an error message if an error occurred when querying installed extensions.
     */
    installedError: string | null;
    /**
     * Contains an error message if an error occurred when searching for extensions.
     */
    searchError: string | null;
    /**
     * Contains an error message if an error occurred when querying the server extension.
     */
    serverConnectionError: string | null;
    /**
     * Contains an error message if the server has unfulfilled requirements.
     */
    serverRequirementsError: string | null;
    /**
     * Whether the model has finished async initialization.
     */
    initialized: boolean;
    /**
     * Whether a fresh build should be considered due to actions taken.
     */
    promptBuild: boolean;
    /**
     * Settings for connecting to the notebook server.
     */
    protected serverConnectionSettings: ServerConnection.ISettings;
    /**
     * A helper for performing searches of jupyterlab extensions on the NPM repository.
     */
    protected searcher: Searcher;
    /**
     * The service manager to use for building.
     */
    protected serviceManager: ServiceManager;
    private _query;
    private _page;
    private _pagination;
    private _totalEntries;
    private _installed;
    private _searchResult;
    private _pendingActions;
}
/**
 * ListModel statics.
 */
export declare namespace ListModel {
    /**
     * Utility function to check whether an entry can be updated.
     *
     * @param entry The entry to check.
     */
    function entryHasUpdate(entry: IEntry): boolean;
}
