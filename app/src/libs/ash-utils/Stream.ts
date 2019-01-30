import isFunction from './isFunction';


export type ReturnTrueFunction = () => boolean;

let trueFn: ReturnTrueFunction = () => true;
let streamsToUpdate: Array<Stream<any>> = [];
let inStream: Stream<any> | undefined;
let streamOrder: Array<Stream<any>> = [];
let nextStreamOrderIndex = -1;
let isFlushing = false;

export type StreamFunction<V> = (self: Stream<V>, changedDeps: Array<Stream<any>>, ...dependencies: Array<Stream<any>>) => V | Promise<V>;
export type MapStreamFunction = (value: any) => any;
export type OnStreamFunction = (value: any) => any;

export default class Stream<V> {
	private listeners: Array<Stream<any>> = [];
	private dependencies: Array<Stream<any>> = [];
	private values: Array<V> = [];
	value: V;
	private isQueued: boolean = false;
	private areDependenciesMet: boolean = false;
	private changedDependencies: Array<Stream<any>> = [];
	private shouldUpdate: boolean = false;

	hasValue: boolean = false;
	endStream?: Stream<boolean> = undefined;
	isEndStream: boolean = false;
	fn?: StreamFunction<V> = undefined;
	name?: string;


	/**
	 * Creates a stream, with initial value of `value`.
	 *
	 * @param {?V} value
	 * @returns {Stream}
	 */
	constructor(value?: V | Promise<V>) {
		if ((value as any) === trueFn) {
			this.fn = value as any;
			this.isEndStream = true;
			this.endStream = undefined;
		} else {
			this.endStream = new Stream(trueFn as any);

			this.endStream.listeners.push(this);

			if (arguments.length > 0 && typeof value !== 'undefined') {
				this.push(value);
			}
		}

		this.push = this.push.bind(this);
	}

	private static flushUpdate(): void {
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

	private updateStream(): this {
		if (this.areDependenciesMet !== true && !this.dependencies.every((stream) => stream.hasValue) || this.endStream !== undefined && this.endStream.value === true) {
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

		if (newValue !== undefined && newValue !== null && isFunction((newValue as Promise<V>).then)) {
			(newValue as Promise<V>).then((result) => {
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

	private updateDependencies(): void {
		for (let i = 0; i < this.listeners.length; ++i) {
			if (this.listeners[i].endStream === (this as any)) {
				this.listeners[i].detachDependencies();

				if (this.listeners[i].endStream) {
					(this.listeners[i].endStream as Stream<boolean>).detachDependencies();
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

	private findDependencies(): void {
		if (this.isQueued === false) {
			this.isQueued = true;

			for (let i = 0; i < this.listeners.length; ++i) {
				this.listeners[i].findDependencies();
			}

			streamOrder[++nextStreamOrderIndex] = this;
		}
	}

	private detachDependencies(): void {
		for (let i = 0; i < this.dependencies.length; ++i) {
			this.dependencies[i].listeners[this.dependencies[i].listeners.indexOf(this)] = this.dependencies[i].listeners[this.dependencies[i].listeners.length - 1];
			this.dependencies[i].listeners.length--;
		}

		this.dependencies.length = 0;
	}


	/**
	 * Pushes `value` to the stream. If `value` is a `Promise` instance, it will be resolved first.
	 * Method is always bound to the stream instance.
	 *
	 * @param {V | Promise<V>} value
	 * @returns {this}
	 */
	push = (value: V | Promise<V>): this => {
		if (value !== undefined && value !== null && isFunction((value as Promise<V>).then)) {
			(value as Promise<V>).then(this.push);

			return this;
		}

		this.value = (value as V);
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
				if (this.listeners[i].endStream === (this as any)) {
					this.listeners[i].detachDependencies();
					(this.listeners[i].endStream as Stream<boolean>).detachDependencies();
				} else {
					this.listeners[i].changedDependencies.push(this);

					this.listeners[i].shouldUpdate = true;
				}
			}
		} else {
			this.values.push(value as V);
			streamsToUpdate.push(this);
		}

		return this;
	};


	/**
	 * Returns current value of stream.
	 *
	 * @returns {*}
	 */
	get(): any {
		return this.value;
	}


	/**
	 * Ends the stream.
	 *
	 * @returns {this}
	 */
	end(): this {
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
	toString(): string {
		return 'stream(' + this.value + ')';
	}


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
	combine(...streams: Array<any>): any {
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
	static combine(fn: StreamFunction<any>, ...streams: Array<Stream<any>>): Stream<any> {
		let newStream = new Stream();

		newStream.combine(fn, ...streams);

		return newStream;
	}


	/**
	 * Immediately calls stream's body function, even if all dependencies don't have values yet.
	 *
	 * @returns {this}
	 */
	immediate(): this {
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
	static map(fn: MapStreamFunction, stream: Stream<any>): Stream<any> {
		return Stream.combine((self, changed, streamDependency) => { self.push(fn(streamDependency.value)); }, stream);
	}


	/**
	 * Creates new stream consisting of values returned by the function `fn` called with values from stream instance.
	 *
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	map(fn: MapStreamFunction): Stream<any> {
		return Stream.map(fn, this);
	}


	/**
	 * Returns `true` if `value` is an instance of `Stream`.
	 *
	 * @param {*} value
	 * @returns {boolean}
	 */
	static isStream(value: any): boolean {
		return value instanceof Stream;
	}


	/**
	 * Changes end stream.
	 *
	 * @param {Stream}
	 * @returns {this}
	 */
	endsOn(endStream: this): this {
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
	static on(fn: OnStreamFunction, stream: Stream<any>): Stream<any> {
		return Stream.combine((self, changed, streamDependency) => { fn(streamDependency.value); }, stream);
	}


	/**
	 * Similar to `map`, but the returned stream is empty and is not updated.
	 *
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	on(fn: OnStreamFunction): Stream<any> {
		return Stream.on(fn, this);
	}


	/**
	 * Similar to `on`, but the `fn` isn't called if `stream` already has value; only values pushed to `stream` after the `subscribe` was called are relevant.
	 *
	 * @param {Function} fn
	 * @param {Stream} stream
	 * @returns {Stream}
	 */
	static subscribe(fn: OnStreamFunction, stream: Stream<any>): Stream<any> {
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
	subscribe(fn: OnStreamFunction): Stream<any> {
		return Stream.subscribe(fn, this);
	}


	/**
	 * Creates new stream consisting of values from both `stream1` and `stream2`.
	 *
	 * @param {Stream} stream1
	 * @param {Stream} stream2
	 * @returns {Stream}
	 */
	static merge(stream1: Stream<any>, stream2: Stream<any>): Stream<any> {
		let newStream = Stream.combine((self, changed, dependencyStream1, dependencyStream2) => {
			if (changed[0]) {
				self.push(changed[0].get());
			} else if (dependencyStream1.hasValue) {
				self.push(dependencyStream1.value);
			} else if (dependencyStream2.hasValue) {
				self.push(dependencyStream2.value);
			}
		}, stream1, stream2).immediate();

		let endStream = Stream.combine(trueFn, stream1.endStream as Stream<boolean>, stream2.endStream as Stream<boolean>);

		newStream.endsOn(endStream);

		return newStream;
	}


	/**
	 * Creates new stream consisting of values which are results of applying function from stream instance to the values of `stream`.
	 *
	 * @param {Stream} stream
	 * @returns {Stream}
	 */
	ap(stream: Stream<any>): Stream<any> {
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
	static of(value: any): Stream<any> {
		return new Stream(value);
	}
}
