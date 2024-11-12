const { StateManager } = require("./core/store.core");

const indexState = new StateManager('index', {
    processData: {},
    check: false,
    cash: null,
    names: [],
});

module.exports = {
    indexState,
}
