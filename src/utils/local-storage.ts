let isSupported = true;

try {
    if (typeof window.localStorage === "undefined") {
        console.log('local storage is not supported');
        isSupported = false;
    }
} catch (e) {
    console.log(e);
}


export function getL(key) {
    if (isSupported) {
        let data = window.localStorage.getItem(key);
        try {
            data = JSON.parse(data);
        } catch (e) {}
        return data;
    }
}

export function setL(key, value) {
    if (isSupported) {
        try {
            const data = JSON.stringify(value);
            window.localStorage.setItem(key, data);
        } catch (e) {}
    }
}


export function removeL(key) {
    if (isSupported) {
        try {
            window.localStorage.removeItem(key);
        } catch (e) {}
    }
}
