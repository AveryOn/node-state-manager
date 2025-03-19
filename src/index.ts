export * from "./store-manager.core";
export * from "./store.utils";

import { StateManager } from "./store-manager.core";



const store = new StateManager('index', {
    chapter: null as any,
    subChapter: null as any,
    materialUid: null as any,
    materialType: null as any,
})

store.subscribe(['materialUid', 'materialType'], function one(value) {
    console.log('[one] SUBSCRIBE [1] =>', value);
}, { fetch: '*' })


store.subscribe(['chapter'], function foo(value) {
    console.log('[foo] SUBSCRIBE [2] =>', value);
}, { fetch: 'materialType' })

const typeM = store.getState('materialType')

typeM.value = 'ANOTHER_VALUE'

store.setState({
    chapter: 'Example',
    // subChapter: 'example-fullpath',
    materialUid: `Example---example-fullpath`,
    materialType: 'sub-chapter',
})