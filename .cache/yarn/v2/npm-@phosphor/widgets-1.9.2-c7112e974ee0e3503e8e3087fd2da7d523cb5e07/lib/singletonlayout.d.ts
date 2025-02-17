import { IIterator } from '@phosphor/algorithm';
import { Layout } from './layout';
import { Widget } from './widget';
/**
 * A concrete layout implementation which holds a single widget.
 *
 * #### Notes
 * This class is useful for creating simple container widgets which
 * hold a single child. The child should be positioned with CSS.
 */
export declare class SingletonLayout extends Layout {
    /**
     * Dispose of the resources held by the layout.
     */
    dispose(): void;
    /**
     * Get the child widget for the layout.
     */
    /**
    * Set the child widget for the layout.
    *
    * #### Notes
    * Setting the child widget will cause the old child widget to be
    * automatically disposed. If that is not desired, set the parent
    * of the old child to `null` before assigning a new child.
    */
    widget: Widget | null;
    /**
     * Create an iterator over the widgets in the layout.
     *
     * @returns A new iterator over the widgets in the layout.
     */
    iter(): IIterator<Widget>;
    /**
     * Remove a widget from the layout.
     *
     * @param widget - The widget to remove from the layout.
     *
     * #### Notes
     * A widget is automatically removed from the layout when its `parent`
     * is set to `null`. This method should only be invoked directly when
     * removing a widget from a layout which has yet to be installed on a
     * parent widget.
     *
     * This method does *not* modify the widget's `parent`.
     */
    removeWidget(widget: Widget): void;
    /**
     * Perform layout initialization which requires the parent widget.
     */
    protected init(): void;
    /**
     * Attach a widget to the parent's DOM node.
     *
     * @param index - The current index of the widget in the layout.
     *
     * @param widget - The widget to attach to the parent.
     *
     * #### Notes
     * This method is called automatically by the single layout at the
     * appropriate time. It should not be called directly by user code.
     *
     * The default implementation adds the widgets's node to the parent's
     * node at the proper location, and sends the appropriate attach
     * messages to the widget if the parent is attached to the DOM.
     *
     * Subclasses may reimplement this method to control how the widget's
     * node is added to the parent's node.
     */
    protected attachWidget(widget: Widget): void;
    /**
     * Detach a widget from the parent's DOM node.
     *
     * @param widget - The widget to detach from the parent.
     *
     * #### Notes
     * This method is called automatically by the single layout at the
     * appropriate time. It should not be called directly by user code.
     *
     * The default implementation removes the widget's node from the
     * parent's node, and sends the appropriate detach messages to the
     * widget if the parent is attached to the DOM.
     *
     * Subclasses may reimplement this method to control how the widget's
     * node is removed from the parent's node.
     */
    protected detachWidget(widget: Widget): void;
    private _widget;
}
