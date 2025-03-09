const { indexState } = require("./store/indexStore");

indexState.subscribe(['check'], function f1(state: any) {
    console.log('check был изменен', state);
});
indexState.subscribe(['names'], function f2(state: any) {
    console.log('names был изменен', state);
});

indexState.setState({ names: [123], check: true });


