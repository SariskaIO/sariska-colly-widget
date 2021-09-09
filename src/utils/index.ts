import {SECRET_SALT, EMOJI_RANGES_REGEX, GET_PRESIGNED_URL, GENERATE_TOKEN_URL} from "../constants";
import {getL, removeL, setL} from "./local-storage";
import service from "../services";

const Compressor = require('compressorjs');

export function each(incoming) {
    return [].slice.call(incoming || []);
}

export function getMethod(str) {
    return str.replace(/_([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
}

export function checkFalsy(value) {
    return (value === undefined || value === null || isNaN(value) || value === false);
}

export const splitUrl = function (url) {
    let hash, index, params;
    if ((index = url.indexOf("#")) >= 0) {
        hash = url.slice(index);
        url = url.slice(0, index);
    } else {
        hash = "";
    }

    if ((index = url.indexOf("?")) >= 0) {
        params = url.slice(index);
        url = url.slice(0, index);
    } else {
        params = "";
    }

    return {url, params, hash};
};

export function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf('?') !== -1 ? "&" : "?";

    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

export function getQueryStringValue(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function getURL(url, guestName) {
    return updateQueryStringParameter(url, "guestName", guestName);
}

export const pathFromUrl = function (url) {
    let path;
    ({url} = splitUrl(url));
    if (url.indexOf("file://") === 0) {
        path = url.replace(new RegExp(`^file://(localhost)?`), "");
    } else {
        //                        http  :   // hostname  :8080  /
        path = url.replace(new RegExp(`^([^:]+:)?//([^:/]+)(:\\d*)?/`), "/");
    }

    // decodeURI has special handling of stuff like semicolons, so use decodeURIComponent
    return decodeURIComponent(path);
};

export const pickBestMatch = function (path, objects, pathFunc): any {
    let score;
    let bestMatch = {score: 0, object: null};

    objects.forEach(object => {
        score = numberOfMatchingSegments(path, pathFunc(object));
        if (score > bestMatch.score) {
            bestMatch = {object, score};
        }
    });

    if (bestMatch.score > 0) {
        return bestMatch;
    } else {
        return null;
    }
};

export const numberOfMatchingSegments = function (path1, path2) {
    path1 = normalisePath(path1);
    path2 = normalisePath(path2);

    if (path1 === path2) {
        return 10000;
    }

    const comps1 = path1.split("/").reverse();
    const comps2 = path2.split("/").reverse();
    const len = Math.min(comps1.length, comps2.length);

    let eqCount = 0;
    while (eqCount < len && comps1[eqCount] === comps2[eqCount]) {
        ++eqCount;
    }

    return eqCount;
};

export const pathsMatch = (path1, path2) =>
    numberOfMatchingSegments(path1, path2) > 0;

export function getLocation(url: string) {
    var location = document.createElement("a");
    location.href = url;

    if (location.host === "") {
        location.href = location.href;
    }

    return location;
}

/**
 * @param {string} search
 * @param {string} key
 * @param {string} suffix
 */
export function updateSearch(search, key, suffix) {
    if (search === "") {
        return "?" + suffix;
    }

    return (
        "?" +
        search
            .slice(1)
            .split("&")
            .map(function (item) {
                return item.split("=");
            })
            .filter(function (tuple) {
                return tuple[0] !== key;
            })
            .map(function (item) {
                return [item[0], item[1]].join("=");
            })
            .concat(suffix)
            .join("&")
    );
}

const blacklist = [
    // never allow .map files through
    function (incoming) {
        return incoming.ext === "map";
    }
];

export function array(incoming) {
    return [].slice.call(incoming);
}

export function normalisePath(path: string): string {
    return path
        .replace(/^\/+/, "")
        .replace(/\\/g, "/")
        .toLowerCase();
}

export function cipher(salt) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);

    return text => text.toString().split('')
        .map(textToChars)
        .map(applySaltToChar)
        .map(byteHex)
        .join('');
}

export function decipher(salt) {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))
        .map(applySaltToChar)
        .map(charCode => String.fromCharCode(charCode))
        .join('');
}

export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function syncWithParams(params) {
    const sessionId =  getQueryStringValue("cbid",window.location);
    const guestName =  getQueryStringValue("guestname",window.location);
    if (sessionId) {
        params["guestName"] = guestName;
        params["session_id"] = sessionId;
    }
    return params;
}

export function syncWithLocalStorage(params, persistedData) {
    let {room, user} = persistedData;
    if (room) {
        params["session_id"] = room.session_id;
    }
    if (user) {
        params["id"] = user.id;
        params["name"] = user.name;
        params["email"] = user.email;
        params["avatar"] = user.avatar;
    }
    return params;
}

export function getMouseId(id) {
    return `cb--custom-mouse-${id}`;
}

export function appendInlineStyle() {
    const css = ".cb__customMouse{position:fixed;top:0;left:0;z-index:2147483638}.cb__customMouse svg{height:24px;width:24px}.cb__customMouse .cb__customMouse__userName{font-family:Roboto,sans-serif;padding:5px;font-size:14px;line-height:16px;color:#fff;font-weight:500;margin-left:14px;border-radius:5px}.cb__customMouse.cb__customMouse--hidden{display:none}";
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
}

export function inIframe() {
    return window != top;
}

