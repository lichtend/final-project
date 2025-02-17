import { CommandRegistry } from '@phosphor/commands';
import { Token } from '@phosphor/coreutils';
import { ContextMenu, Menu, Widget } from '@phosphor/widgets';
/**
 * A user-defined application plugin.
 *
 * #### Notes
 * Plugins are the foundation for building an extensible application.
 *
 * Plugins consume and provide "services", which are nothing more than
 * concrete implementations of interfaces and/or abstract types.
 *
 * Unlike regular imports and exports, which tie the service consumer
 * to a particular implementation of the service, plugins decouple the
 * service producer from the service consumer, allowing an application
 * to be easily customized by third parties in a type-safe fashion.
 */
export interface IPlugin<T, U> {
    /**
     * The human readable id of the plugin.
     *
     * #### Notes
     * This must be unique within an application.
     */
    id: string;
    /**
     * Whether the plugin should be activated on application start.
     *
     * #### Notes
     * The default is `false`.
     */
    autoStart?: boolean;
    /**
     * The types of required services for the plugin, if any.
     *
     * #### Notes
     * These tokens correspond to the services that are required by
     * the plugin for correct operation.
     *
     * When the plugin is activated, a concrete instance of each type
     * will be passed to the `activate()` function, in the order they
     * are specified in the `requires` array.
     */
    requires?: Token<any>[];
    /**
     * The types of optional services for the plugin, if any.
     *
     * #### Notes
     * These tokens correspond to the services that can be used by the
     * plugin if available, but are not necessarily required.
     *
     * The optional services will be passed to the `activate()` function
     * following all required services. If an optional service cannot be
     * resolved, `null` will be passed in its place.
     */
    optional?: Token<any>[];
    /**
     * The type of service provided by the plugin, if any.
     *
     * #### Notes
     * This token corresponds to the service exported by the plugin.
     *
     * When the plugin is activated, the return value of `activate()`
     * is used as the concrete instance of the type.
     */
    provides?: Token<U>;
    /**
     * A function invoked to activate the plugin.
     *
     * @param app - The application which owns the plugin.
     *
     * @param args - The services specified by the `requires` property.
     *
     * @returns The provided service, or a promise to the service.
     *
     * #### Notes
     * This function will be called whenever the plugin is manually
     * activated, or when another plugin being activated requires
     * the service it provides.
     *
     * This function will not be called unless all of its required
     * services can be fulfilled.
     */
    activate: (app: T, ...args: any[]) => U | Promise<U>;
}
/**
 * A class for creating pluggable applications.
 *
 * #### Notes
 * The `Application` class is useful when creating large, complex
 * UI applications with the ability to be safely extended by third
 * party code via plugins.
 */
