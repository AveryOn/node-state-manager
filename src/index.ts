import { indexState } from "./store/indexStore";

indexState.subscribe(['check', 'names'], function f1(state: any) {
    console.log('check | names были изменены', state);
});
// indexState.subscribe(['names'], function f2(state: any) {
//     console.log('names был изменен', state);
// });

indexState.setState({ names: [123], check: true });


