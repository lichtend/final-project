import { Widget } from '@phosphor/widgets';
import { ABCWidgetFactory, DocumentRegistry, IDocumentWidget } from '@jupyterlab/docregistry';
import { CodeEditor, IEditorServices, IEditorMimeTypeService, CodeEditorWrapper } from '@jupyterlab/codeeditor';
import { Message } from '@phosphor/messaging';
/**
 * A code editor wrapper for the file editor.
 */
export declare class FileEditorCodeWrapper extends CodeEditorWrapper {
    /**
     * Construct a new editor widget.
     */
    constructor(options: FileEditor.IOptions);
    /**
     * Get the context for the editor widget.
     */
    readonly context: DocumentRegistry.Context;
    /**
     * A promise that resolves when the file editor is ready.
     */
    readonly ready: Promise<void>;
    /**
     * Handle actions that should be taken when the context is ready.
     */
    private _onContextReady;
    /**
     * Handle a change in context model content.
     */
    private _onContentChanged;
    /**
     * Handle a change to the collaborators on the model
     * by updating UI elements associated with them.
     */
    private _onCollaboratorsChanged;
    protected _context: DocumentRegistry.Context;
    private _ready;
}
/**
 * A widget for editors.
 */
export declare class FileEditor extends Widget {
    /**
     * Construct a new editor widget.
     */
    constructor(options: FileEditor.IOptions);
    /**
     * Get the context for the editor widget.
     */
    readonly context: DocumentRegistry.Context;
    /**
     * A promise that resolves when the file editor is ready.
     */
    readonly ready: Promise<void>;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the widget's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Handle `after-attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Ensure that the widget has focus.
     */
    private _ensureFocus;
    /**
     * Handle a change to the path.
     */
    private _onPathChanged;
    private editorWidget;
    model: CodeEditor.IModel;
    editor: CodeEditor.IEditor;
    protected _context: DocumentRegistry.Context;
    private _mimeTypeService;
}
/**
 * The namespace for editor widget statics.
 */
export declare namespace FileEditor {
    /**
     * The options used to create an editor widget.
     */
    interface IOptions {
        /**
         * A code editor factory.
         */
        factory: CodeEditor.Factory;
        /**
         * The mime type service for the editor.
         */
        mimeTypeService: IEditorMimeTypeService;
        /**
         * The document context associated with the editor.
         */
        context: DocumentRegistry.CodeContext;
    }
}
/**
 * A widget factory for editors.
 */
export declare class FileEditorFactory extends ABCWidgetFactory<IDocumentWidget<FileEditor>, DocumentRegistry.ICodeModel> {
    /**
     * Construct a new editor widget factory.
     */
    constructor(options: FileEditorFactory.IOptions);
    /**
     * Create a new widget given a context.
     */
    protected createNewWidget(context: DocumentRegistry.CodeContext): IDocumentWidget<FileEditor>;
    private _services;
}
/**
 * The namespace for `FileEditorFactory` class statics.
 */
export declare namespace FileEditorFactory {
    /**
     * The options used to create an editor widget factory.
     */
    interface IOptions {
        /**
         * The editor services used by the factory.
         */
        editorServices: IEditorServices;
        /**
         * The factory options associated with the factory.
         */
        factoryOptions: DocumentRegistry.IWidgetFactoryOptions<IDocumentWidget<FileEditor>>;
    }
}
