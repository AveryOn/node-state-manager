const { StateManager, normalizeUid, createProxyInner, KEY_SOURCE, STORE_ID_KEY } = require("../../src/store/core/store.core");
const { isEqual, isEmpty } = require("../../src/store/core/store.utils");


test('[StateManager][Utils]:: normalizeUid', () => {
    expect(normalizeUid('test')).toBe('store/test');
    
    const resultByEmpInp = normalizeUid();
    expect((resultByEmpInp && typeof resultByEmpInp === 'string'))
        .toBe(true);
});

test('[StateManager][Utils]:: createProxyInner', () => {
    const testState = new StateManager('test-proxy-inner', { testData: true });
    // 1
    const result1 = {
        value: true,
        [KEY_SOURCE]: 'testData',
        [STORE_ID_KEY]: `store/test-proxy-inner`,
    } 
    const result2 = undefined
    const result3 = `[${createProxyInner.name}] key должен быть типа string`;
    const result4 = `[${createProxyInner.name}] key обязательный аргумент!`;

    expect(createProxyInner.apply(testState, ['testData'])).toEqual(result1);
    expect(createProxyInner.apply(testState, ['another'])).toEqual(result2);

    // Errors
    expect(() => createProxyInner.apply(testState, [666])).toThrow(result3);
    expect(() => createProxyInner.apply(testState, [{}])).toThrow(result3);
    expect(() => createProxyInner.apply(testState, [true])).toThrow(result3);
    expect(() => createProxyInner.apply(testState, [[]])).toThrow(result3);
    expect(() => createProxyInner.apply(testState, [''])).toThrow(result4);
    expect(() => createProxyInner.apply(testState)).toThrow(result4);
});

test('[StateManager][Utils]:: isEqual', () => {
    // 1 Ничего не передано на вход
    const result1 = true;
    expect(isEqual()).toBe(result1);
    
    // 2 Первый - null Второй - не задан
    const result2 = false;
    expect(isEqual(null)).toBe(result2);
    
    // 3 Первый - null Второй - null
    const result3 = true;
    expect(isEqual(null, null)).toBe(result3);
    
    // 4 Первый - NaN Второй - NaN
    const result4 = true;
    expect(isEqual(NaN, NaN)).toBe(result4);
    
    // 5 Первый - 0 Второй - Infinity
    const result5 = false;
    expect(isEqual(0, Infinity)).toBe(result5);
    
    // 6 Первый - Infinity Второй - Infinity
    const result6 = true;
    expect(isEqual(Infinity, Infinity)).toBe(result6);
    
    // 7 Первый - STRING Второй - STRING
    const result7 = true;
    expect(isEqual('text', 'text')).toBe(result7);
    
    // 8 РАЗНЫЕ Первый - STRING Второй - STRING
    const result8 = false;
    expect(isEqual('text', 'test')).toBe(result8);
    
    // 9 РАЗНЫЕ Первый - BOOLEAN Второй - BOOLEAN
    const result9 = false;
    expect(isEqual(false, true)).toBe(result9);
    
    // 10 Первый - BOOLEAN Второй - BOOLEAN
    const result10 = true;
    expect(isEqual(true, true)).toBe(result10);
    
    // 11 Первый - null Второй - STRING
    const result11 = false;
    expect(isEqual(null, 'text')).toBe(result11);
    
    // 12 Первый - NaN Второй - NUMBER
    const result12 = false;
    expect(isEqual(null, 123)).toBe(result12);
    
    // 13 Первый - OBJECT Второй - OBJECT
    let a13 = { id: 1, name: 'Alex' };
    let b13 = { id: 1, name: 'Alex' };
    const result13 = true;
    expect(isEqual(a13, b13)).toBe(result13);
    
    // 14 Первый - OBJECT Второй - OBJECT
    let a14 = { id: 1, name: 'Alex' };
    let b14 = { id: 1, name: 'Alex', lastName: 'Mercer' };
    const result14 = false;
    expect(isEqual(a14, b14)).toBe(result14);
});


// isEmpty
test('[StateManager][Utils]:: isEmpty', () => {
    const result1 = true;
    expect(isEmpty()).toBe(result1);

    const result2 = true;
    expect(isEmpty(null)).toBe(result2);

    const result3 = true;
    expect(isEmpty(123)).toBe(result3);

    const result4 = true;
    expect(isEmpty('text')).toBe(result4);

    const result5 = true;
    expect(isEmpty([])).toBe(result5);

    const result6 = true;
    expect(isEmpty(NaN)).toBe(result6);

    const result7 = true;
    expect(isEmpty({})).toBe(result7);

    const result8 = false;
    expect(isEmpty({ key: undefined })).toBe(result8);

    const result9 = false;
    expect(isEmpty({ text: 'abc' })).toBe(result9);

})