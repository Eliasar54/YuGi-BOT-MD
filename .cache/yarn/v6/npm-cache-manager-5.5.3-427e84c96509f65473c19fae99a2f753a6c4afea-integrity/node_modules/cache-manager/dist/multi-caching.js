"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiCaching = void 0;
const eventemitter3_1 = __importDefault(require("eventemitter3"));
/**
 * Module that lets you specify a hierarchy of caches.
 */
function multiCaching(caches) {
    const eventEmitter = new eventemitter3_1.default();
    for (const cache of caches) {
        cache.on('error', event => eventEmitter.emit('error', event));
    }
    const get = async (key) => {
        for (const cache of caches) {
            try {
                // eslint-disable-next-line no-await-in-loop
                const value = await cache.get(key);
                if (value !== undefined) {
                    return value;
                }
            }
            catch (error) {
                const errorEvent = { error, key, operation: 'get' };
                eventEmitter.emit('error', errorEvent);
            }
        }
    };
    const set = async (key, data, ttl) => {
        await Promise.all(caches.map(async (cache) => cache.set(key, data, ttl))).catch(error => {
            const errorEvent = {
                error, key, operation: 'set', data,
            };
            eventEmitter.emit('error', errorEvent);
        });
    };
    return {
        get,
        set,
        async del(key) {
            await Promise.all(caches.map(async (cache) => cache.del(key))).catch(error => {
                const errorEvent = { error, key, operation: 'del' };
                eventEmitter.emit('error', errorEvent);
            });
        },
        async wrap(key, function_, ttl, refreshThreshold) {
            let value;
            let i = 0;
            for (; i < caches.length; i++) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    value = await caches[i].get(key);
                    if (value !== undefined) {
                        break;
                    }
                }
                catch (error) {
                    const errorEvent = { error, key, operation: 'wrap' };
                    eventEmitter.emit('error', errorEvent);
                }
            }
            if (value === undefined) {
                const result = await function_();
                const cacheTtl = typeof ttl === 'function' ? ttl(result) : ttl;
                await set(key, result, cacheTtl);
                return result;
            }
            const cacheTtl = typeof ttl === 'function' ? ttl(value) : ttl;
            await Promise.all(caches.slice(0, i).map(async (cache) => cache.set(key, value, cacheTtl))).then().catch(error => {
                const errorEvent = {
                    error, key, operation: 'wrap', data: value,
                };
                eventEmitter.emit('error', errorEvent);
            });
            await caches[i].wrap(key, function_, ttl, refreshThreshold).then(); // Call wrap for store for internal refreshThreshold logic, see: src/caching.ts caching.wrap
            return value;
        },
        async reset() {
            await Promise.all(caches.map(async (x) => x.reset())).catch(error => {
                const errorEvent = { error, key: '', operation: 'reset' };
                eventEmitter.emit('error', errorEvent);
            });
        },
        async mget(...keys) {
            const values = Array.from({ length: keys.length }).fill(undefined);
            for (const cache of caches) {
                if (values.every(x => x !== undefined)) {
                    break;
                }
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const value = await cache.store.mget(...keys);
                    for (const [i, v] of value.entries()) {
                        if (values[i] === undefined && v !== undefined) {
                            values[i] = v;
                        }
                    }
                }
                catch (error) {
                    const errorEvent = { error, keys, operation: 'mget' };
                    eventEmitter.emit('error', errorEvent);
                }
            }
            return values;
        },
        async mset(arguments_, ttl) {
            await Promise.all(caches.map(async (cache) => cache.store.mset(arguments_, ttl))).catch(error => {
                const keys = arguments_.map(([key]) => key);
                const data = arguments_.map(([, value]) => value);
                const errorEvent = {
                    error, keys, data, operation: 'mset',
                };
                eventEmitter.emit('error', errorEvent);
            });
        },
        async mdel(...keys) {
            await Promise.all(caches.map(async (cache) => cache.store.mdel(...keys)))
                .catch(error => {
                const errorEvent = { error, keys, operation: 'mdel' };
                eventEmitter.emit('error', errorEvent);
            });
        },
        on: (event, handler) => eventEmitter.on('error', handler),
        removeListener: (event, handler) => eventEmitter.removeListener(event, handler),
    };
}
exports.multiCaching = multiCaching;
//# sourceMappingURL=multi-caching.js.map