export function getTime(date) {
    let dt = new Date(date)
    let ts = dt.getTime() + ( 5.5 * 60 * 60 * 1000 )
    dt  = new Date(ts);
    let h = dt.getHours(), m = dt.getMinutes().toString();
    m = (m.length === 1 ? "0" + m : m);
    const _time = (h > 12) ? (h - 12 + ':' + m + ' PM') : (h + ':' + m + ' AM');
    const mon = dt.toLocaleString('en-us', {month: 'short'});
    return `${dt.getDate()} ${mon}, ${_time}`;
}

export function getTimeLocal() {
    let dt = new Date()
    let h = dt.getHours(), m = dt.getMinutes().toString();
    m = (m.length === 1 ? "0" + m : m);
    const _time = (h > 12) ? (h - 12 + ':' + m + ' PM') : (h + ':' + m + ' AM');
    const mon = dt.toLocaleString('en-us', {month: 'short'});
    return `${dt.getDate()} ${mon}, ${_time}`;
}

export function getTop(list) {
    const top = (list.length - 1) * 26 + 31;
    return `-${top}px`;
}

export function getText(state) {
    return state ? "Minimize" : "Maximize";
}

export function getUserFromSubscriber(sub) {
    try {
        const metadata = sub.stream.connection.options.metadata;
        return JSON.parse(metadata);
    } catch (e) {
        return {};
    }
}

export function getPresignedUrl(params) {
    return new Promise((resolve, reject) => {
        const body = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getL("cb__token")}`
            },
            body: JSON.stringify({
                fileType: params.fileType,
                fileName: params.fileName
            })
        };

        fetch(GET_PRESIGNED_URL, body)
            .then((response) => {
                if (response.ok) {
                    return response.json(); //then consume it again, the error happens
                }
            })
            .then(function (response) {
                resolve(response);
            }).catch((error) => {
            reject(error)
        })
    });
}


export function compressFile(file, type) {
    return new Promise((resolve, reject) => {
        if (type === "attachment") {
            resolve(file);
        } else {
            new Compressor(file, {
                quality: 0.6,
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err.message);
                }
            });
        }
    });
}

export function getUniqueNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

export function formatBytes(bytes) {
    var marker = 1024; // Change to 1000 if required
    var decimal = 3; // Change as required
    var kiloBytes = marker; // One Kilobyte is 1024 bytes
    var megaBytes = marker * marker; // One MB is 1024 KB
    var gigaBytes = marker * marker * marker; // One GB is 1024 MB
    var teraBytes = marker * marker * marker * marker; // One TB is 1024 GB

    // return bytes if less than a KB
    if (bytes < kiloBytes) return bytes + " Bytes";
    // return KB if less than a MB
    else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
    // return MB if less than a GB
    else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
    // return GB if less than a TB
    else return (bytes / gigaBytes).toFixed(decimal) + " GB";
}

export function getFileNameFromUrl(url) {
    const parts = url.split("/");
    return parts[parts.length - 1];
}

export function radioOrCheckbox(el) {
    return (el.type === 'checkbox' || el.type === 'radio');
}


export function getDimensions() {
    const x = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const y = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return {x, y};
}

export function urlify(text) {
    let urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a target="_blank" href="' + url + '">' + url + '</a>';
    });
}

export function isOnlyEmojis(str) {
    const removeEmoji = str => str.replace(new RegExp(EMOJI_RANGES_REGEX, 'g'), '');
    return !removeEmoji(str).length;
}


export async function getToken(sessionParams):Promise<string> {
    const body = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: {
                id: sessionParams.id,
                name: sessionParams.name,
                email: sessionParams.email,
                avatar: sessionParams.avatar,
                role: sessionParams.role
            },
            sessionId: sessionParams.session_id,
            apiKey: "27fd6f8080d512442a3694f461adb3986cda5ba39dbe368d75" //window["sariskaConfig"] pick from here
        })
    };

    try {
        const response = await fetch(GENERATE_TOKEN_URL, body);
        if (response.ok) {
            const json = await response.json();
            const token = json.token;
            setL("cb__token", token);
            return token;
        }
    } catch (error) {
    }
}

export function encodeHTML(str){
    return str.replace(/([\u00A0-\u9999<>&])(.|$)/g, function(full, char, next) {
        if(char !== '&' || next !== '#'){
            if(/[\u00A0-\u9999<>&]/.test(next))
                next = '&#' + next.charCodeAt(0) + ';';

            return '&#' + char.charCodeAt(0) + ';' + next;
        }

        return full;
    });
}

export function decodeHTML(str){
    return str.replace(/&#([0-9]+);/g, function(full, int) {
        return String.fromCharCode(parseInt(int));
    });
}

export function getUser(track, room) {
    const id = track.getParticipantId();
    const participants = room.participants;
    const participant = participants[id];
    if (participant && Object.keys(participant).length) {
        return participants[id]._identity.user;
    }
    return {};
}

export function skipToolbox(element) {
    if (element === document) {
        return element.documentElement.closest("#cb__toolbox_container");
    }
    return element.closest("#cb__toolbox_container");
}

export function isMobile() {
    let Android = function () {
        return navigator.userAgent.match(/Android/i);
    };
    let BlackBerry = function () {
        return navigator.userAgent.match(/BlackBerry/i);
    };
    let iOS = function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    };
    let Opera = function () {
        return navigator.userAgent.match(/Opera Mini/i);
    };
    let Windows = function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    };
    return (Android() || BlackBerry() || iOS() || Opera() || Windows());
}


export function getMeetingId() {
    const characters ='abcdefghijklmnopqrstuvwxyz';
    function generateString(length) {
        let result = ' ';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const str = generateString(9).trim()
    const strArr = str.match(/.{3}/g);
    return strArr.join("-");
}
