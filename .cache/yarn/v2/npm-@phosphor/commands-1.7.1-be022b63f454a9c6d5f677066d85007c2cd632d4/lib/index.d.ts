import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
/**
 * An object which manages a collection of commands.
 *
 * #### Notes
 * A command registry can be used to populate a variety of action-based
 * widgets, such as command palettes, menus, and toolbars.
 */
export declare class CommandRegistry {
    /**
     * Construct a new command registry.
     */
    constructor();
    /**
     * A signal emitted when a command has changed.
     *
     * #### Notes
     * This signal is useful for visual representations of commands which
     * need to refresh when the state of a relevant command has changed.
     */
    readonly commandChanged: ISignal<this, CommandRegistry.ICommandChangedArgs>;
    /**
     * A signal emitted when a command has executed.
     *
     * #### Notes
     * Care should be taken when consuming this signal. It is intended to
     * be used largely for debugging and logging purposes. It should not
     * be (ab)used for general purpose spying on command execution.
     */
    readonly commandExecuted: ISignal<this, CommandRegistry.ICommandExecutedArgs>;
    /**
     * A signal emitted when a key binding is changed.
     */
    readonly keyBindingChanged: ISignal<this, CommandRegistry.IKeyBindingChangedArgs>;
    /**
     * A read-only array of the key bindings in the registry.
     */
    readonly keyBindings: ReadonlyArray<CommandRegistry.IKeyBinding>;
    /**
     * List the ids of the registered commands.
     *
     * @returns A new array of the registered command ids.
     */
    listCommands(): string[];
    /**
     * Test whether a specific command is registered.
     *
     * @param id - The id of the command of interest.
     *
     * @returns `true` if the command is registered, `false` otherwise.
     */
    hasCommand(id: string): boolean;
    /**
     * Add a command to the registry.
     *
     * @param id - The unique id of the command.
     *
     * @param options - The options for the command.
     *
     * @returns A disposable which will remove the command.
     *
     * @throws An error if the given `id` is already registered.
     */
    addCommand(id: string, options: CommandRegistry.ICommandOptions): IDisposable;
    /**
     * Notify listeners that the state of a command has changed.
     *
     * @param id - The id of the command which has changed. If more than
     *   one command has changed, this argument should be omitted.
     *
     * @throws An error if the given `id` is not registered.
     *
     * #### Notes
     * This method should be called by the command author whenever the
     * application state changes such that the results of the command
     * metadata functions may have changed.
     *
     * This will cause the `commandChanged` signal to be emitted.
     */
    notifyCommandChanged(id?: string): void;
    /**
     * Get the display label for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The display label for the command, or an empty string
     *   if the command is not registered.
     */
    label(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the mnemonic index for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The mnemonic index for the command, or `-1` if the
     *   command is not registered.
     */
    mnemonic(id: string, args?: ReadonlyJSONObject): number;
    /**
     * @deprecated Use `iconClass()` instead.
     */
    icon(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the icon class for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The icon class for the command, or an empty string if
     *   the command is not registered.
     */
    iconClass(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the icon label for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The icon label for the command, or an empty string if
     *   the command is not registered.
     */
    iconLabel(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the short form caption for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The caption for the command, or an empty string if the
     *   command is not registered.
     */
    caption(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the usage help text for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The usage text for the command, or an empty string if
     *   the command is not registered.
     */
    usage(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the extra class name for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The class name for the command, or an empty string if
     *   the command is not registered.
     */
    className(id: string, args?: ReadonlyJSONObject): string;
    /**
     * Get the dataset for a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns The dataset for the command, or an empty dataset if
     *   the command is not registered.
     */
    dataset(id: string, args?: ReadonlyJSONObject): CommandRegistry.Dataset;
    /**
     * Test whether a specific command is enabled.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns A boolean indicating whether the command is enabled,
     *   or `false` if the command is not registered.
     */
    isEnabled(id: string, args?: ReadonlyJSONObject): boolean;
    /**
     * Test whether a specific command is toggled.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns A boolean indicating whether the command is toggled,
     *   or `false` if the command is not registered.
     */
    isToggled(id: string, args?: ReadonlyJSONObject): boolean;
    /**
     * Test whether a specific command is visible.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns A boolean indicating whether the command is visible,
     *   or `false` if the command is not registered.
     */
    isVisible(id: string, args?: ReadonlyJSONObject): boolean;
    /**
     * Execute a specific command.
     *
     * @param id - The id of the command of interest.
     *
     * @param args - The arguments for the command.
     *
     * @returns A promise which resolves with the result of the command.
     *
     * #### Notes
     * The promise will reject if the command throws an exception,
     * or if the command is not registered.
     */
    execute(id: string, args?: ReadonlyJSONObject): Promise<any>;
    /**
     * Add a key binding to the registry.
     *
     * @param options - The options for creating the key binding.
     *
     * @returns A disposable which removes the added key binding.
     *
     * #### Notes
     * If multiple key bindings are registered for the same sequence, the
     * binding with the highest selector specificity is executed first. A
     * tie is broken by using the most recently added key binding.
     *
     * Ambiguous key bindings are resolved with a timeout. As an example,
     * suppose two key bindings are registered: one with the key sequence
     * `['Ctrl D']`, and another with `['Ctrl D', 'Ctrl W']`. If the user
     * presses `Ctrl D`, the first binding cannot be immediately executed
     * since the user may intend to complete the chord with `Ctrl W`. For
     * such cases, a timer is used to allow the chord to be completed. If
     * the chord is not completed before the timeout, the first binding
     * is executed.
     */
    addKeyBinding(options: CommandRegistry.IKeyBindingOptions): IDisposable;
    /**
     * Process a `'keydown'` event and invoke a matching key binding.
     *
     * @param event - The event object for a `'keydown'` event.
     *
     * #### Notes
     * This should be called in response to a `'keydown'` event in order
     * to invoke the command for the best matching key binding.
     *
     * The registry **does not** install its own listener for `'keydown'`
     * events. This allows the application full control over the nodes
     * and phase for which the registry processes `'keydown'` events.
     */
    processKeydownEvent(event: KeyboardEvent): void;
    /**
     * Start or restart the pending timeout.
     */
    private _startTimer;
    /**
     * Clear the pending timeout.
     */
    private _clearTimer;
    /**
     * Replay the keydown events which were suppressed.
     */
    private _replayKeydownEvents;
    /**
     * Execute the command for the given key binding.
     *
     * If the command is missing or disabled, a warning will be logged.
     */
    private _executeKeyBinding;
    /**
     * Clear the internal pending state.
     */
    private _clearPendingState;
    /**
     * Handle the partial match timeout.
     */
    private _onPendingTimeout;
    private _timerID;
    private _replaying;
    private _keystrokes;
    private _keydownEvents;
    private _keyBindings;
    private _exactKeyMatch;
    private _commands;
    private _commandChanged;
    private _commandExecuted;
    private _keyBindingChanged;
}
/**
 * The namespace for the `CommandRegistry` class statics.
 */
export declare namespace CommandRegistry {
    /**
     * A type alias for a user-defined command function.
     */
    type CommandFunc<T> = (args: ReadonlyJSONObject) => T;
    /**
     * A type alias for a simple immutable string dataset.
     */
    type Dataset = {
        readonly [key: string]: string;
    };
    /**
     * An options object for creating a command.
     *
     * #### Notes
     * A command is an abstract representation of code to be executed along
     * with metadata for describing how the command should be displayed in
     * a visual representation.
     *
     * A command is a collection of functions, *not* methods. The command
     * registry will always invoke the command functions with a `thisArg`
     * which is `undefined`.
     */
    interface ICommandOptions {
        /**
         * The function to invoke when the command is executed.
         *
         * #### Notes
         * This should return the result of the command (if applicable) or
         * a promise which yields the result. The result is resolved as a
         * promise and that promise is returned to the code which executed
         * the command.
         *
         * This may be invoked even when `isEnabled` returns `false`.
         */
        execute: CommandFunc<any | Promise<any>>;
        /**
         * The label for the command.
         *
         * #### Notes
         * This can be a string literal, or a function which returns the
         * label based on the provided command arguments.
         *
         * The label is often used as the primary text for the command.
         *
         * The default value is an empty string.
         */
        label?: string | CommandFunc<string>;
        /**
         * The index of the mnemonic character in the command's label.
         *
         * #### Notes
         * This can be an index literal, or a function which returns the
         * mnemonic index based on the provided command arguments.
         *
         * The mnemonic character is often used by menus to provide easy
         * single-key keyboard access for triggering a menu item. It is
         * typically rendered as an underlined character in the label.
         *
         * The default value is `-1`.
         */
        mnemonic?: number | CommandFunc<number>;
        /**
         * @deprecated Use `iconClass` instead.
         */
        icon?: string | CommandFunc<string>;
        /**
         * The icon class for the command.
         *
         * #### Notes
         * This class name will be added to the icon node for the visual
         * representation of the command.
         *
         * Multiple class names can be separated with white space.
         *
         * This can be a string literal, or a function which returns the
         * icon based on the provided command arguments.
         *
         * The default value is an empty string.
         */
        iconClass?: string | CommandFunc<string>;
        /**
         * The icon label for the command.
         *
         * #### Notes
         * This label will be added as text to the icon node for the visual
         * representation of the command.
         *
         * This can be a string literal, or a function which returns the
         * label based on the provided command arguments.
         *
         * The default value is an empty string.
         */
        iconLabel?: string | CommandFunc<string>;
        /**
         * The caption for the command.
         *
         * #### Notes
         * This should be a simple one line description of the command. It
         * is used by some visual representations to show quick info about
         * the command.
         *
         * This can be a string literal, or a function which returns the
         * caption based on the provided command arguments.
         *
         * The default value is an empty string.
         */
        caption?: string | CommandFunc<string>;
        /**
         * The usage text for the command.
         *
         * #### Notes
         * This should be a full description of the command, which includes
         * information about the structure of the arguments and the type of
         * the return value. It is used by some visual representations when
         * displaying complete help info about the command.
         *
         * This can be a string literal, or a function which returns the
         * usage text based on the provided command arguments.
         *
         * The default value is an empty string.
         */
        usage?: string | CommandFunc<string>;
        /**
         * The general class name for the command.
         *
         * #### Notes
         * This class name will be added to the primary node for the visual
         * representation of the command.
         *
         * Multiple class names can be separated with white space.
         *
         * This can be a string literal, or a function which returns the
         * class name based on the provided command arguments.
         *
         * The default value is an empty string.
         */
        className?: string | CommandFunc<string>;
        /**
         * The dataset for the command.
         *
         * #### Notes
         * The dataset values will be added to the primary node for the
         * visual representation of the command.
         *
         * This can be a dataset object, or a function which returns the
         * dataset object based on the provided command arguments.
         *
         * The default value is an empty dataset.
         */
        dataset?: Dataset | CommandFunc<Dataset>;
        /**
         * A function which indicates whether the command is enabled.
         *
         * #### Notes
         * Visual representations may use this value to display a disabled
         * command as grayed-out or in some other non-interactive fashion.
         *
         * The default value is `() => true`.
         */
        isEnabled?: CommandFunc<boolean>;
        /**
         * A function which indicates whether the command is toggled.
         *
         * #### Notes
         * Visual representations may use this value to display a toggled
         * command in a different form, such as a check mark icon for a
         * menu item or a depressed state for a toggle button.
         *
         * The default value is `() => false`.
         */
        isToggled?: CommandFunc<boolean>;
        /**
         * A function which indicates whether the command is visible.
         *
         * #### Notes
         * Visual representations may use this value to hide or otherwise
         * not display a non-visible command.
         *
         * The default value is `() => true`.
         */
        isVisible?: CommandFunc<boolean>;
    }
    /**
     * An arguments object for the `commandChanged` signal.
     */
    interface ICommandChangedArgs {
        /**
         * The id of the associated command.
         *
         * This will be `undefined` when the type is `'many-changed'`.
         */
        readonly id: string | undefined;
        /**
         * Whether the command was added, removed, or changed.
         */
        readonly type: 'added' | 'removed' | 'changed' | 'many-changed';
    }
    /**
     * An arguments object for the `commandExecuted` signal.
     */
    interface ICommandExecutedArgs {
        /**
         * The id of the associated command.
         */
        readonly id: string;
        /**
         * The arguments object passed to the command.
         */
        readonly args: ReadonlyJSONObject;
        /**
         * The promise which resolves with the result of the command.
         */
        readonly result: Promise<any>;
    }
    /**
     * An options object for creating a key binding.
     */
    interface IKeyBindingOptions {
        /**
         * The default key sequence for the key binding.
         *
         * A key sequence is composed of one or more keystrokes, where each
         * keystroke is a combination of modifiers and a primary key.
         *
         * Most key sequences will contain a single keystroke. Key sequences
         * with multiple keystrokes are called "chords", and are useful for
         * implementing modal input (ala Vim).
         *
         * Each keystroke in the sequence should be of the form:
         *   `[<modifier 1> [<modifier 2> [<modifier N> ]]]<primary key>`
         *
         * The supported modifiers are: `Accel`, `Alt`, `Cmd`, `Ctrl`, and
         * `Shift`. The `Accel` modifier is translated to `Cmd` on Mac and
         * `Ctrl` on all other platforms. The `Cmd` modifier is ignored on
         * non-Mac platforms.
         *
         * Keystrokes are case sensitive.
         *
         * **Examples:** `['Accel C']`, `['Shift F11']`, `['D', 'D']`
         */
        keys: string[];
        /**
         * The CSS selector for the key binding.
         *
         * The key binding will only be invoked when the selector matches a
         * node on the propagation path of the keydown event. This allows
         * the key binding to be restricted to user-defined contexts.
         *
         * The selector must not contain commas.
         */
        selector: string;
        /**
         * The id of the command to execute when the binding is matched.
         */
        command: string;
        /**
         * The arguments for the command, if necessary.
         *
         * The default value is an empty object.
         */
        args?: ReadonlyJSONObject;
        /**
         * The key sequence to use when running on Windows.
         *
         * If provided, this will override `keys` on Windows platforms.
         */
        winKeys?: string[];
        /**
         * The key sequence to use when running on Mac.
         *
         * If provided, this will override `keys` on Mac platforms.
         */
        macKeys?: string[];
        /**
         * The key sequence to use when running on Linux.
         *
         * If provided, this will override `keys` on Linux platforms.
         */
        linuxKeys?: string[];
    }
    /**
     * An object which represents a key binding.
     *
     * #### Notes
     * A key binding is an immutable object created by a registry.
     */
    interface IKeyBinding {
        /**
         * The key sequence for the binding.
         */
        readonly keys: ReadonlyArray<string>;
        /**
         * The CSS selector for the binding.
         */
        readonly selector: string;
        /**
         * The command executed when the binding is matched.
         */
        readonly command: string;
        /**
         * The arguments for the command.
         */
        readonly args: ReadonlyJSONObject;
    }
    /**
     * An arguments object for the `keyBindingChanged` signal.
     */
    interface IKeyBindingChangedArgs {
        /**
         * The key binding which was changed.
         */
        readonly binding: IKeyBinding;
        /**
         * Whether the key binding was added or removed.
         */
        readonly type: 'added' | 'removed';
    }
    /**
     * An object which holds the results of parsing a keystroke.
     */
    interface IKeystrokeParts {
        /**
         * Whether `'Cmd'` appears in the keystroke.
         */
        cmd: boolean;
        /**
         * Whether `'Ctrl'` appears in the keystroke.
         */
        ctrl: boolean;
        /**
         * Whether `'Alt'` appears in the keystroke.
         */
        alt: boolean;
        /**
         * Whether `'Shift'` appears in the keystroke.
         */
        shift: boolean;
        /**
         * The primary key for the keystroke.
         */
        key: string;
    }
    /**
     * Parse a keystroke into its constituent components.
     *
     * @param keystroke - The keystroke of interest.
     *
     * @returns The parsed components of the keystroke.
     *
     * #### Notes
     * The keystroke should be of the form:
     *   `[<modifier 1> [<modifier 2> [<modifier N> ]]]<primary key>`
     *
     * The supported modifiers are: `Accel`, `Alt`, `Cmd`, `Ctrl`, and
     * `Shift`. The `Accel` modifier is translated to `Cmd` on Mac and
     * `Ctrl` on all other platforms.
     *
     * The parsing is tolerant and will not throw exceptions. Notably:
     *   - Duplicate modifiers are ignored.
     *   - Extra primary keys are ignored.
     *   - The order of modifiers and primary key is irrelevant.
     *   - The keystroke parts should be separated by whitespace.
     *   - The keystroke is case sensitive.
     */
    function parseKeystroke(keystroke: string): IKeystrokeParts;
    /**
     * Normalize a keystroke into a canonical representation.
     *
     * @param keystroke - The keystroke of interest.
     *
     * @returns The normalized representation of the keystroke.
     *
     * #### Notes
     * This normalizes the keystroke by removing duplicate modifiers and
     * extra primary keys, and assembling the parts in a canonical order.
     *
     * The `Cmd` modifier is ignored on non-Mac platforms.
     */
    function normalizeKeystroke(keystroke: string): string;
    /**
     * Format a keystroke for display on the local system.
     */
    function formatKeystroke(keystroke: string): string;
    /**
     * Create a normalized keystroke for a `'keydown'` event.
     *
     * @param event - The event object for a `'keydown'` event.
     *
     * @returns A normalized keystroke, or an empty string if the event
     *   does not represent a valid keystroke for the given layout.
     */
    function keystrokeForKeydownEvent(event: KeyboardEvent): string;
}
