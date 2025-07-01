export default function useCache() {
    const CACHE_NAME = 'media-cache';

    const saveToCache = async (url) => {
        const cache = await caches.open(CACHE_NAME);
        const response = await fetch(url);
        await cache.put(url, response);
    };

    const getFromCache = async (url) => {
        const cache = await caches.open(CACHE_NAME);
        const res = await cache.match(url);
        return res ? await res.blob() : null;
    };

    return { saveToCache, getFromCache };
}