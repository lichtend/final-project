import { ModelDB } from '@jupyterlab/observables';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
import { ServerConnection } from '..';
/**
 * A namespace for contents interfaces.
 */
export declare namespace Contents {
    /**
     * A contents model.
     */
    interface IModel {
        /**
         * Name of the contents file.
         *
         * #### Notes
         *  Equivalent to the last part of the `path` field.
         */
        readonly name: string;
        /**
         * The full file path.
         *
         * #### Notes
         * It will *not* start with `/`, and it will be `/`-delimited.
         */
        readonly path: string;
        /**
         * The type of file.
         */
        readonly type: ContentType;
        /**
         * Whether the requester has permission to edit the file.
         */
        readonly writable: boolean;
        /**
         * File creation timestamp.
         */
        readonly created: string;
        /**
         * Last modified timestamp.
         */
        readonly last_modified: string;
        /**
         * Specify the mime-type of file contents.
         *
         * #### Notes
         * Only non-`null` when `content` is present and `type` is `"file"`.
         */
        readonly mimetype: string;
        /**
         * The optional file content.
         */
        readonly content: any;
        /**
         * The chunk of the file upload.
         */
        readonly chunk?: number;
        /**
         * The format of the file `content`.
         *
         * #### Notes
         * Only relevant for type: 'file'
         */
        readonly format: FileFormat;
    }
    /**
     * Validates an IModel, thowing an error if it does not pass.
     */
    function validateContentsModel(contents: IModel): void;
    /**
     * A contents file type.
     */
    type ContentType = 'notebook' | 'file' | 'directory';
    /**
     * A contents file format.
     */
    type FileFormat = 'json' | 'text' | 'base64';
    /**
     * The options used to fetch a file.
     */
    interface IFetchOptions {
        /**
         * The override file type for the request.
         */
        type?: ContentType;
        /**
         * The override file format for the request.
         */
        format?: FileFormat;
        /**
         * Whether to include the file content.
         *
         * The default is `true`.
         */
        content?: boolean;
    }
    /**
     * The options used to create a file.
     */
    interface ICreateOptions {
        /**
         * The directory in which to create the file.
         */
        path?: string;
        /**
         * The optional file extension for the new file (e.g. `".txt"`).
         *
         * #### Notes
         * This ignored if `type` is `'notebook'`.
         */
        ext?: string;
        /**
         * The file type.
         */
        type?: ContentType;
    }
    /**
     * Checkpoint model.
     */
    interface ICheckpointModel {
        /**
         * The unique identifier for the checkpoint.
         */
        readonly id: string;
        /**
         * Last modified timestamp.
         */
        readonly last_modified: string;
    }
    /**
     * Validates an ICheckpointModel, thowing an error if it does not pass.
     */
    function validateCheckpointModel(checkpoint: ICheckpointModel): void;
    /**
     * The change args for a file change.
     */
    interface IChangedArgs {
        /**
         * The type of change.
         */
        type: 'new' | 'delete' | 'rename' | 'save';
        /**
         * The new contents.
         */
        oldValue: Partial<IModel> | null;
        /**
         * The old contents.
         */
        newValue: Partial<IModel> | null;
    }
    /**
     * The interface for a contents manager.
     */
    interface IManager extends IDisposable {
        /**
         * A signal emitted when a file operation takes place.
         */
        readonly fileChanged: ISignal<IManager, IChangedArgs>;
        /**
         * The server settings associated with the manager.
         */
        readonly serverSettings: ServerConnection.ISettings;
        /**
         * Add an `IDrive` to the manager.
         */
        addDrive(drive: IDrive): void;
        /**
         * Given a path of the form `drive:local/portion/of/it.txt`
         * get the local part of it.
         *
         * @param path: the path.
         *
         * @returns The local part of the path.
         */
        localPath(path: string): string;
        /**
         * Given a path of the form `drive:local/portion/of/it.txt`
         * get the name of the drive. If the path is missing
         * a drive portion, returns an empty string.
         *
         * @param path: the path.
         *
         * @returns The drive name for the path, or the empty string.
         */
        driveName(path: string): string;
        /**
         * Given a path, get a ModelDB.IFactory from the
         * relevant backend. Returns `null` if the backend
         * does not provide one.
         */
        getModelDBFactory(path: string): ModelDB.IFactory | null;
        /**
         * Get a file or directory.
         *
         * @param path: The path to the file.
         *
         * @param options: The options used to fetch the file.
         *
         * @returns A promise which resolves with the file content.
         */
        get(path: string, options?: IFetchOptions): Promise<IModel>;
        /**
         * Get an encoded download url given a file path.
         *
         * @param A promise which resolves with the absolute POSIX
         *   file path on the server.
         */
        getDownloadUrl(path: string): Promise<string>;
        /**
         * Create a new untitled file or directory in the specified directory path.
         *
         * @param options: The options used to create the file.
         *
         * @returns A promise which resolves with the created file content when the
         *    file is created.
         */
        newUntitled(options?: ICreateOptions): Promise<IModel>;
        /**
         * Delete a file.
         *
         * @param path - The path to the file.
         *
         * @returns A promise which resolves when the file is deleted.
         */
        delete(path: string): Promise<void>;
        /**
         * Rename a file or directory.
         *
         * @param path - The original file path.
         *
         * @param newPath - The new file path.
         *
         * @returns A promise which resolves with the new file content model when the
         *   file is renamed.
         */
        rename(path: string, newPath: string): Promise<IModel>;
        /**
         * Save a file.
         *
         * @param path - The desired file path.
         *
         * @param options - Optional overrides to the model.
         *
         * @returns A promise which resolves with the file content model when the
         *   file is saved.
         */
        save(path: string, options?: Partial<IModel>): Promise<IModel>;
        /**
         * Copy a file into a given directory.
         *
         * @param path - The original file path.
         *
         * @param toDir - The destination directory path.
         *
         * @returns A promise which resolves with the new content model when the
         *  file is copied.
         */
        copy(path: string, toDir: string): Promise<IModel>;
        /**
         * Create a checkpoint for a file.
         *
         * @param path - The path of the file.
         *
         * @returns A promise which resolves with the new checkpoint model when the
         *   checkpoint is created.
         */
        createCheckpoint(path: string): Promise<ICheckpointModel>;
        /**
         * List available checkpoints for a file.
         *
         * @param path - The path of the file.
         *
         * @returns A promise which resolves with a list of checkpoint models for
         *    the file.
         */
        listCheckpoints(path: string): Promise<ICheckpointModel[]>;
        /**
         * Restore a file to a known checkpoint state.
         *
         * @param path - The path of the file.
         *
         * @param checkpointID - The id of the checkpoint to restore.
         *
         * @returns A promise which resolves when the checkpoint is restored.
         */
        restoreCheckpoint(path: string, checkpointID: string): Promise<void>;
        /**
         * Delete a checkpoint for a file.
         *
         * @param path - The path of the file.
         *
         * @param checkpointID - The id of the checkpoint to delete.
         *
         * @returns A promise which resolves when the checkpoint is deleted.
         */
        deleteCheckpoint(path: string, checkpointID: string): Promise<void>;
    }
    /**
     * The interface for a network drive that can be mounted
     * in the contents manager.
     */
    interface IDrive extends IDisposable {
        /**
         * The name of the drive, which is used at the leading
         * component of file paths.
         */
        readonly name: string;
        /**
         * The server settings of the manager.
         */
        readonly serverSettings: ServerConnection.ISettings;
        /**
         * An optional ModelDB.IFactory instance for the
         * drive.
         */
        readonly modelDBFactory?: ModelDB.IFactory;
        /**
         * A signal emitted when a file operation takes place.
         */
        fileChanged: ISignal<IDrive, IChangedArgs>;
        /**
         * Get a file or directory.
         *
         * @param localPath: The path to the file.
         *
         * @param options: The options used to fetch the file.
         *
         * @returns A promise which resolves with the file content.
         */
        get(localPath: string, options?: IFetchOptions): Promise<IModel>;
        /**
         * Get an encoded download url given a file path.
         *
         * @param A promise which resolves with the absolute POSIX
         *   file path on the server.
         */
        getDownloadUrl(localPath: string): Promise<string>;
        /**
         * Create a new untitled file or directory in the specified directory path.
         *
         * @param options: The options used to create the file.
         *
         * @returns A promise which resolves with the created file content when the
         *    file is created.
         */
        newUntitled(options?: ICreateOptions): Promise<IModel>;
        /**
         * Delete a file.
         *
         * @param localPath - The path to the file.
         *
         * @returns A promise which resolves when the file is deleted.
         */
        delete(localPath: string): Promise<void>;
        /**
         * Rename a file or directory.
         *
         * @param oldLocalPath - The original file path.
         *
         * @param newLocalPath - The new file path.
         *
         * @returns A promise which resolves with the new file content model when the
         *   file is renamed.
         */
        rename(oldLocalPath: string, newLocalPath: string): Promise<IModel>;
        /**
         * Save a file.
         *
         * @param localPath - The desired file path.
         *
         * @param options - Optional overrides to the model.
         *
         * @returns A promise which resolves with the file content model when the
         *   file is saved.
         */
        save(localPath: string, options?: Partial<IModel>): Promise<IModel>;
        /**
         * Copy a file into a given directory.
         *
         * @param localPath - The original file path.
         *
         * @param toLocalDir - The destination directory path.
         *
         * @returns A promise which resolves with the new content model when the
         *  file is copied.
         */
        copy(localPath: string, toLocalDir: string): Promise<IModel>;
        /**
         * Create a checkpoint for a file.
         *
         * @param localPath - The path of the file.
         *
         * @returns A promise which resolves with the new checkpoint model when the
         *   checkpoint is created.
         */
        createCheckpoint(localPath: string): Promise<ICheckpointModel>;
        /**
         * List available checkpoints for a file.
         *
         * @param localPath - The path of the file.
         *
         * @returns A promise which resolves with a list of checkpoint models for
         *    the file.
         */
        listCheckpoints(localPath: string): Promise<ICheckpointModel[]>;
        /**
         * Restore a file to a known checkpoint state.
         *
         * @param localPath - The path of the file.
         *
         * @param checkpointID - The id of the checkpoint to restore.
         *
         * @returns A promise which resolves when the checkpoint is restored.
         */
        restoreCheckpoint(localPath: string, checkpointID: string): Promise<void>;
        /**
         * Delete a checkpoint for a file.
         *
         * @param localPath - The path of the file.
         *
         * @param checkpointID - The id of the checkpoint to delete.
         *
         * @returns A promise which resolves when the checkpoint is deleted.
         */
        deleteCheckpoint(localPath: string, checkpointID: string): Promise<void>;
    }
}
/**
 * A contents manager that passes file operations to the server.
 * Multiple servers implementing the `IDrive` interface can be
 * attached to the contents manager, so that the same session can
 * perform file operations on multiple backends.
 *
 * This includes checkpointing with the normal file operations.
 */
