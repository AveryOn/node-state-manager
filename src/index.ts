export * from "./store-manager.core";
export * from "./store.utils";

import { StateManager } from "./store-manager.core";


const state = new StateManager('index', {
    _count: 0,
    example: {
        id: 123,
        username: 'john'
    }
});


state.subscribe('example', ({ example }) => {
    console.log('EXAMPLE был изменен', example.value);
})

const example = state.getState('example')

let cnt = 0
setInterval(() => {
    cnt++
    example.value = {
        id: 123,
        username: `User-${cnt}`
    };
}, 1000)