let isSupported = true;

try {
    if (typeof window.sessionStorage === "undefined") {
        console.log('session storage not supported');
        isSupported = false;
    }
} catch (e) {
    console.log(e);
}

export function get(key) {
    if (isSupported) {
        let data = window.sessionStorage.getItem(key);
        try {
            data = JSON.parse(data);
        } catch (e) {
        }
        return data;
    }
}

export function set(key, value) {
    if (isSupported) {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
        }
    }
}

export function remove(key) {
    if (isSupported) {
        try {
            window.sessionStorage.removeItem(key);
        } catch (e) {
        }
    }
}
