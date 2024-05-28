"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = exports.caching = void 0;
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const promise_coalesce_1 = require("promise-coalesce");
const index_js_1 = require("./stores/index.js");
/**
 * Generic caching interface that wraps any caching library with a compatible interface.
 */
async function caching(factory, arguments_) {
    if (factory === 'memory') {
        const store = (0, index_js_1.memoryStore)(arguments_);
        return createCache(store, arguments_);
    }
    if (typeof factory === 'function') {
        const store = await factory(arguments_);
        return createCache(store, arguments_);
    }
    const store = factory;
    return createCache(store, arguments_);
}
exports.caching = caching;
/**
 * Create cache instance by store (non-async).
 */
function createCache(store, arguments_) {
    const eventEmitter = new eventemitter3_1.default();
    return {
        /**
         * Wraps a function in cache. I.e., the first time the function is run,
         * its results are stored in cache so subsequent calls retrieve from cache
         * instead of calling the function.

         * @example
         * const result = await cache.wrap('key', () => Promise.resolve(1));
         *
         */
        async wrap(key, function_, ttl, refreshThreshold) {
            const refreshThresholdConfig = refreshThreshold ?? arguments_?.refreshThreshold ?? 0;
            return (0, promise_coalesce_1.coalesceAsync)(key, async () => {
                const value = await store.get(key).catch(error => {
                    const errorEvent = { error, key, operation: 'wrap' };
                    eventEmitter.emit('error', errorEvent);
                });
                if (value === undefined) {
                    const result = await function_();
                    const cacheTtl = typeof ttl === 'function' ? ttl(result) : ttl;
                    await store.set(key, result, cacheTtl).catch(error => {
                        const errorEvent = {
                            error, key, operation: 'wrap', data: result,
                        };
                        eventEmitter.emit('error', errorEvent);
                    });
                    return result;
                }
                if (refreshThresholdConfig) {
                    const cacheTtl = typeof ttl === 'function' ? ttl(value) : ttl;
                    const remainingTtl = await store.ttl(key);
                    if (remainingTtl !== -1 && remainingTtl < refreshThresholdConfig) {
                        (0, promise_coalesce_1.coalesceAsync)(`+++${key}`, function_)
                            .then(async (result) => store.set(key, result, cacheTtl))
                            .catch(async (error) => {
                            const errorEvent = {
                                error, key, operation: 'wrap', data: value,
                            };
                            eventEmitter.emit('error', errorEvent);
                            eventEmitter.emit('onBackgroundRefreshError', error);
                            if (arguments_?.onBackgroundRefreshError) {
                                arguments_.onBackgroundRefreshError(error);
                            }
                            else {
                                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                                throw error;
                            }
                        });
                    }
                }
                return value;
            });
        },
        store,
        del: async (key) => store.del(key),
        get: async (key) => store.get(key),
        set: async (key, value, ttl) => store.set(key, value, ttl),
        reset: async () => store.reset(),
        on: (event, handler) => eventEmitter.on('error', handler),
        removeListener: (event, handler) => eventEmitter.removeListener(event, handler),
    };
}
exports.createCache = createCache;
//# sourceMappingURL=caching.js.map