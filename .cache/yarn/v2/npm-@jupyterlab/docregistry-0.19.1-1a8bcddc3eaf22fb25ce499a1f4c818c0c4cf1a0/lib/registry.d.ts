import { Contents, Kernel } from '@jupyterlab/services';
import { IIterator } from '@phosphor/algorithm';
import { JSONValue } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
import { DockLayout, Widget } from '@phosphor/widgets';
import { IClientSession, Toolbar } from '@jupyterlab/apputils';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { IChangedArgs as IChangedArgsGeneric } from '@jupyterlab/coreutils';
import { IModelDB } from '@jupyterlab/observables';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
/**
 * The document registry.
 */
export declare class DocumentRegistry implements IDisposable {
    /**
     * Construct a new document registry.
     */
    constructor(options?: DocumentRegistry.IOptions);
    /**
     * A signal emitted when the registry has changed.
     */
    readonly changed: ISignal<this, DocumentRegistry.IChangedArgs>;
    /**
     * Get whether the document registry has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the document registery.
     */
    dispose(): void;
    /**
     * Add a widget factory to the registry.
     *
     * @param factory - The factory instance to register.
     *
     * @returns A disposable which will unregister the factory.
     *
     * #### Notes
     * If a factory with the given `'displayName'` is already registered,
     * a warning will be logged, and this will be a no-op.
     * If `'*'` is given as a default extension, the factory will be registered
     * as the global default.
     * If an extension or global default is already registered, this factory
     * will override the existing default.
     */
    addWidgetFactory(factory: DocumentRegistry.WidgetFactory): IDisposable;
    /**
     * Add a model factory to the registry.
     *
     * @param factory - The factory instance.
     *
     * @returns A disposable which will unregister the factory.
     *
     * #### Notes
     * If a factory with the given `name` is already registered, or
     * the given factory is already registered, a warning will be logged
     * and this will be a no-op.
     */
    addModelFactory(factory: DocumentRegistry.ModelFactory): IDisposable;
    /**
     * Add a widget extension to the registry.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @param extension - A widget extension.
     *
     * @returns A disposable which will unregister the extension.
     *
     * #### Notes
     * If the extension is already registered for the given
     * widget name, a warning will be logged and this will be a no-op.
     */
    addWidgetExtension(widgetName: string, extension: DocumentRegistry.WidgetExtension): IDisposable;
    /**
     * Add a file type to the document registry.
     *
     * @params fileType - The file type object to register.
     *
     * @returns A disposable which will unregister the command.
     *
     * #### Notes
     * These are used to populate the "Create New" dialog.
     */
    addFileType(fileType: Partial<DocumentRegistry.IFileType>): IDisposable;
    /**
     * Get a list of the preferred widget factories.
     *
     * @param path - The file path to filter the results.
     *
     * @returns A new array of widget factories.
     *
     * #### Notes
     * Only the widget factories whose associated model factory have
     * been registered will be returned.
     * The first item is considered the default. The returned array
     * has widget factories in the following order:
     * - path-specific default factory
     * - path-specific default rendered factory
     * - global default factory
     * - all other path-specific factories
     * - all other global factories
     */
    preferredWidgetFactories(path: string): DocumentRegistry.WidgetFactory[];
    /**
     * Get the default rendered widget factory for a path.
     *
     * @param path - The path to for which to find a widget factory.
     *
     * @returns The default rendered widget factory for the path.
     *
     * ### Notes
     * If the widget factory has registered a separate set of `defaultRendered`
     * file types and there is a match in that set, this returns that.
     * Otherwise, this returns the same widget factory as
     * [[defaultWidgetFactory]].
     */
    defaultRenderedWidgetFactory(path: string): DocumentRegistry.WidgetFactory;
    /**
     * Get the default widget factory for a path.
     *
     * @param path - An optional file path to filter the results.
     *
     * @returns The default widget factory for an path.
     *
     * #### Notes
     * This is equivalent to the first value in [[preferredWidgetFactories]].
     */
    defaultWidgetFactory(path?: string): DocumentRegistry.WidgetFactory;
    /**
     * Create an iterator over the widget factories that have been registered.
     *
     * @returns A new iterator of widget factories.
     */
    widgetFactories(): IIterator<DocumentRegistry.WidgetFactory>;
    /**
     * Create an iterator over the model factories that have been registered.
     *
     * @returns A new iterator of model factories.
     */
    modelFactories(): IIterator<DocumentRegistry.ModelFactory>;
    /**
     * Create an iterator over the registered extensions for a given widget.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @returns A new iterator over the widget extensions.
     */
    widgetExtensions(widgetName: string): IIterator<DocumentRegistry.WidgetExtension>;
    /**
     * Create an iterator over the file types that have been registered.
     *
     * @returns A new iterator of file types.
     */
    fileTypes(): IIterator<DocumentRegistry.IFileType>;
    /**
     * Get a widget factory by name.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @returns A widget factory instance.
     */
    getWidgetFactory(widgetName: string): DocumentRegistry.WidgetFactory | undefined;
    /**
     * Get a model factory by name.
     *
     * @param name - The name of the model factory.
     *
     * @returns A model factory instance.
     */
    getModelFactory(name: string): DocumentRegistry.ModelFactory | undefined;
    /**
     * Get a file type by name.
     */
    getFileType(name: string): DocumentRegistry.IFileType | undefined;
    /**
     * Get a kernel preference.
     *
     * @param path - The file path.
     *
     * @param widgetName - The name of the widget factory.
     *
     * @param kernel - An optional existing kernel model.
     *
     * @returns A kernel preference.
     */
    getKernelPreference(path: string, widgetName: string, kernel?: Partial<Kernel.IModel>): IClientSession.IKernelPreference | undefined;
    /**
     * Get the best file type given a contents model.
     *
     * @param model - The contents model of interest.
     *
     * @returns The best matching file type.
     */
    getFileTypeForModel(model: Partial<Contents.IModel>): DocumentRegistry.IFileType;
    /**
     * Get the file types that match a file name.
     *
     * @param path - The path of the file.
     *
     * @returns An ordered list of matching file types.
     */
    getFileTypesForPath(path: string): DocumentRegistry.IFileType[];
    private _modelFactories;
    private _widgetFactories;
    private _defaultWidgetFactory;
    private _defaultWidgetFactories;
    private _defaultRenderedWidgetFactories;
    private _widgetFactoryExtensions;
    private _fileTypes;
    private _extenders;
    private _changed;
    private _isDisposed;
}
/**
 * The namespace for the `DocumentRegistry` class statics.
 */
