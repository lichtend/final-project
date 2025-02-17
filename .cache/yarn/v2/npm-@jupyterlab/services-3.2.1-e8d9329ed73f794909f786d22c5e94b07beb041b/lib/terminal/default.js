"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const algorithm_1 = require("@phosphor/algorithm");
const signaling_1 = require("@phosphor/signaling");
const __1 = require("..");
const terminal_1 = require("./terminal");
/**
 * The url for the terminal service.
 */
const TERMINAL_SERVICE_URL = 'api/terminals';
/**
 * An implementation of a terminal interface.
 */
class DefaultTerminalSession {
    /**
     * Construct a new terminal session.
     */
    constructor(name, options = {}) {
        this._isDisposed = false;
        this._isReady = false;
        this._messageReceived = new signaling_1.Signal(this);
        this._terminated = new signaling_1.Signal(this);
        this._ws = null;
        this._noOp = () => {
            /* no-op */
        };
        this._reconnectLimit = 7;
        this._reconnectAttempt = 0;
        this._name = name;
        this.serverSettings =
            options.serverSettings || __1.ServerConnection.makeSettings();
        this._readyPromise = this._initializeSocket();
    }
    /**
     * A signal emitted when the session is shut down.
     */
    get terminated() {
        return this._terminated;
    }
    /**
     * A signal emitted when a message is received from the server.
     */
    get messageReceived() {
        return this._messageReceived;
    }
    /**
     * Get the name of the terminal session.
     */
    get name() {
        return this._name;
    }
    /**
     * Get the model for the terminal session.
     */
    get model() {
        return { name: this._name };
    }
    /**
     * Test whether the session is ready.
     */
    get isReady() {
        return this._isReady;
    }
    /**
     * A promise that fulfills when the session is ready.
     */
    get ready() {
        return this._readyPromise;
    }
    /**
     * Test whether the session is disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources held by the session.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this.terminated.emit(undefined);
        this._isDisposed = true;
        if (this._ws) {
            this._ws.close();
            this._ws = null;
        }
        delete Private.running[this._url];
        signaling_1.Signal.clearData(this);
    }
    /**
     * Send a message to the terminal session.
     */
    send(message) {
        if (this._isDisposed || !message.content) {
            return;
        }
        const msg = [message.type, ...message.content];
        const socket = this._ws;
        const value = JSON.stringify(msg);
        if (this._isReady && socket) {
            socket.send(value);
            return;
        }
        this.ready.then(() => {
            const socket = this._ws;
            if (socket) {
                socket.send(value);
            }
        });
    }
    /**
     * Reconnect to the terminal.
     *
     * @returns A promise that resolves when the terminal has reconnected.
     */
    reconnect() {
        this._reconnectAttempt = 0;
        this._readyPromise = this._initializeSocket();
        return this._readyPromise;
    }
    /**
     * Shut down the terminal session.
     */
    shutdown() {
        const { name, serverSettings } = this;
        return DefaultTerminalSession.shutdown(name, serverSettings);
    }
    /**
     * Clone the current session object.
     */
    clone() {
        const { name, serverSettings } = this;
        return new DefaultTerminalSession(name, { serverSettings });
    }
    /**
     * Connect to the websocket.
     */
    _initializeSocket() {
        const name = this._name;
        let socket = this._ws;
        if (socket) {
            // Clear the websocket event handlers and the socket itself.
            socket.onopen = this._noOp;
            socket.onclose = this._noOp;
            socket.onerror = this._noOp;
            socket.onmessage = this._noOp;
            socket.close();
            this._ws = null;
        }
        this._isReady = false;
        return new Promise((resolve, reject) => {
            const settings = this.serverSettings;
            const token = this.serverSettings.token;
            this._url = Private.getTermUrl(settings.baseUrl, this._name);
            Private.running[this._url] = this;
            let wsUrl = coreutils_1.URLExt.join(settings.wsUrl, `terminals/websocket/${name}`);
            if (token) {
                wsUrl = wsUrl + `?token=${encodeURIComponent(token)}`;
            }
            socket = this._ws = new settings.WebSocket(wsUrl);
            socket.onmessage = (event) => {
                if (this._isDisposed) {
                    return;
                }
                const data = JSON.parse(event.data);
                if (this._reconnectAttempt > 0) {
                    // After reconnection, ignore all messages until a 'setup' message.
                    if (data[0] === 'setup') {
                        this._reconnectAttempt = 0;
                    }
                    return;
                }
                this._messageReceived.emit({
                    type: data[0],
                    content: data.slice(1)
                });
            };
            socket.onopen = (event) => {
                if (!this._isDisposed) {
                    this._isReady = true;
                    resolve(undefined);
                }
            };
            socket.onerror = (event) => {
                if (!this._isDisposed) {
                    reject(event);
                }
            };
            socket.onclose = (event) => {
                console.warn(`Terminal websocket closed: ${event.code}`);
                this._reconnectSocket();
            };
        });
    }
    _reconnectSocket() {
        if (this._isDisposed || !this._ws) {
            return;
        }
        const attempt = this._reconnectAttempt;
        const limit = this._reconnectLimit;
        if (attempt >= limit) {
            console.log(`Terminal reconnect aborted: ${attempt} attempts`);
            return;
        }
        const timeout = Math.pow(2, attempt);
        console.log(`Terminal will attempt to reconnect in ${timeout}s`);
        this._isReady = false;
        this._reconnectAttempt += 1;
        setTimeout(() => {
            if (this.isDisposed) {
                return;
            }
            this._initializeSocket()
                .then(() => {
                console.log('Terminal reconnected');
            })
                .catch(reason => {
                console.warn(`Terminal reconnect failed`, reason);
            });
        }, 1e3 * timeout);
    }
}
exports.DefaultTerminalSession = DefaultTerminalSession;
/**
 * The static namespace for `DefaultTerminalSession`.
 */
