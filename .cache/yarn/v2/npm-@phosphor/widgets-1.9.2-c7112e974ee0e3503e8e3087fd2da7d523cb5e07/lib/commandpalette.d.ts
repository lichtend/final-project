import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { CommandRegistry } from '@phosphor/commands';
import { Message } from '@phosphor/messaging';
import { ElementDataset, VirtualElement, h } from '@phosphor/virtualdom';
import { Widget } from './widget';
/**
 * A widget which displays command items as a searchable palette.
 */
export declare class CommandPalette extends Widget {
    /**
     * Construct a new command palette.
     *
     * @param options - The options for initializing the palette.
     */
    constructor(options: CommandPalette.IOptions);
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * The command registry used by the command palette.
     */
    readonly commands: CommandRegistry;
    /**
     * The renderer used by the command palette.
     */
    readonly renderer: CommandPalette.IRenderer;
    /**
     * The command palette search node.
     *
     * #### Notes
     * This is the node which contains the search-related elements.
     */
    readonly searchNode: HTMLDivElement;
    /**
     * The command palette input node.
     *
     * #### Notes
     * This is the actual input node for the search area.
     */
    readonly inputNode: HTMLInputElement;
    /**
     * The command palette content node.
     *
     * #### Notes
     * This is the node which holds the command item nodes.
     *
     * Modifying this node directly can lead to undefined behavior.
     */
    readonly contentNode: HTMLUListElement;
    /**
     * A read-only array of the command items in the palette.
     */
    readonly items: ReadonlyArray<CommandPalette.IItem>;
    /**
     * Add a command item to the command palette.
     *
     * @param options - The options for creating the command item.
     *
     * @returns The command item added to the palette.
     */
    addItem(options: CommandPalette.IItemOptions): CommandPalette.IItem;
    /**
     * Remove an item from the command palette.
     *
     * @param item - The item to remove from the palette.
     *
     * #### Notes
     * This is a no-op if the item is not in the palette.
     */
    removeItem(item: CommandPalette.IItem): void;
    /**
     * Remove the item at a given index from the command palette.
     *
     * @param index - The index of the item to remove.
     *
     * #### Notes
     * This is a no-op if the index is out of range.
     */
    removeItemAt(index: number): void;
    /**
     * Remove all items from the command palette.
     */
    clearItems(): void;
    /**
     * Clear the search results and schedule an update.
     *
     * #### Notes
     * This should be called whenever the search results of the palette
     * should be updated.
     *
     * This is typically called automatically by the palette as needed,
     * but can be called manually if the input text is programatically
     * changed.
     *
     * The rendered results are updated asynchronously.
     */
    refresh(): void;
    /**
     * Handle the DOM events for the command palette.
     *
     * @param event - The DOM event sent to the command palette.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the command palette's DOM node.
     * It should not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * A message handler invoked on a `'before-attach'` message.
     */
    protected onBeforeAttach(msg: Message): void;
    /**
     * A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    /**
     * A message handler invoked on an `'activate-request'` message.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * A message handler invoked on an `'update-request'` message.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle the `'click'` event for the command palette.
     */
    private _evtClick;
    /**
     * Handle the `'keydown'` event for the command palette.
     */
    private _evtKeyDown;
    /**
     * Activate the next enabled command item.
     */
    private _activateNextItem;
    /**
     * Activate the previous enabled command item.
     */
    private _activatePreviousItem;
    /**
     * Execute the command item at the given index, if possible.
     */
    private _execute;
    /**
     * Toggle the focused modifier based on the input node focus state.
     */
    private _toggleFocused;
    /**
     * A signal handler for generic command changes.
     */
    private _onGenericChange;
    private _activeIndex;
    private _items;
    private _results;
}
/**
 * The namespace for the `CommandPalette` class statics.
 */
