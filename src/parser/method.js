const cache = {};

export function parseMethod(key, obj, method, cond) { 
    cache[key] = {
        key,
        obj,
        method,
        cond
    };
}