export declare class ContentsManager implements Contents.IManager {
    /**
     * Construct a new contents manager object.
     *
     * @param options - The options used to initialize the object.
     */
    constructor(options?: ContentsManager.IOptions);
    /**
     * The server settings associated with the manager.
     */
    readonly serverSettings: ServerConnection.ISettings;
    /**
     * A signal emitted when a file operation takes place.
     */
    readonly fileChanged: ISignal<this, Contents.IChangedArgs>;
    /**
     * Test whether the manager has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the manager.
     */
    dispose(): void;
    /**
     * Add an `IDrive` to the manager.
     */
    addDrive(drive: Contents.IDrive): void;
    /**
     * Given a path, get a ModelDB.IFactory from the
     * relevant backend. Returns `null` if the backend
     * does not provide one.
     */
    getModelDBFactory(path: string): ModelDB.IFactory | null;
    /**
     * Given a path of the form `drive:local/portion/of/it.txt`
     * get the local part of it.
     *
     * @param path: the path.
     *
     * @returns The local part of the path.
     */
    localPath(path: string): string;
    /**
     * Given a path of the form `drive:local/portion/of/it.txt`
     * get the name of the drive. If the path is missing
     * a drive portion, returns an empty string.
     *
     * @param path: the path.
     *
     * @returns The drive name for the path, or the empty string.
     */
    driveName(path: string): string;
    /**
     * Get a file or directory.
     *
     * @param path: The path to the file.
     *
     * @param options: The options used to fetch the file.
     *
     * @returns A promise which resolves with the file content.
     */
    get(path: string, options?: Contents.IFetchOptions): Promise<Contents.IModel>;
    /**
     * Get an encoded download url given a file path.
     *
     * @param path - An absolute POSIX file path on the server.
     *
     * #### Notes
     * It is expected that the path contains no relative paths.
     */
    getDownloadUrl(path: string): Promise<string>;
    /**
     * Create a new untitled file or directory in the specified directory path.
     *
     * @param options: The options used to create the file.
     *
     * @returns A promise which resolves with the created file content when the
     *    file is created.
     */
    newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel>;
    /**
     * Delete a file.
     *
     * @param path - The path to the file.
     *
     * @returns A promise which resolves when the file is deleted.
     */
    delete(path: string): Promise<void>;
    /**
     * Rename a file or directory.
     *
     * @param path - The original file path.
     *
     * @param newPath - The new file path.
     *
     * @returns A promise which resolves with the new file contents model when
     *   the file is renamed.
     */
    rename(path: string, newPath: string): Promise<Contents.IModel>;
    /**
     * Save a file.
     *
     * @param path - The desired file path.
     *
     * @param options - Optional overrides to the model.
     *
     * @returns A promise which resolves with the file content model when the
     *   file is saved.
     *
     * #### Notes
     * Ensure that `model.content` is populated for the file.
     */
    save(path: string, options?: Partial<Contents.IModel>): Promise<Contents.IModel>;
    /**
     * Copy a file into a given directory.
     *
     * @param path - The original file path.
     *
     * @param toDir - The destination directory path.
     *
     * @returns A promise which resolves with the new contents model when the
     *  file is copied.
     *
     * #### Notes
     * The server will select the name of the copied file.
     */
    copy(fromFile: string, toDir: string): Promise<Contents.IModel>;
    /**
     * Create a checkpoint for a file.
     *
     * @param path - The path of the file.
     *
     * @returns A promise which resolves with the new checkpoint model when the
     *   checkpoint is created.
     */
    createCheckpoint(path: string): Promise<Contents.ICheckpointModel>;
    /**
     * List available checkpoints for a file.
     *
     * @param path - The path of the file.
     *
     * @returns A promise which resolves with a list of checkpoint models for
     *    the file.
     */
    listCheckpoints(path: string): Promise<Contents.ICheckpointModel[]>;
    /**
     * Restore a file to a known checkpoint state.
     *
     * @param path - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to restore.
     *
     * @returns A promise which resolves when the checkpoint is restored.
     */
    restoreCheckpoint(path: string, checkpointID: string): Promise<void>;
    /**
     * Delete a checkpoint for a file.
     *
     * @param path - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to delete.
     *
     * @returns A promise which resolves when the checkpoint is deleted.
     */
    deleteCheckpoint(path: string, checkpointID: string): Promise<void>;
    /**
     * Given a drive and a local path, construct a fully qualified
     * path. The inverse of `_driveForPath`.
     *
     * @param drive: an `IDrive`.
     *
     * @param localPath: the local path on the drive.
     *
     * @returns the fully qualified path.
     */
    private _toGlobalPath;
    /**
     * Given a path, get the `IDrive to which it refers,
     * where the path satisfies the pattern
     * `'driveName:path/to/file'`. If there is no `driveName`
     * prepended to the path, it returns the default drive.
     *
     * @param path: a path to a file.
     *
     * @returns A tuple containing an `IDrive` object for the path,
     * and a local path for that drive.
     */
    private _driveForPath;
    /**
     * Respond to fileChanged signals from the drives attached to
     * the manager. This prepends the drive name to the path if necessary,
     * and then forwards the signal.
     */
    private _onFileChanged;
    private _isDisposed;
    private _additionalDrives;
    private _defaultDrive;
    private _fileChanged;
}
/**
 * A default implementation for an `IDrive`, talking to the
 * server using the Jupyter REST API.
 */
