import { StateManager } from "./core/store.core";

const indexState = new StateManager('index', {
    processData: {},
    check: false,
    cash: null,
    names: [] as any[],
});

export {
    indexState,
}
