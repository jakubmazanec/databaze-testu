export declare type ReturnTrueFunction = () => boolean;
export declare type StreamFunction<V> = (self: Stream<V>, changedDeps: Array<Stream<any>>, ...dependencies: Array<Stream<any>>) => V | Promise<V>;
export declare type MapStreamFunction = (value: any) => any;
export declare type OnStreamFunction = (value: any) => any;
export default class Stream<V> {
    private listeners;
    private dependencies;
    private values;
    value: V;
    private isQueued;
    private areDependenciesMet;
    private changedDependencies;
    private shouldUpdate;
    hasValue: boolean;
    endStream?: Stream<boolean>;
    isEndStream: boolean;
    fn?: StreamFunction<V>;
    name?: string;
    /**
     * Creates a stream, with initial value of `value`.
     *
     * @param {?V} value
     * @returns {Stream}
     */
    constructor(value?: V | Promise<V>);
    private static flushUpdate();
    private updateStream();
    private updateDependencies();
    private findDependencies();
    private detachDependencies();
    /**
     * Pushes `value` to the stream. If `value` is a `Promise` instance, it will be resolved first.
     * Method is always bound to the stream instance.
     *
     * @param {V | Promise<V>} value
     * @returns {this}
     */
    push: (value: V | Promise<V>) => this;
    /**
     * Returns current value of stream.
     *
     * @returns {*}
     */
    get(): any;
    /**
     * Ends the stream.
     *
     * @returns {this}
     */
    end(): this;
    /**
     * Returns string representation of stream.
     *
     * @returns {string}
     */
    toString(): string;
    /**
     * Sets up stream's dependencies. Only the last passed functino will be used as stream's function.
     * Stream's body function is called with following parameters: stream's dependencies, reference to the stream itself, and an array of changed dependencies.
     * This functon is only called when all dependencies have value. Returned value - anything but `undefined` - will trigger an update. To trigger on undefined, update directly with `push` method.
     *
     * @param {...(Function|Stream)}
     * @returns {this}
     *
     * @example
     * let stream1 = new ash.Stream();
     * let stream2 = new ash.Stream();
     * let stream3 = new ash.Stream();
     * let stream4 = new ash.Stream();
     *
     * stream3.combine((stream1Dependency, stream2Dependency, self, changed) => stream1Dependency.get() + stream2Dependency.get(), stream1, stream2);
     * stream4.combine((stream3Dependency, self, changed) => {
     * 	self.push(stream3Dependency.get() * 2);
     * }, stream3);
     *
     * stream1.push(2);
     * stream2.push(3);
     * stream3.get(); // -> 5
     * stream4.get(); // -> 10
     */
    combine(fn: StreamFunction<V>, ...streams: Array<any>): this;
    combine(...streams: Array<any>): this;
    /**
     * Creates new dependent stream.
     *
     * @param {...(Function|Stream)}
     * @returns {Stream}
     *
     * @example
     * let newStream = ash.combine((oldStreamDependency) => oldStreamDependency.get() * 2, oldStreamDependency);
     *
     * // same as
     * let newStream = new ash.Stream();
     *
     * newStream.combine((oldStreamDependency) => oldStreamDependency.get() * 2, oldStreamDependency);
     */
    static combine(fn: StreamFunction<any>, ...streams: Array<Stream<any>>): Stream<any>;
    /**
     * Immediately calls stream's body function, even if all dependencies don't have values yet.
     *
     * @returns {this}
     */
    immediate(): this;
    /**
     * Creates new stream consisting of values returned by the function `fn` called with values from `stream`.
     *
     * @param {Function} fn
     * @param {Stream} stream
     * @returns {Stream}
     */
    static map(fn: MapStreamFunction, stream: Stream<any>): Stream<any>;
    /**
     * Creates new stream consisting of values returned by the function `fn` called with values from stream instance.
     *
     * @param {Function} fn
     * @returns {Stream}
     */
    map(fn: MapStreamFunction): Stream<any>;
    /**
     * Returns `true` if `value` is an instance of `Stream`.
     *
     * @param {*} value
     * @returns {boolean}
     */
    static isStream(value: any): boolean;
    /**
     * Changes end stream.
     *
     * @param {Stream}
     * @returns {this}
     */
    endsOn(endStream: this): this;
    /**
     * Similar to `map`, but the returned stream is empty and is not updated.
     *
     * @param {Function} fn
     * @param {Stream} stream
     * @returns {Stream}
     */
    static on(fn: OnStreamFunction, stream: Stream<any>): Stream<any>;
    /**
     * Similar to `map`, but the returned stream is empty and is not updated.
     *
     * @param {Function} fn
     * @returns {Stream}
     */
    on(fn: OnStreamFunction): Stream<any>;
    /**
     * Similar to `on`, but the `fn` isn't called if `stream` already has value; only values pushed to `stream` after the `subscribe` was called are relevant.
     *
     * @param {Function} fn
     * @param {Stream} stream
     * @returns {Stream}
     */
    static subscribe(fn: OnStreamFunction, stream: Stream<any>): Stream<any>;
    /**
     * Similar to `on`, but the `fn` isn't called if `stream` already has value; only values pushed to `stream` after the `subscribe` was called are relevant.
     *
     * @param {Function} fn
     * @returns {Stream}
     */
    subscribe(fn: OnStreamFunction): Stream<any>;
    /**
     * Creates new stream consisting of values from both `stream1` and `stream2`.
     *
     * @param {Stream} stream1
     * @param {Stream} stream2
     * @returns {Stream}
     */
    static merge(stream1: Stream<any>, stream2: Stream<any>): Stream<any>;
    /**
     * Creates new stream consisting of values which are results of applying function from stream instance to the values of `stream`.
     *
     * @param {Stream} stream
     * @returns {Stream}
     */
    ap(stream: Stream<any>): Stream<any>;
    /**
     * Creates a stream, with initial value of `value`.
     *
     * @param {?*} value
     * @returns {Stream}
     */
    static of(value: any): Stream<any>;
}