export declare namespace DocumentRegistry {
    /**
     * The item to be added to document toolbar.
     */
    interface IToolbarItem {
        name: string;
        widget: Widget;
    }
    /**
     * The options used to create a document registry.
     */
    interface IOptions {
        /**
         * The text model factory for the registry.  A default instance will
         * be used if not given.
         */
        textModelFactory?: ModelFactory;
        /**
         * The initial file types for the registry.
         * The [[DocumentRegistry.defaultFileTypes]] will be used if not given.
         */
        initialFileTypes?: DocumentRegistry.IFileType[];
    }
    /**
     * The interface for a document model.
     */
    interface IModel extends IDisposable {
        /**
         * A signal emitted when the document content changes.
         */
        contentChanged: ISignal<this, void>;
        /**
         * A signal emitted when the model state changes.
         */
        stateChanged: ISignal<this, IChangedArgsGeneric<any>>;
        /**
         * The dirty state of the model.
         *
         * #### Notes
         * This should be cleared when the document is loaded from
         * or saved to disk.
         */
        dirty: boolean;
        /**
         * The read-only state of the model.
         */
        readOnly: boolean;
        /**
         * The default kernel name of the document.
         */
        readonly defaultKernelName: string;
        /**
         * The default kernel language of the document.
         */
        readonly defaultKernelLanguage: string;
        /**
         * The underlying `IModelDB` instance in which model
         * data is stored.
         *
         * ### Notes
         * Making direct edits to the values stored in the`IModelDB`
         * is not recommended, and may produce unpredictable results.
         */
        readonly modelDB: IModelDB;
        /**
         * Serialize the model to a string.
         */
        toString(): string;
        /**
         * Deserialize the model from a string.
         *
         * #### Notes
         * Should emit a [contentChanged] signal.
         */
        fromString(value: string): void;
        /**
         * Serialize the model to JSON.
         */
        toJSON(): JSONValue;
        /**
         * Deserialize the model from JSON.
         *
         * #### Notes
         * Should emit a [contentChanged] signal.
         */
        fromJSON(value: any): void;
        /**
         * Initialize model state after initial data load.
         *
         * #### Notes
         * This function must be called after the initial data is loaded to set up
         * initial model state, such as an initial undo stack, etc.
         */
        initialize(): void;
    }
    /**
     * The interface for a document model that represents code.
     */
    interface ICodeModel extends IModel, CodeEditor.IModel {
    }
    /**
     * The document context object.
     */
    interface IContext<T extends IModel> extends IDisposable {
        /**
         * A signal emitted when the path changes.
         */
        pathChanged: ISignal<this, string>;
        /**
         * A signal emitted when the contentsModel changes.
         */
        fileChanged: ISignal<this, Contents.IModel>;
        /**
         * A signal emitted on the start and end of a saving operation.
         */
        saveState: ISignal<this, SaveState>;
        /**
         * A signal emitted when the context is disposed.
         */
        disposed: ISignal<this, void>;
        /**
         * The data model for the document.
         */
        readonly model: T;
        /**
         * The client session object associated with the context.
         */
        readonly session: IClientSession;
        /**
         * The current path associated with the document.
         */
        readonly path: string;
        /**
         * The current local path associated with the document.
         * If the document is in the default notebook file browser,
         * this is the same as the path.
         */
        readonly localPath: string;
        /**
         * The document metadata, stored as a services contents model.
         *
         * #### Notes
         * This will be null until the context is 'ready'. Since we only store
         * metadata here, the `.contents` attribute will always be empty.
         */
        readonly contentsModel: Contents.IModel | null;
        /**
         * The url resolver for the context.
         */
        readonly urlResolver: IRenderMime.IResolver;
        /**
         * Whether the context is ready.
         */
        readonly isReady: boolean;
        /**
         * A promise that is fulfilled when the context is ready.
         */
        readonly ready: Promise<void>;
        /**
         * Save the document contents to disk.
         */
        save(): Promise<void>;
        /**
         * Save the document to a different path chosen by the user.
         */
        saveAs(): Promise<void>;
        /**
         * Revert the document contents to disk contents.
         */
        revert(): Promise<void>;
        /**
         * Create a checkpoint for the file.
         *
         * @returns A promise which resolves with the new checkpoint model when the
         *   checkpoint is created.
         */
        createCheckpoint(): Promise<Contents.ICheckpointModel>;
        /**
         * Delete a checkpoint for the file.
         *
         * @param checkpointID - The id of the checkpoint to delete.
         *
         * @returns A promise which resolves when the checkpoint is deleted.
         */
        deleteCheckpoint(checkpointID: string): Promise<void>;
        /**
         * Restore the file to a known checkpoint state.
         *
         * @param checkpointID - The optional id of the checkpoint to restore,
         *   defaults to the most recent checkpoint.
         *
         * @returns A promise which resolves when the checkpoint is restored.
         */
        restoreCheckpoint(checkpointID?: string): Promise<void>;
        /**
         * List available checkpoints for the file.
         *
         * @returns A promise which resolves with a list of checkpoint models for
         *    the file.
         */
        listCheckpoints(): Promise<Contents.ICheckpointModel[]>;
        /**
         * Add a sibling widget to the document manager.
         *
         * @param widget - The widget to add to the document manager.
         *
         * @param options - The desired options for adding the sibling.
         *
         * @returns A disposable used to remove the sibling if desired.
         *
         * #### Notes
         * It is assumed that the widget has the same model and context
         * as the original widget.
         */
        addSibling(widget: Widget, options?: IOpenOptions): IDisposable;
    }
    type SaveState = 'started' | 'completed' | 'failed';
    /**
     * A type alias for a context.
     */
    type Context = IContext<IModel>;
    /**
     * A type alias for a code context.
     */
    type CodeContext = IContext<ICodeModel>;
    /**
     * The options used to initialize a widget factory.
     */
    interface IWidgetFactoryOptions<T extends Widget = Widget> {
        /**
         * The name of the widget to display in dialogs.
         */
        readonly name: string;
        /**
         * The file types the widget can view.
         */
        readonly fileTypes: ReadonlyArray<string>;
        /**
         * The file types for which the factory should be the default.
         */
        readonly defaultFor?: ReadonlyArray<string>;
        /**
         * The file types for which the factory should be the default for rendering,
         * if that is different than the default factory (which may be for editing).
         * If undefined, then it will fall back on the default file type.
         */
        readonly defaultRendered?: ReadonlyArray<string>;
        /**
         * Whether the widget factory is read only.
         */
        readonly readOnly?: boolean;
        /**
         * The registered name of the model type used to create the widgets.
         */
        readonly modelName?: string;
        /**
         * Whether the widgets prefer having a kernel started.
         */
        readonly preferKernel?: boolean;
        /**
         * Whether the widgets can start a kernel when opened.
         */
        readonly canStartKernel?: boolean;
        /**
         * A function producing toolbar widgets, overriding the default toolbar widgets.
         */
        readonly toolbarFactory?: (widget: T) => DocumentRegistry.IToolbarItem[];
    }
    /**
     * The options used to open a widget.
     */
    interface IOpenOptions {
        /**
         * The reference widget id for the insert location.
         *
         * The default is `null`.
         */
        ref?: string | null;
        /**
         * The supported insertion modes.
         *
         * An insert mode is used to specify how a widget should be added
         * to the main area relative to a reference widget.
         */
        mode?: DockLayout.InsertMode;
        /**
         * Whether to activate the widget.  Defaults to `true`.
         */
        activate?: boolean;
    }
    /**
     * The interface for a widget factory.
     */
    interface IWidgetFactory<T extends IDocumentWidget, U extends IModel> extends IDisposable, IWidgetFactoryOptions {
        /**
         * A signal emitted when a new widget is created.
         */
        widgetCreated: ISignal<IWidgetFactory<T, U>, T>;
        /**
         * Create a new widget given a context.
         *
         * #### Notes
         * It should emit the [widgetCreated] signal with the new widget.
         */
        createNew(context: IContext<U>): T;
    }
    /**
     * A type alias for a standard widget factory.
     */
    type WidgetFactory = IWidgetFactory<IDocumentWidget, IModel>;
    /**
     * An interface for a widget extension.
     */
    interface IWidgetExtension<T extends Widget, U extends IModel> {
        /**
         * Create a new extension for a given widget.
         */
        createNew(widget: T, context: IContext<U>): IDisposable;
    }
    /**
     * A type alias for a standard widget extension.
     */
    type WidgetExtension = IWidgetExtension<Widget, IModel>;
    /**
     * The interface for a model factory.
     */
    interface IModelFactory<T extends IModel> extends IDisposable {
        /**
         * The name of the model.
         */
        readonly name: string;
        /**
         * The content type of the file (defaults to `"file"`).
         */
        readonly contentType: Contents.ContentType;
        /**
         * The format of the file (defaults to `"text"`).
         */
        readonly fileFormat: Contents.FileFormat;
        /**
         * Create a new model for a given path.
         *
         * @param languagePreference - An optional kernel language preference.
         *
         * @returns A new document model.
         */
        createNew(languagePreference?: string, modelDB?: IModelDB): T;
        /**
         * Get the preferred kernel language given a file path.
         */
        preferredLanguage(path: string): string;
    }
    /**
     * A type alias for a standard model factory.
     */
    type ModelFactory = IModelFactory<IModel>;
    /**
     * A type alias for a code model factory.
     */
    type CodeModelFactory = IModelFactory<ICodeModel>;
    /**
     * An interface for a file type.
     */
    interface IFileType {
        /**
         * The name of the file type.
         */
        readonly name: string;
        /**
         * The mime types associated the file type.
         */
        readonly mimeTypes: ReadonlyArray<string>;
        /**
         * The extensions of the file type (e.g. `".txt"`).  Can be a compound
         * extension (e.g. `".table.json`).
         */
        readonly extensions: ReadonlyArray<string>;
        /**
         * An optional display name for the file type.
         */
        readonly displayName?: string;
        /**
         * An optional pattern for a file name (e.g. `^Dockerfile$`).
         */
        readonly pattern?: string;
        /**
         * The icon class name for the file type.
         */
        readonly iconClass?: string;
        /**
         * The icon label for the file type.
         */
        readonly iconLabel?: string;
        /**
         * The content type of the new file.
         */
        readonly contentType: Contents.ContentType;
        /**
         * The format of the new file.
         */
        readonly fileFormat: Contents.FileFormat;
    }
    /**
     * The defaults used for a file type.
     */
    const fileTypeDefaults: IFileType;
    /**
     * An arguments object for the `changed` signal.
     */
    interface IChangedArgs {
        /**
         * The type of the changed item.
         */
        readonly type: 'widgetFactory' | 'modelFactory' | 'widgetExtension' | 'fileType';
        /**
         * The name of the item or the widget factory being extended.
         */
        readonly name: string;
        /**
         * Whether the item was added or removed.
         */
        readonly change: 'added' | 'removed';
    }
    /**
     * The default text file type used by the document registry.
     */
    const defaultTextFileType: IFileType;
    /**
     * The default notebook file type used by the document registry.
     */
    const defaultNotebookFileType: IFileType;
    /**
     * The default directory file type used by the document registry.
     */
    const defaultDirectoryFileType: IFileType;
    /**
     * The default file types used by the document registry.
     */
    const defaultFileTypes: ReadonlyArray<Partial<IFileType>>;
}
/**
 * An interface for a document widget.
 */
export interface IDocumentWidget<T extends Widget = Widget, U extends DocumentRegistry.IModel = DocumentRegistry.IModel> extends Widget {
    /**
     * The content widget.
     */
    readonly content: T;
    /**
     * A promise resolving after the content widget is revealed.
     */
    readonly revealed: Promise<void>;
    /**
     * The context associated with the document.
     */
    readonly context: DocumentRegistry.IContext<U>;
    /**
     * The toolbar for the widget.
     */
    readonly toolbar: Toolbar<Widget>;
}
