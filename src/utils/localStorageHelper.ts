import { LOCAL_STORAGE_KEYS } from "./constants";

class LocalStorageHelper {
    static setItem<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static getItem<T>(key: string): T | null {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) as T : null;
    }

    static removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    static setParams(endpoint: string, params: Record<string, string>): void {
        localStorage.setItem(`${endpoint}_${LOCAL_STORAGE_KEYS.PARAMS}`, JSON.stringify(params));
    }

    static getParams(endpoint: string): Record<string, string> | null {
        const storedParams = localStorage.getItem(`${endpoint}_${LOCAL_STORAGE_KEYS.PARAMS}`);
        return storedParams && storedParams !== "{}" ? JSON.parse(storedParams) : null;
    }

    static setHeaders(endpoint: string, headers: Record<string, string>): void {
        localStorage.setItem(`${endpoint}_${LOCAL_STORAGE_KEYS.HEADERS}`, JSON.stringify(headers));
    }

    static getHeaders(endpoint: string): Record<string, string> | null {
        const storedHeaders = localStorage.getItem(`${endpoint}_${LOCAL_STORAGE_KEYS.HEADERS}`);
        return storedHeaders && storedHeaders !== "{}" ? JSON.parse(storedHeaders) : null;
    }
}

export default LocalStorageHelper;