export declare class Application<T extends Widget> {
    /**
     * Construct a new application.
     *
     * @param options - The options for creating the application.
     */
    constructor(options: Application.IOptions<T>);
    /**
     * The application command registry.
     */
    readonly commands: CommandRegistry;
    /**
     * The application context menu.
     */
    readonly contextMenu: ContextMenu;
    /**
     * The application shell widget.
     *
     * #### Notes
     * The shell widget is the root "container" widget for the entire
     * application. It will typically expose an API which allows the
     * application plugins to insert content in a variety of places.
     */
    readonly shell: T;
    /**
     * A promise which resolves after the application has started.
     *
     * #### Notes
     * This promise will resolve after the `start()` method is called,
     * when all the bootstrapping and shell mounting work is complete.
     */
    readonly started: Promise<void>;
    /**
     * Test whether a plugin is registered with the application.
     *
     * @param id - The id of the plugin of interest.
     *
     * @returns `true` if the plugin is registered, `false` otherwise.
     */
    hasPlugin(id: string): boolean;
    /**
     * List the IDs of the plugins registered with the application.
     *
     * @returns A new array of the registered plugin IDs.
     */
    listPlugins(): string[];
    /**
     * Register a plugin with the application.
     *
     * @param plugin - The plugin to register.
     *
     * #### Notes
     * An error will be thrown if a plugin with the same id is already
     * registered, or if the plugin has a circular dependency.
     *
     * If the plugin provides a service which has already been provided
     * by another plugin, the new service will override the old service.
     */
    registerPlugin(plugin: IPlugin<this, any>): void;
    /**
     * Register multiple plugins with the application.
     *
     * @param plugins - The plugins to register.
     *
     * #### Notes
     * This calls `registerPlugin()` for each of the given plugins.
     */
    registerPlugins(plugins: IPlugin<this, any>[]): void;
    /**
     * Activate the plugin with the given id.
     *
     * @param id - The ID of the plugin of interest.
     *
     * @returns A promise which resolves when the plugin is activated
     *   or rejects with an error if it cannot be activated.
     */
    activatePlugin(id: string): Promise<void>;
    /**
     * Resolve a required service of a given type.
     *
     * @param token - The token for the service type of interest.
     *
     * @returns A promise which resolves to an instance of the requested
     *   service, or rejects with an error if it cannot be resolved.
     *
     * #### Notes
     * Services are singletons. The same instance will be returned each
     * time a given service token is resolved.
     *
     * If the plugin which provides the service has not been activated,
     * resolving the service will automatically activate the plugin.
     *
     * User code will not typically call this method directly. Instead,
     * the required services for the user's plugins will be resolved
     * automatically when the plugin is activated.
     */
    resolveRequiredService<U>(token: Token<U>): Promise<U>;
    /**
     * Resolve an optional service of a given type.
     *
     * @param token - The token for the service type of interest.
     *
     * @returns A promise which resolves to an instance of the requested
     *   service, or `null` if it cannot be resolved.
     *
     * #### Notes
     * Services are singletons. The same instance will be returned each
     * time a given service token is resolved.
     *
     * If the plugin which provides the service has not been activated,
     * resolving the service will automatically activate the plugin.
     *
     * User code will not typically call this method directly. Instead,
     * the optional services for the user's plugins will be resolved
     * automatically when the plugin is activated.
     */
    resolveOptionalService<U>(token: Token<U>): Promise<U | null>;
    /**
     * Start the application.
     *
     * @param options - The options for starting the application.
     *
     * @returns A promise which resolves when all bootstrapping work
     *   is complete and the shell is mounted to the DOM.
     *
     * #### Notes
     * This should be called once by the application creator after all
     * initial plugins have been registered.
     *
     * If a plugin fails to the load, the error will be logged and the
     * other valid plugins will continue to be loaded.
     *
     * Bootstrapping the application consists of the following steps:
     * 1. Activate the startup plugins
     * 2. Wait for those plugins to activate
     * 3. Attach the shell widget to the DOM
     * 4. Add the application event listeners
     */
    start(options?: Application.IStartOptions): Promise<void>;
    /**
     * Handle the DOM events for the application.
     *
     * @param event - The DOM event sent to the application.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events registered for the application. It
     * should not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Attach the application shell to the DOM.
     *
     * @param id - The id of the host node for the shell, or `''`.
     *
     * #### Notes
     * If the id is not provided, the document body will be the host.
     *
     * A subclass may reimplement this method as needed.
     */
    protected attachShell(id: string): void;
    /**
     * Add the application event listeners.
     *
     * #### Notes
     * The default implementation of this method adds listeners for
     * `'keydown'` and `'resize'` events.
     *
     * A subclass may reimplement this method as needed.
     */
    protected addEventListeners(): void;
    /**
     * A method invoked on a document `'keydown'` event.
     *
     * #### Notes
     * The default implementation of this method invokes the key down
     * processing method of the application command registry.
     *
     * A subclass may reimplement this method as needed.
     */
    protected evtKeydown(event: KeyboardEvent): void;
    /**
     * A method invoked on a document `'contextmenu'` event.
     *
     * #### Notes
     * The default implementation of this method opens the application
     * `contextMenu` at the current mouse position.
     *
     * If the application context menu has no matching content *or* if
     * the shift key is pressed, the default browser context menu will
     * be opened instead.
     *
     * A subclass may reimplement this method as needed.
     */
    protected evtContextMenu(event: MouseEvent): void;
    /**
     * A method invoked on a window `'resize'` event.
     *
     * #### Notes
     * The default implementation of this method updates the shell.
     *
     * A subclass may reimplement this method as needed.
     */
    protected evtResize(event: Event): void;
    private _started;
    private _pluginMap;
    private _serviceMap;
    private _delegate;
}
/**
 * The namespace for the `Application` class statics.
 */
export declare namespace Application {
    /**
     * An options object for creating an application.
     */
    interface IOptions<T extends Widget> {
        /**
         * The shell widget to use for the application.
         *
         * This should be a newly created and initialized widget.
         *
         * The application will attach the widget to the DOM.
         */
        shell: T;
        /**
         * A custom renderer for the context menu.
         */
        contextMenuRenderer?: Menu.IRenderer;
    }
    /**
     * An options object for application startup.
     */
    interface IStartOptions {
        /**
         * The ID of the DOM node to host the application shell.
         *
         * #### Notes
         * If this is not provided, the document body will be the host.
         */
        hostID?: string;
        /**
         * The plugins to activate on startup.
         *
         * #### Notes
         * These will be *in addition* to any `autoStart` plugins.
         */
        startPlugins?: string[];
        /**
         * The plugins to **not** activate on startup.
         *
         * #### Notes
         * This will override `startPlugins` and any `autoStart` plugins.
         */
        ignorePlugins?: string[];
    }
}