(function (DefaultTerminalSession) {
    /**
     * Whether the terminal service is available.
     */
    function isAvailable() {
        let available = String(coreutils_1.PageConfig.getOption('terminalsAvailable'));
        return available.toLowerCase() === 'true';
    }
    DefaultTerminalSession.isAvailable = isAvailable;
    /**
     * Start a new terminal session.
     *
     * @param options - The session options to use.
     *
     * @returns A promise that resolves with the session instance.
     */
    function startNew(options = {}) {
        if (!terminal_1.TerminalSession.isAvailable()) {
            throw Private.unavailableMsg;
        }
        let serverSettings = options.serverSettings || __1.ServerConnection.makeSettings();
        let url = Private.getServiceUrl(serverSettings.baseUrl);
        let init = { method: 'POST' };
        return __1.ServerConnection.makeRequest(url, init, serverSettings)
            .then(response => {
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then((data) => {
            let name = data.name;
            return new DefaultTerminalSession(name, Object.assign({}, options, { serverSettings }));
        });
    }
    DefaultTerminalSession.startNew = startNew;
    /*
     * Connect to a running session.
     *
     * @param name - The name of the target session.
     *
     * @param options - The session options to use.
     *
     * @returns A promise that resolves with the new session instance.
     *
     * #### Notes
     * If the session was already started via `startNew`, the existing
     * session object is used as the fulfillment value.
     *
     * Otherwise, if `options` are given, we resolve the promise after
     * confirming that the session exists on the server.
     *
     * If the session does not exist on the server, the promise is rejected.
     */
    function connectTo(name, options = {}) {
        if (!terminal_1.TerminalSession.isAvailable()) {
            return Promise.reject(Private.unavailableMsg);
        }
        let serverSettings = options.serverSettings || __1.ServerConnection.makeSettings();
        let url = Private.getTermUrl(serverSettings.baseUrl, name);
        if (url in Private.running) {
            return Promise.resolve(Private.running[url].clone());
        }
        return listRunning(serverSettings).then(models => {
            let index = algorithm_1.ArrayExt.findFirstIndex(models, model => {
                return model.name === name;
            });
            if (index !== -1) {
                let session = new DefaultTerminalSession(name, Object.assign({}, options, { serverSettings }));
                return Promise.resolve(session);
            }
            return Promise.reject('Could not find session');
        });
    }
    DefaultTerminalSession.connectTo = connectTo;
    /**
     * List the running terminal sessions.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves with the list of running session models.
     */
    function listRunning(settings) {
        if (!terminal_1.TerminalSession.isAvailable()) {
            return Promise.reject(Private.unavailableMsg);
        }
        settings = settings || __1.ServerConnection.makeSettings();
        let url = Private.getServiceUrl(settings.baseUrl);
        return __1.ServerConnection.makeRequest(url, {}, settings)
            .then(response => {
            if (response.status !== 200) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            return response.json();
        })
            .then((data) => {
            if (!Array.isArray(data)) {
                throw new Error('Invalid terminal data');
            }
            // Update the local data store.
            let urls = algorithm_1.toArray(algorithm_1.map(data, item => {
                return coreutils_1.URLExt.join(url, item.name);
            }));
            algorithm_1.each(Object.keys(Private.running), runningUrl => {
                if (urls.indexOf(runningUrl) === -1) {
                    let session = Private.running[runningUrl];
                    session.dispose();
                }
            });
            return data;
        });
    }
    DefaultTerminalSession.listRunning = listRunning;
    /**
     * Shut down a terminal session by name.
     *
     * @param name - The name of the target session.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves when the session is shut down.
     */
    function shutdown(name, settings) {
        if (!terminal_1.TerminalSession.isAvailable()) {
            return Promise.reject(Private.unavailableMsg);
        }
        settings = settings || __1.ServerConnection.makeSettings();
        let url = Private.getTermUrl(settings.baseUrl, name);
        let init = { method: 'DELETE' };
        return __1.ServerConnection.makeRequest(url, init, settings).then(response => {
            if (response.status === 404) {
                return response.json().then(data => {
                    console.warn(data['message']);
                    Private.killTerminal(url);
                });
            }
            if (response.status !== 204) {
                throw new __1.ServerConnection.ResponseError(response);
            }
            Private.killTerminal(url);
        });
    }
    DefaultTerminalSession.shutdown = shutdown;
    /**
     * Shut down all terminal sessions.
     *
     * @param settings - The server settings to use.
     *
     * @returns A promise that resolves when all the sessions are shut down.
     */
    function shutdownAll(settings) {
        settings = settings || __1.ServerConnection.makeSettings();
        return listRunning(settings).then(running => {
            algorithm_1.each(running, s => {
                shutdown(s.name, settings);
            });
        });
    }
    DefaultTerminalSession.shutdownAll = shutdownAll;
})(DefaultTerminalSession = exports.DefaultTerminalSession || (exports.DefaultTerminalSession = {}));
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * A mapping of running terminals by url.
     */
    Private.running = Object.create(null);
    /**
     * A promise returned for when terminals are unavailable.
     */
    Private.unavailableMsg = 'Terminals Unavailable';
    /**
     * Get the url for a terminal.
     */
    function getTermUrl(baseUrl, name) {
        return coreutils_1.URLExt.join(baseUrl, TERMINAL_SERVICE_URL, name);
    }
    Private.getTermUrl = getTermUrl;
    /**
     * Get the base url.
     */
    function getServiceUrl(baseUrl) {
        return coreutils_1.URLExt.join(baseUrl, TERMINAL_SERVICE_URL);
    }
    Private.getServiceUrl = getServiceUrl;
    /**
     * Kill a terminal by url.
     */
    function killTerminal(url) {
        // Update the local data store.
        if (Private.running[url]) {
            let session = Private.running[url];
            session.dispose();
        }
    }
    Private.killTerminal = killTerminal;
})(Private || (Private = {}));
