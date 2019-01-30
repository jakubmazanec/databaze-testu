import isFunction from './isFunction';
let trueFn = () => true;
let streamsToUpdate = [];
let inStream;
let streamOrder = [];
let nextStreamOrderIndex = -1;
let isFlushing = false;
export default class Stream {
    /**
     * Creates a stream, with initial value of `value`.
     *
     * @param {?V} value
     * @returns {Stream}
     */
    constructor(value) {
        this.listeners = [];
        this.dependencies = [];
        this.values = [];
        this.isQueued = false;
        this.areDependenciesMet = false;
        this.changedDependencies = [];
        this.shouldUpdate = false;
        this.hasValue = false;
        this.endStream = undefined;
        this.isEndStream = false;
        this.fn = undefined;
        /**
         * Pushes `value` to the stream. If `value` is a `Promise` instance, it will be resolved first.
         * Method is always bound to the stream instance.
         *
         * @param {V | Promise<V>} value
         * @returns {this}
         */
        this.push = value => {
            if (value !== undefined && value !== null && isFunction(value.then)) {
                value.then(this.push);
                return this;
            }
            this.value = value;
            // this.hasValue = true;
            if (inStream === undefined) {
                this.hasValue = true;
                isFlushing = true;
                this.updateDependencies();
                if (streamsToUpdate.length > 0) {
                    Stream.flushUpdate();
                } else {
                    isFlushing = false;
                }
            } else if (inStream === this) {
                this.hasValue = true;
                for (let i = 0; i < this.listeners.length; ++i) {
                    if (this.listeners[i].endStream === this) {
                        this.listeners[i].detachDependencies();
                        this.listeners[i].endStream.detachDependencies();
                    } else {
                        this.listeners[i].changedDependencies.push(this);
                        this.listeners[i].shouldUpdate = true;
                    }
                }
            } else {
                this.values.push(value);
                streamsToUpdate.push(this);
            }
            return this;
        };
        if (value === trueFn) {
            this.fn = value;
            this.isEndStream = true;
            this.endStream = undefined;
        } else {
            this.endStream = new Stream(trueFn);
            this.endStream.listeners.push(this);
            if (arguments.length > 0 && typeof value !== 'undefined') {
                this.push(value);
            }
        }
        this.push = this.push.bind(this);
    }
    static flushUpdate() {
        isFlushing = true;
        while (streamsToUpdate.length > 0) {
            let stream = streamsToUpdate.shift();
            // if (stream) {
            // 	if (stream.values.length > 0) {
            // 		stream.value = stream.values.shift();
            // 	}
            // 	stream.updateDependencies();
            // }
            if (stream) {
                if (stream.values.length > 0) {
                    stream.value = stream.values.shift();
                    stream.hasValue = true;
                }
                if (!stream.hasValue) {
                    stream.updateStream();
                } else {
                    stream.updateDependencies();
                }
            }
        }
        isFlushing = false;
    }
    updateStream() {
        if (this.areDependenciesMet !== true && !this.dependencies.every(stream => stream.hasValue) || this.endStream !== undefined && this.endStream.value === true) {
            return this;
        }
        if (inStream !== undefined) {
            streamsToUpdate.push(this);
            return this;
        }
        inStream = this;
        let newValue;
        if (this.fn) {
            newValue = this.fn(this, this.changedDependencies, ...this.dependencies);
        }
        if (newValue !== undefined && newValue !== null && isFunction(newValue.then)) {
            newValue.then(result => {
                if (result !== undefined) {
                    this.push(result);
                }
            });
        } else if (newValue !== undefined) {
            this.push(newValue);
        }
        inStream = undefined;
        this.changedDependencies = [];
        this.shouldUpdate = false;
        if (isFlushing === false) {
            Stream.flushUpdate();
        }
        return this;
    }
    updateDependencies() {
        for (let i = 0; i < this.listeners.length; ++i) {
            if (this.listeners[i].endStream === this) {
                this.listeners[i].detachDependencies();
                if (this.listeners[i].endStream) {
                    this.listeners[i].endStream.detachDependencies();
                }
            } else {
                this.listeners[i].changedDependencies.push(this);
                this.listeners[i].shouldUpdate = true;
                this.listeners[i].findDependencies();
            }
        }
        for (; nextStreamOrderIndex >= 0; --nextStreamOrderIndex) {
            if (streamOrder[nextStreamOrderIndex].shouldUpdate === true) {
                streamOrder[nextStreamOrderIndex].updateStream();
            }
            streamOrder[nextStreamOrderIndex].isQueued = false;
        }
    }
    findDependencies() {
        if (this.isQueued === false) {
            this.isQueued = true;
            for (let i = 0; i < this.listeners.length; ++i) {
                this.listeners[i].findDependencies();
            }
            streamOrder[++nextStreamOrderIndex] = this;
        }
    }
    detachDependencies() {
        for (let i = 0; i < this.dependencies.length; ++i) {
            this.dependencies[i].listeners[this.dependencies[i].listeners.indexOf(this)] = this.dependencies[i].listeners[this.dependencies[i].listeners.length - 1];
            this.dependencies[i].listeners.length--;
        }
        this.dependencies.length = 0;
    }
    /**
     * Returns current value of stream.
     *
     * @returns {*}
     */
    get() {
        return this.value;
    }
    /**
     * Ends the stream.
     *
     * @returns {this}
     */
    end() {
        if (this.endStream) {
            this.endStream.push(true);
        }
        return this;
    }
    /**
     * Returns string representation of stream.
     *
     * @returns {string}
     */
    toString() {
        return 'stream(' + this.value + ')';
    }
    combine(...streams) {
        let i = 0;
        let dependencies;
        let dependenciesEndStreams;
        this.detachDependencies();
        if (this.endStream) {
            this.endStream.detachDependencies();
        }
        dependencies = [];
        dependenciesEndStreams = [];
        if (isFunction(streams[i])) {
            this.fn = streams[i];
            i = 1;
        }
        for (; i < streams.length; ++i) {
            if (streams[i] !== undefined) {
                dependencies.push(streams[i]);
                if (streams[i].endStream) {
                    dependenciesEndStreams.push(streams[i].endStream);
                }
            }
        }
        if (dependencies.length) {
            this.dependencies = dependencies;
            this.areDependenciesMet = false;
            this.changedDependencies = [];
            this.shouldUpdate = false;
            for (let j = 0; j < dependencies.length; j++) {
                dependencies[j].listeners.push(this);
            }
            if (this.endStream) {
                this.endStream.listeners.push(this);
            }
            for (let j = 0; j < dependenciesEndStreams.length; j++) {
                dependenciesEndStreams[j].listeners.push(this.endStream);
            }
            if (this.endStream) {
                this.endStream.dependencies = dependenciesEndStreams;
            }
            this.updateStream();
        }
        return this;
    }
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
    static combine(fn, ...streams) {
        let newStream = new Stream();
        newStream.combine(fn, ...streams);
        return newStream;
    }
    /**
     * Immediately calls stream's body function, even if all dependencies don't have values yet.
     *
     * @returns {this}
     */
    immediate() {
        if (!this.areDependenciesMet) {
            this.areDependenciesMet = true;
            this.updateStream();
        }
        return this;
    }
    /**
     * Creates new stream consisting of values returned by the function `fn` called with values from `stream`.
     *
     * @param {Function} fn
     * @param {Stream} stream
     * @returns {Stream}
     */
    static map(fn, stream) {
        return Stream.combine((self, changed, streamDependency) => {
            self.push(fn(streamDependency.value));
        }, stream);
    }
    /**
     * Creates new stream consisting of values returned by the function `fn` called with values from stream instance.
     *
     * @param {Function} fn
     * @returns {Stream}
     */
    map(fn) {
        return Stream.map(fn, this);
    }
    /**
     * Returns `true` if `value` is an instance of `Stream`.
     *
     * @param {*} value
     * @returns {boolean}
     */
    static isStream(value) {
        return value instanceof Stream;
    }
    /**
     * Changes end stream.
     *
     * @param {Stream}
     * @returns {this}
     */
    endsOn(endStream) {
        if (this.endStream) {
            this.endStream.detachDependencies();
            endStream.listeners.push(this.endStream);
            this.endStream.dependencies.push(endStream);
        }
        return this;
    }
    /**
     * Similar to `map`, but the returned stream is empty and is not updated.
     *
     * @param {Function} fn
     * @param {Stream} stream
     * @returns {Stream}
     */
    static on(fn, stream) {
        return Stream.combine((self, changed, streamDependency) => {
            fn(streamDependency.value);
        }, stream);
    }
    /**
     * Similar to `map`, but the returned stream is empty and is not updated.
     *
     * @param {Function} fn
     * @returns {Stream}
     */
    on(fn) {
        return Stream.on(fn, this);
    }
    /**
     * Similar to `on`, but the `fn` isn't called if `stream` already has value; only values pushed to `stream` after the `subscribe` was called are relevant.
     *
     * @param {Function} fn
     * @param {Stream} stream
     * @returns {Stream}
     */
    static subscribe(fn, stream) {
        // return (() => {
        let hasRun = false;
        return stream.hasValue ? Stream.combine((self, changed, dependency) => {
            // console.log('Stream debug combine...', stream.name, hasRun);
            if (hasRun) {
                fn(dependency.value);
            }
            hasRun = true;
        }, stream) : Stream.combine((self, changed, dependency) => {
            // console.log('Stream debug combine 2...', stream.name);
            fn(dependency.value);
        }, stream);
        // })();
    }
    /**
     * Similar to `on`, but the `fn` isn't called if `stream` already has value; only values pushed to `stream` after the `subscribe` was called are relevant.
     *
     * @param {Function} fn
     * @returns {Stream}
     */
    subscribe(fn) {
        return Stream.subscribe(fn, this);
    }
    /**
     * Creates new stream consisting of values from both `stream1` and `stream2`.
     *
     * @param {Stream} stream1
     * @param {Stream} stream2
     * @returns {Stream}
     */
    static merge(stream1, stream2) {
        let newStream = Stream.combine((self, changed, dependencyStream1, dependencyStream2) => {
            if (changed[0]) {
                self.push(changed[0].get());
            } else if (dependencyStream1.hasValue) {
                self.push(dependencyStream1.value);
            } else if (dependencyStream2.hasValue) {
                self.push(dependencyStream2.value);
            }
        }, stream1, stream2).immediate();
        let endStream = Stream.combine(trueFn, stream1.endStream, stream2.endStream);
        newStream.endsOn(endStream);
        return newStream;
    }
    /**
     * Creates new stream consisting of values which are results of applying function from stream instance to the values of `stream`.
     *
     * @param {Stream} stream
     * @returns {Stream}
     */
    ap(stream) {
        return Stream.combine((self, changed, dependency1) => {
            if (dependency1.value) {
                self.push(dependency1.value(stream.value));
            }
        }, this, stream);
    }
    /**
     * Creates a stream, with initial value of `value`.
     *
     * @param {?*} value
     * @returns {Stream}
     */
    static of(value) {
        return new Stream(value);
    }
}