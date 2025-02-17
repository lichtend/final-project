import { nbformat } from '@jupyterlab/coreutils';
import { IObservableMap, IModelDB } from '@jupyterlab/observables';
import { IAttachmentModel } from '@jupyterlab/rendermime';
import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
/**
 * The model for attachments.
 */
export interface IAttachmentsModel extends IDisposable {
    /**
     * A signal emitted when the model state changes.
     */
    readonly stateChanged: ISignal<IAttachmentsModel, void>;
    /**
     * A signal emitted when the model changes.
     */
    readonly changed: ISignal<IAttachmentsModel, IAttachmentsModel.ChangedArgs>;
    /**
     * The length of the items in the model.
     */
    readonly length: number;
    /**
     * The keys of the attachments in the model.
     */
    readonly keys: ReadonlyArray<string>;
    /**
     * The attachment content factory used by the model.
     */
    readonly contentFactory: IAttachmentsModel.IContentFactory;
    /**
     * Whether the specified key is set.
     */
    has(key: string): boolean;
    /**
     * Get an item for the specified key.
     */
    get(key: string): IAttachmentModel;
    /**
     * Set the value of the specified key.
     */
    set(key: string, attachment: nbformat.IMimeBundle): void;
    /**
     * Clear all of the attachments.
     */
    clear(): void;
    /**
     * Deserialize the model from JSON.
     *
     * #### Notes
     * This will clear any existing data.
     */
    fromJSON(values: nbformat.IAttachments): void;
    /**
     * Serialize the model to JSON.
     */
    toJSON(): nbformat.IAttachments;
}
/**
 * The namespace for IAttachmentsModel interfaces.
 */
export declare namespace IAttachmentsModel {
    /**
     * The options used to create a attachments model.
     */
    interface IOptions {
        /**
         * The initial values for the model.
         */
        values?: nbformat.IAttachments;
        /**
         * The attachment content factory used by the model.
         *
         * If not given, a default factory will be used.
         */
        contentFactory?: IContentFactory;
        /**
         * An optional IModelDB to store the attachments model.
         */
        modelDB?: IModelDB;
    }
    /**
     * A type alias for changed args.
     */
    type ChangedArgs = IObservableMap.IChangedArgs<IAttachmentModel>;
    /**
     * The interface for an attachment content factory.
     */
    interface IContentFactory {
        /**
         * Create an attachment model.
         */
        createAttachmentModel(options: IAttachmentModel.IOptions): IAttachmentModel;
    }
}
/**
 * The default implementation of the IAttachmentsModel.
 */
export declare class AttachmentsModel implements IAttachmentsModel {
    /**
     * Construct a new observable outputs instance.
     */
    constructor(options?: IAttachmentsModel.IOptions);
    /**
     * A signal emitted when the model state changes.
     */
    readonly stateChanged: ISignal<IAttachmentsModel, void>;
    /**
     * A signal emitted when the model changes.
     */
    readonly changed: ISignal<this, IAttachmentsModel.ChangedArgs>;
    /**
     * The keys of the attachments in the model.
     */
    readonly keys: ReadonlyArray<string>;
    /**
     * Get the length of the items in the model.
     */
    readonly length: number;
    /**
     * The attachment content factory used by the model.
     */
    readonly contentFactory: IAttachmentsModel.IContentFactory;
    /**
     * Test whether the model is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources used by the model.
     */
    dispose(): void;
    /**
     * Whether the specified key is set.
     */
    has(key: string): boolean;
    /**
     * Get an item at the specified key.
     */
    get(key: string): IAttachmentModel;
    /**
     * Set the value at the specified key.
     */
    set(key: string, value: nbformat.IMimeBundle): void;
    /**
     * Clear all of the attachments.
     */
    clear(): void;
    /**
     * Deserialize the model from JSON.
     *
     * #### Notes
     * This will clear any existing data.
     */
    fromJSON(values: nbformat.IAttachments): void;
    /**
     * Serialize the model to JSON.
     */
    toJSON(): nbformat.IAttachments;
    /**
     * Create an attachment item and hook up its signals.
     */
    private _createItem;
    /**
     * Handle a change to the list.
     */
    private _onMapChanged;
    /**
     * If the serialized version of the outputs have changed due to a remote
     * action, then update the model accordingly.
     */
    private _onSerializedChanged;
    /**
     * Handle a change to an item.
     */
    private _onGenericChange;
    private _map;
    private _isDisposed;
    private _stateChanged;
    private _changed;
    private _modelDB;
    private _serialized;
    private _changeGuard;
}
/**
 * The namespace for AttachmentsModel class statics.
 */
export declare namespace AttachmentsModel {
    /**
     * The default implementation of a `IAttachemntsModel.IContentFactory`.
     */
    class ContentFactory implements IAttachmentsModel.IContentFactory {
        /**
         * Create an attachment model.
         */
        createAttachmentModel(options: IAttachmentModel.IOptions): IAttachmentModel;
    }
    /**
     * The default attachment model factory.
     */
    const defaultContentFactory: ContentFactory;
}
/**
 * A resolver for cell attachments 'attchment:filename'.
 *
 * Will resolve to a data: url.
 */
export declare class AttachmentsResolver implements IRenderMime.IResolver {
    /**
     * Create an attachments resolver object.
     */
    constructor(options: AttachmentsResolver.IOptions);
    /**
     * Resolve a relative url to a correct server path.
     */
    resolveUrl(url: string): Promise<string>;
    /**
     * Get the download url of a given absolute server path.
     */
    getDownloadUrl(path: string): Promise<string>;
    /**
     * Whether the URL should be handled by the resolver
     * or not.
     */
    isLocal(url: string): boolean;
    private _model;
    private _parent;
}
/**
 * The namespace for `AttachmentsResolver` class statics.
 */
export declare namespace AttachmentsResolver {
    /**
     * The options used to create an AttachmentsResolver.
     */
    interface IOptions {
        /**
         * The attachments model to resolve against.
         */
        model: IAttachmentsModel;
        /**
         * A parent resolver to use if the URL/path is not for an attachment.
         */
        parent?: IRenderMime.IResolver;
    }
}