export declare namespace CommandPalette {
    /**
     * An options object for creating a command palette.
     */
    interface IOptions {
        /**
         * The command registry for use with the command palette.
         */
        commands: CommandRegistry;
        /**
         * A custom renderer for use with the command palette.
         *
         * The default is a shared renderer instance.
         */
        renderer?: IRenderer;
    }
    /**
     * An options object for creating a command item.
     */
    interface IItemOptions {
        /**
         * The category for the item.
         */
        category: string;
        /**
         * The command to execute when the item is triggered.
         */
        command: string;
        /**
         * The arguments for the command.
         *
         * The default value is an empty object.
         */
        args?: ReadonlyJSONObject;
        /**
         * The rank for the command item.
         *
         * The rank is used as a tie-breaker when ordering command items
         * for display. Items are sorted in the following order:
         *   1. Text match (lower is better)
         *   2. Category (locale order)
         *   3. Rank (lower is better)
         *   4. Label (locale order)
         *
         * The default rank is `Infinity`.
         */
        rank?: number;
    }
    /**
     * An object which represents an item in a command palette.
     *
     * #### Notes
     * Item objects are created automatically by a command palette.
     */
    interface IItem {
        /**
         * The command to execute when the item is triggered.
         */
        readonly command: string;
        /**
         * The arguments for the command.
         */
        readonly args: ReadonlyJSONObject;
        /**
         * The category for the command item.
         */
        readonly category: string;
        /**
         * The rank for the command item.
         */
        readonly rank: number;
        /**
         * The display label for the command item.
         */
        readonly label: string;
        /**
         * The display caption for the command item.
         */
        readonly caption: string;
        /**
         * The icon class for the command item.
         */
        readonly iconClass: string;
        /**
         * The icon label for the command item.
         */
        readonly iconLabel: string;
        /**
         * The extra class name for the command item.
         */
        readonly className: string;
        /**
         * The dataset for the command item.
         */
        readonly dataset: CommandRegistry.Dataset;
        /**
         * Whether the command item is enabled.
         */
        readonly isEnabled: boolean;
        /**
         * Whether the command item is toggled.
         */
        readonly isToggled: boolean;
        /**
         * Whether the command item is visible.
         */
        readonly isVisible: boolean;
        /**
         * The key binding for the command item.
         */
        readonly keyBinding: CommandRegistry.IKeyBinding | null;
    }
    /**
     * The render data for a command palette header.
     */
    interface IHeaderRenderData {
        /**
         * The category of the header.
         */
        readonly category: string;
        /**
         * The indices of the matched characters in the category.
         */
        readonly indices: ReadonlyArray<number> | null;
    }
    /**
     * The render data for a command palette item.
     */
    interface IItemRenderData {
        /**
         * The command palette item to render.
         */
        readonly item: IItem;
        /**
         * The indices of the matched characters in the label.
         */
        readonly indices: ReadonlyArray<number> | null;
        /**
         * Whether the item is the active item.
         */
        readonly active: boolean;
    }
    /**
     * The render data for a command palette empty message.
     */
    interface IEmptyMessageRenderData {
        /**
         * The query which failed to match any commands.
         */
        query: string;
    }
    /**
     * A renderer for use with a command palette.
     */
    interface IRenderer {
        /**
         * Render the virtual element for a command palette header.
         *
         * @param data - The data to use for rendering the header.
         *
         * @returns A virtual element representing the header.
         */
        renderHeader(data: IHeaderRenderData): VirtualElement;
        /**
         * Render the virtual element for a command palette item.
         *
         * @param data - The data to use for rendering the item.
         *
         * @returns A virtual element representing the item.
         *
         * #### Notes
         * The command palette will not render invisible items.
         */
        renderItem(data: IItemRenderData): VirtualElement;
        /**
         * Render the empty results message for a command palette.
         *
         * @param data - The data to use for rendering the message.
         *
         * @returns A virtual element representing the message.
         */
        renderEmptyMessage(data: IEmptyMessageRenderData): VirtualElement;
    }
    /**
     * The default implementation of `IRenderer`.
     */
    class Renderer implements IRenderer {
        /**
         * Render the virtual element for a command palette header.
         *
         * @param data - The data to use for rendering the header.
         *
         * @returns A virtual element representing the header.
         */
        renderHeader(data: IHeaderRenderData): VirtualElement;
        /**
         * Render the virtual element for a command palette item.
         *
         * @param data - The data to use for rendering the item.
         *
         * @returns A virtual element representing the item.
         */
        renderItem(data: IItemRenderData): VirtualElement;
        /**
         * Render the empty results message for a command palette.
         *
         * @param data - The data to use for rendering the message.
         *
         * @returns A virtual element representing the message.
         */
        renderEmptyMessage(data: IEmptyMessageRenderData): VirtualElement;
        /**
         * Render the icon for a command palette item.
         *
         * @param data - The data to use for rendering the icon.
         *
         * @returns A virtual element representing the icon.
         */
        renderItemIcon(data: IItemRenderData): VirtualElement;
        /**
         * Render the content for a command palette item.
         *
         * @param data - The data to use for rendering the content.
         *
         * @returns A virtual element representing the content.
         */
        renderItemContent(data: IItemRenderData): VirtualElement;
        /**
         * Render the label for a command palette item.
         *
         * @param data - The data to use for rendering the label.
         *
         * @returns A virtual element representing the label.
         */
        renderItemLabel(data: IItemRenderData): VirtualElement;
        /**
         * Render the caption for a command palette item.
         *
         * @param data - The data to use for rendering the caption.
         *
         * @returns A virtual element representing the caption.
         */
        renderItemCaption(data: IItemRenderData): VirtualElement;
        /**
         * Render the shortcut for a command palette item.
         *
         * @param data - The data to use for rendering the shortcut.
         *
         * @returns A virtual element representing the shortcut.
         */
        renderItemShortcut(data: IItemRenderData): VirtualElement;
        /**
         * Create the class name for the command palette item.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the command palette item.
         */
        createItemClass(data: IItemRenderData): string;
        /**
         * Create the dataset for the command palette item.
         *
         * @param data - The data to use for creating the dataset.
         *
         * @returns The dataset for the command palette item.
         */
        createItemDataset(data: IItemRenderData): ElementDataset;
        /**
         * Create the class name for the command item icon.
         *
         * @param data - The data to use for the class name.
         *
         * @returns The full class name for the item icon.
         */
        createIconClass(data: IItemRenderData): string;
        /**
         * Create the render content for the header node.
         *
         * @param data - The data to use for the header content.
         *
         * @returns The content to add to the header node.
         */
        formatHeader(data: IHeaderRenderData): h.Child;
        /**
         * Create the render content for the empty message node.
         *
         * @param data - The data to use for the empty message content.
         *
         * @returns The content to add to the empty message node.
         */
        formatEmptyMessage(data: IEmptyMessageRenderData): h.Child;
        /**
         * Create the render content for the item shortcut node.
         *
         * @param data - The data to use for the shortcut content.
         *
         * @returns The content to add to the shortcut node.
         */
        formatItemShortcut(data: IItemRenderData): h.Child;
        /**
         * Create the render content for the item label node.
         *
         * @param data - The data to use for the label content.
         *
         * @returns The content to add to the label node.
         */
        formatItemLabel(data: IItemRenderData): h.Child;
        /**
         * Create the render content for the item caption node.
         *
         * @param data - The data to use for the caption content.
         *
         * @returns The content to add to the caption node.
         */
        formatItemCaption(data: IItemRenderData): h.Child;
    }
    /**
     * The default `Renderer` instance.
     */
    const defaultRenderer: Renderer;
}