export declare class Drive implements Contents.IDrive {
    /**
     * Construct a new contents manager object.
     *
     * @param options - The options used to initialize the object.
     */
    constructor(options?: Drive.IOptions);
    /**
     * The name of the drive, which is used at the leading
     * component of file paths.
     */
    readonly name: string;
    /**
     * A signal emitted when a file operation takes place.
     */
    readonly fileChanged: ISignal<this, Contents.IChangedArgs>;
    /**
     * The server settings of the drive.
     */
    readonly serverSettings: ServerConnection.ISettings;
    /**
     * Test whether the manager has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the manager.
     */
    dispose(): void;
    /**
     * Get a file or directory.
     *
     * @param localPath: The path to the file.
     *
     * @param options: The options used to fetch the file.
     *
     * @returns A promise which resolves with the file content.
     *
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    get(localPath: string, options?: Contents.IFetchOptions): Promise<Contents.IModel>;
    /**
     * Get an encoded download url given a file path.
     *
     * @param localPath - An absolute POSIX file path on the server.
     *
     * #### Notes
     * It is expected that the path contains no relative paths.
     */
    getDownloadUrl(localPath: string): Promise<string>;
    /**
     * Create a new untitled file or directory in the specified directory path.
     *
     * @param options: The options used to create the file.
     *
     * @returns A promise which resolves with the created file content when the
     *    file is created.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel>;
    /**
     * Delete a file.
     *
     * @param localPath - The path to the file.
     *
     * @returns A promise which resolves when the file is deleted.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
     */
    delete(localPath: string): Promise<void>;
    /**
     * Rename a file or directory.
     *
     * @param oldLocalPath - The original file path.
     *
     * @param newLocalPath - The new file path.
     *
     * @returns A promise which resolves with the new file contents model when
     *   the file is renamed.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    rename(oldLocalPath: string, newLocalPath: string): Promise<Contents.IModel>;
    /**
     * Save a file.
     *
     * @param localPath - The desired file path.
     *
     * @param options - Optional overrides to the model.
     *
     * @returns A promise which resolves with the file content model when the
     *   file is saved.
     *
     * #### Notes
     * Ensure that `model.content` is populated for the file.
     *
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    save(localPath: string, options?: Partial<Contents.IModel>): Promise<Contents.IModel>;
    /**
     * Copy a file into a given directory.
     *
     * @param localPath - The original file path.
     *
     * @param toDir - The destination directory path.
     *
     * @returns A promise which resolves with the new contents model when the
     *  file is copied.
     *
     * #### Notes
     * The server will select the name of the copied file.
     *
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    copy(fromFile: string, toDir: string): Promise<Contents.IModel>;
    /**
     * Create a checkpoint for a file.
     *
     * @param localPath - The path of the file.
     *
     * @returns A promise which resolves with the new checkpoint model when the
     *   checkpoint is created.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    createCheckpoint(localPath: string): Promise<Contents.ICheckpointModel>;
    /**
     * List available checkpoints for a file.
     *
     * @param localPath - The path of the file.
     *
     * @returns A promise which resolves with a list of checkpoint models for
     *    the file.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents) and validates the response model.
     */
    listCheckpoints(localPath: string): Promise<Contents.ICheckpointModel[]>;
    /**
     * Restore a file to a known checkpoint state.
     *
     * @param localPath - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to restore.
     *
     * @returns A promise which resolves when the checkpoint is restored.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
     */
    restoreCheckpoint(localPath: string, checkpointID: string): Promise<void>;
    /**
     * Delete a checkpoint for a file.
     *
     * @param localPath - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to delete.
     *
     * @returns A promise which resolves when the checkpoint is deleted.
     *
     * #### Notes
     * Uses the [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
     */
    deleteCheckpoint(localPath: string, checkpointID: string): Promise<void>;
    /**
     * Get a REST url for a file given a path.
     */
    private _getUrl;
    private _apiEndpoint;
    private _isDisposed;
    private _fileChanged;
}
/**
 * A namespace for ContentsManager statics.
 */
export declare namespace ContentsManager {
    /**
     * The options used to initialize a contents manager.
     */
    interface IOptions {
        /**
         * The default drive backend for the contents manager.
         */
        defaultDrive?: Contents.IDrive;
        /**
         * The server settings associated with the manager.
         */
        serverSettings?: ServerConnection.ISettings;
    }
}
/**
 * A namespace for Drive statics.
 */
export declare namespace Drive {
    /**
     * The options used to initialize a `Drive`.
     */
    interface IOptions {
        /**
         * The name for the `Drive`, which is used in file
         * paths to disambiguate it from other drives.
         */
        name?: string;
        /**
         * The server settings for the server.
         */
        serverSettings?: ServerConnection.ISettings;
        /**
         * A REST endpoint for drive requests.
         * If not given, defaults to the Jupyter
         * REST API given by [Jupyter Notebook API](http://petstore.swagger.io/?url=https://raw.githubusercontent.com/jupyter/notebook/master/notebook/services/api/api.yaml#!/contents).
         */
        apiEndpoint?: string;
    }
}
