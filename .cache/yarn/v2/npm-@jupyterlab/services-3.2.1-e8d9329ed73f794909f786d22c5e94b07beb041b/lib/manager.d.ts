import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
import { Builder, BuildManager } from './builder';
import { NbConvert, NbConvertManager } from './nbconvert';
import { Contents, ContentsManager } from './contents';
import { Kernel } from './kernel';
import { Session, SessionManager } from './session';
import { Setting, SettingManager } from './setting';
import { TerminalSession, TerminalManager } from './terminal';
import { ServerConnection } from './serverconnection';
import { Workspace, WorkspaceManager } from './workspace';
/**
 * A Jupyter services manager.
 */
export declare class ServiceManager implements ServiceManager.IManager {
    /**
     * Construct a new services provider.
     */
    constructor(options?: ServiceManager.IOptions);
    /**
     * A signal emitted when the kernel specs change.
     */
    readonly specsChanged: ISignal<this, Kernel.ISpecModels>;
    /**
     * Test whether the service manager is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources used by the manager.
     */
    dispose(): void;
    /**
     * The kernel spec models.
     */
    readonly specs: Kernel.ISpecModels | null;
    /**
     * The server settings of the manager.
     */
    readonly serverSettings: ServerConnection.ISettings;
    /**
     * Get the session manager instance.
     */
    readonly sessions: SessionManager;
    /**
     * Get the setting manager instance.
     */
    readonly settings: SettingManager;
    /**
     * The builder for the manager.
     */
    readonly builder: BuildManager;
    /**
     * Get the contents manager instance.
     */
    readonly contents: ContentsManager;
    /**
     * Get the terminal manager instance.
     */
    readonly terminals: TerminalManager;
    /**
     * Get the workspace manager instance.
     */
    readonly workspaces: WorkspaceManager;
    /**
     * Get the nbconvert manager instance.
     */
    readonly nbconvert: NbConvertManager;
    /**
     * Test whether the manager is ready.
     */
    readonly isReady: boolean;
    /**
     * A promise that fulfills when the manager is ready.
     */
    readonly ready: Promise<void>;
    private _isDisposed;
    private _readyPromise;
    private _specsChanged;
    private _isReady;
}
/**
 * The namespace for `ServiceManager` statics.
 */
export declare namespace ServiceManager {
    /**
     * A service manager interface.
     */
    interface IManager extends IDisposable {
        /**
         * The builder for the manager.
         */
        readonly builder: Builder.IManager;
        /**
         * The contents manager for the manager.
         */
        readonly contents: Contents.IManager;
        /**
         * Test whether the manager is ready.
         */
        readonly isReady: boolean;
        /**
         * A promise that fulfills when the manager is initially ready.
         */
        readonly ready: Promise<void>;
        /**
         * The server settings of the manager.
         */
        readonly serverSettings: ServerConnection.ISettings;
        /**
         * The session manager for the manager.
         */
        readonly sessions: Session.IManager;
        /**
         * The setting manager for the manager.
         */
        readonly settings: Setting.IManager;
        /**
         * The kernel spec models.
         */
        readonly specs: Kernel.ISpecModels | null;
        /**
         * A signal emitted when the kernel specs change.
         */
        readonly specsChanged: ISignal<IManager, Kernel.ISpecModels>;
        /**
         * The terminals manager for the manager.
         */
        readonly terminals: TerminalSession.IManager;
        /**
         * The workspace manager for the manager.
         */
        readonly workspaces: Workspace.IManager;
        /**
         * The nbconvert manager for the manager.
         */
        readonly nbconvert: NbConvert.IManager;
    }
    /**
     * The options used to create a service manager.
     */
    interface IOptions {
        /**
         * The server settings of the manager.
         */
        readonly serverSettings?: ServerConnection.ISettings;
        /**
         * The default drive for the contents manager.
         */
        readonly defaultDrive?: Contents.IDrive;
    }
}
