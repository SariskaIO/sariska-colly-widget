let gVariables = {};

function setByKey(key, value) {
    gVariables[key] = value;
}

function getByKey(key) {
    return gVariables[key];
}

function removeByKey(key) {
    const item = gVariables[key];
    delete gVariables[key];
    if (  item.element ) {
        item.element.remove();
    }
}

function removeAll(key) {
    gVariables = {};
}

export default {
    setByKey,
    getByKey,
    removeAll,
    removeByKey
}

