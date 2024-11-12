const { indexState } = require("./store/indexStore");

indexState.subscribe(['check', 'cash'], (state) => {
    console.log('State был изменен', state);
});

indexState.setState({ check: true, cash: 10 });


