// @ts-nocheck
import { StateManager, KEY_SOURCE, STORE_ID_KEY } from '../../src/store/core/store.core';

const testStore = new StateManager('test', {
    typeBool: false,
    typeString: 'text',
    typeNumber: 123,
    typeArray: [],
    typeObject: { keyNum: 123, keyStr: 'text', keyBool: true, keyObj: {}, keyNull: null, keyArr: [] },
    typeFunc: function (a, b) {
        return a + b;
    },
    typeNull: null,
    typeUndefind: undefined,
});

test('[StateManager]:: Извлечение экземпляра из instances', () => {
    expect(JSON.stringify(StateManager.instances['store/test']))
        .toBe(JSON.stringify(testStore));
});

// ##############################  DELETE STORE  ###################################
// Удаление активного экземпляра стора
test('[StateManager]:: Destroy Store', () => {
    const newTestStore = new StateManager('test-new', { testData: 'text' });
    newTestStore.destoy();
    expect(StateManager.instances['test-new']).toEqual(undefined);
});

// ###################################  MULTIPLE GET STATE  #################################

test('[StateManager]:: Multiple getState', () => {
    const state = testStore.getState(['typeBool', 'typeString', 'typeNumber', 'typeArray', 'typeObject']);
    const obj2 = {
        typeBool: { value: false, [KEY_SOURCE]: 'typeBool', [STORE_ID_KEY]: 'store/test' },
        typeString: { value: 'text', [KEY_SOURCE]: 'typeString', [STORE_ID_KEY]: 'store/test' },
        typeNumber: { value: 123, [KEY_SOURCE]: 'typeNumber', [STORE_ID_KEY]: 'store/test' },
        typeArray: { value: [], [KEY_SOURCE]: 'typeArray', [STORE_ID_KEY]: 'store/test' },
        typeObject: {
            value: { keyNum: 123, keyStr: 'text', keyBool: true, keyObj: {}, keyNull: null, keyArr: [] },
            [KEY_SOURCE]: 'typeObject',
            [STORE_ID_KEY]: 'store/test'
        },
    };
    expect(state).toEqual(obj2);
});

// ########################################  GET STATE  ###################################

// Empty
test('[StateManager]:: getState -> получение несуществующих данных', () => {
    // 1. Получение НЕ существующой модели    
    const obj1 = testStore.getState('isNotExistsKey');
    const result = undefined;
    expect(obj1).toEqual(result);

    // 2. Получение нескольких полей, в том числе НЕ существующей модели
    const obj2 = testStore.getState(['typeString', 'isNotExistsKey']);
    const result2 = {
        typeString: { [KEY_SOURCE]: 'typeString', value: 'text', [STORE_ID_KEY]: 'store/test' }
    };
    expect(obj2).toEqual(result2);

    // 3. Передача массива с несуществующими полями
    const obj3 = testStore.getState(['isNotExistsKey1', 'isNotExistsKey2']);
    const result3 = {};
    expect(obj3).toEqual(result3);

    // 4. Передача null
    const resul4 = '[StateManager.getState] параметр request должен быть типа string[] | string | undefined';
    expect(() => testStore.getState(null)).toThrow(resul4);

    // 5. Передача числа
    const resul5 = '[StateManager.getState] параметр request должен быть типа string[] | string | undefined';
    expect(() => testStore.getState(0)).toThrow(resul5);

    // 6. Передача массива с невалидными данными
    const resul6 = '[StateManager.getState] параметр request должен быть типа string[] | string | undefined';
    expect(() => testStore.getState(['validStr', '', false, []])).toThrow(resul6);
});

// Boolean
test('[StateManager]:: getState -> получение данных типа boolean', () => {
    const obj1 = testStore.getState('typeBool');
    const obj2 = { [KEY_SOURCE]: 'typeBool', value: false, [STORE_ID_KEY]: 'store/test' };
    expect(obj1).toEqual(obj2);
});

// String
test('[StateManager]:: getState -> получение данных типа string', () => {
    const obj1 = testStore.getState('typeString');
    const obj2 = { [KEY_SOURCE]: 'typeString', value: 'text', [STORE_ID_KEY]: 'store/test' };
    expect(obj1).toEqual(obj2);
});

// Number
test('[StateManager]:: getState -> получение данных типа number', () => {
    const obj1 = testStore.getState('typeNumber');
    const obj2 = { [KEY_SOURCE]: 'typeNumber', value: 123, [STORE_ID_KEY]: 'store/test' };
    expect(obj1).toEqual(obj2);
});

// Array
test('[StateManager]:: getState -> получение данных типа array', () => {
    const obj1 = testStore.getState('typeArray');
    const obj2 = {
        [KEY_SOURCE]: 'typeArray',
        value: [],
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// Object
test('[StateManager]:: getState -> получение данных типа object', () => {
    const obj1 = testStore.getState('typeObject');
    const obj2 = {
        [KEY_SOURCE]: 'typeObject',
        value: { keyNum: 123, keyStr: 'text', keyBool: true, keyObj: {}, keyNull: null, keyArr: [] },
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// Function
test('[StateManager]:: getState -> получение данных типа function', () => {
    let obj1 = testStore.getState('typeFunc');
    obj1 = { ...obj1, value: typeof obj1.value };
    const obj2 = {
        [KEY_SOURCE]: 'typeFunc',
        value: 'function',
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// Null
test('[StateManager]:: getState -> получение данных типа null', () => {
    const obj1 = testStore.getState('typeNull');
    const obj2 = {
        [KEY_SOURCE]: 'typeNull',
        value: null,
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// Undefined
test('[StateManager]:: getState -> получение данных типа Undefined', () => {
    const obj1 = testStore.getState('typeUndefind');
    const obj2 = {
        [KEY_SOURCE]: 'typeUndefind',
        value: undefined,
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});


// ########################################  SET STATE  ###################################

// BOOLEAN
test('[StateManager][SET]:: Set State -> boolean', () => {
    const typeBool = testStore.getState('typeBool');
    typeBool.value = true;
    const obj1 = testStore.getState('typeBool');
    const obj2 = {
        [KEY_SOURCE]: 'typeBool',
        value: true,
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// NUMBER
test('[StateManager][SET]:: Set State -> number', () => {
    const typeNumber = testStore.getState('typeNumber');
    typeNumber.value = 456;
    const obj1 = testStore.getState('typeNumber');
    const obj2 = {
        [KEY_SOURCE]: 'typeNumber',
        value: 456,
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// ___________ Array
// ARRAY
test('[StateManager][SET]:: Set State -> array', () => {
    const typeArray = testStore.getState('typeArray');
    typeArray.value.push(...[4, 5, 6]);
    const obj1 = testStore.getState('typeArray');
    const obj2 = {
        [KEY_SOURCE]: 'typeArray',
        value: [4, 5, 6],
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// ARRAY[Map mutation]
test('[StateManager][SET]:: Set State -> array (map mutation) ', () => {
    const typeArray = testStore.getState('typeArray');
    typeArray.value = [1, 2, 3];
    typeArray.value = typeArray.value.map((_, idx) => {
        return { id: idx + 1 };
    });
    const obj1 = testStore.getState('typeArray');
    const obj2 = {
        [KEY_SOURCE]: 'typeArray',
        value: [{ id: 1 }, { id: 2 }, { id: 3 }],
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// ARRAY[Index mutation]
test('[StateManager][SET]:: Set State -> array (index mutation) ', () => {
    const typeArray = testStore.getState('typeArray');
    typeArray.value = [{}, {}, {}];
    typeArray.value[1]['id'] = 2;
    const obj1 = testStore.getState('typeArray');
    const obj2 = {
        [KEY_SOURCE]: 'typeArray',
        value: [{}, { id: 2 }, {}],
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

// ___________ Object
test('[StateManager][SET]:: Set State -> object', () => {
    const typeObject = testStore.getState('typeObject');
    typeObject.value = { newValue: 123, newBoolVal: false };
    const obj1 = testStore.getState('typeObject');
    const obj2 = {
        [KEY_SOURCE]: 'typeObject',
        value: { newValue: 123, newBoolVal: false },
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

test('[StateManager][SET]:: Set State -> object (mutation by key)', () => {
    const typeObject = testStore.getState('typeObject');
    typeObject.value = { key1: 10, key2: false };
    typeObject.value['key2'] = true;
    typeObject.value.key1 = 15;
    const obj1 = testStore.getState('typeObject');
    const obj2 = {
        [KEY_SOURCE]: 'typeObject',
        value: { key1: 15, key2: true },
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});

test('[StateManager][SET]:: Set State -> object (delete by key)', () => {
    const typeObject = testStore.getState('typeObject');
    typeObject.value = { key1: 10, key2: false, key3: [1] };
    Reflect.deleteProperty(typeObject.value, 'key2');
    delete typeObject.value.key3;
    const obj1 = testStore.getState('typeObject');
    const obj2 = {
        [KEY_SOURCE]: 'typeObject',
        value: { key1: 10 },
        [STORE_ID_KEY]: 'store/test'
    };
    expect(obj1).toEqual(obj2);
});


// #######################  SET STATE -> Тестирование метода setState  #######################

test('[StateManager][SET]:: StateManager.setState', () => {
    const localStore = new StateManager('local-store-st-st', { data1: 'value_1', data2: { i: 123, j: 'abc' } });

    // 1. Ничего не передано;
    const result1 = '[StateManager.setState] newState обязательный аргумент';
    expect(() => localStore.setState()).toThrow(result1);

    // 2. Передана рандомная строка;
    const result2 = '[StateManager.setState] аргумент newState должен быть типа "object"';
    expect(() => localStore.setState('abc')).toThrow(result2);

    // 3. Передано null;
    const result3 = '[StateManager.setState] аргумент newState должен быть типа "object"';
    expect(() => localStore.setState(null)).toThrow(result3);

    // 4. Передано NaN;
    const result4 = '[StateManager.setState] аргумент newState должен быть типа "object"';
    expect(() => localStore.setState(NaN)).toThrow(result4);

    // 5. Передан массив;
    const result5 = '[StateManager.setState] аргумент newState должен быть типа "object"';
    expect(() => localStore.setState([123, 'abc', [], {}])).toThrow(result5);

    // 6. Передан пустой объект;
    const result6 = undefined;
    expect(localStore.setState({})).toBe(result6);

    // 7. Передан объект c ключами;
    const result7 = undefined;
    expect(localStore.setState({ unique: true })).toBe(result7);

    // 8. Проверяем наличие правильного состояния после Добавления нового ключа unique
    const updatedState1 = localStore.getState();
    const result8 = {
        data1: { [KEY_SOURCE]: 'data1', value: 'value_1', [STORE_ID_KEY]: 'store/local-store-st-st' },
        data2: { [KEY_SOURCE]: 'data2', value: { i: 123, j: 'abc' }, [STORE_ID_KEY]: 'store/local-store-st-st' },
        unique: { [KEY_SOURCE]: 'unique', value: true, [STORE_ID_KEY]: 'store/local-store-st-st' },
    };
    expect(updatedState1).toEqual(result8);

    // 9. Изменения существующих моделей
    localStore.setState({ data2: { i: 456, j: 'abcd' }, unique: false });
    const updatedState2 = localStore.getState();
    const result9 = {
        data1: { [KEY_SOURCE]: 'data1', value: 'value_1', [STORE_ID_KEY]: 'store/local-store-st-st' },
        data2: { [KEY_SOURCE]: 'data2', value: { i: 456, j: 'abcd' }, [STORE_ID_KEY]: 'store/local-store-st-st' },
        unique: { [KEY_SOURCE]: 'unique', value: false, [STORE_ID_KEY]: 'store/local-store-st-st' },
    };
    expect(updatedState2).toEqual(result9);

    // 10. Изменения существующих моделей + Добавление новой модели
    localStore.setState({ data2: { i: 666, j: 'Another Text' }, pid: 7743 });
    const updatedState3 = localStore.getState();
    const result10 = {
        data1: { [KEY_SOURCE]: 'data1', value: 'value_1', [STORE_ID_KEY]: 'store/local-store-st-st' },
        data2: { [KEY_SOURCE]: 'data2', value: { i: 666, j: 'Another Text' }, [STORE_ID_KEY]: 'store/local-store-st-st' },
        unique: { [KEY_SOURCE]: 'unique', value: false, [STORE_ID_KEY]: 'store/local-store-st-st' },
        pid: { [KEY_SOURCE]: 'pid', value: 7743, [STORE_ID_KEY]: 'store/local-store-st-st' },
    };
    expect(updatedState3).toEqual(result10);
});


// ########################################  SUBSCRIBE  ###################################
test('[StateManager]:: Set subscribe listener ', () => {
    const localState = new StateManager('local-subscribe', { check: false, data1: 123, data2: 'text' });

    // 1 Ничего не было передано
    const result1 = '[StateManager.subscribe] target - обязательный аргумент';
    expect(() => localState.subscribe()).toThrow(result1);

    // 2 Передан ПУСТОЙ target, и НЕ передан listener
    const result2 = '[StateManager.subscribe] target - обязательный аргумент';
    expect(() => localState.subscribe('')).toThrow(result2);

    // 3 Передан BOOLEAN target, и НЕ передан listener
    const result3 = '[StateManager.subscribe] Аргумент target должен быть типа string | string[]';
    expect(() => localState.subscribe(false)).toThrow(result3);

    // 4 Передан NUMBER target, и НЕ передан listener
    const result4 = '[StateManager.subscribe] Аргумент target должен быть типа string | string[]';
    expect(() => localState.subscribe(0)).toThrow(result4);

    // 5 Передан STRING НЕ существуюший в localState target, и НЕ передан listener
    const result5 = '[StateManager.subscribe] Модель "example-key" отсутствует в хранилище';
    expect(() => localState.subscribe('example-key')).toThrow(result5);

    // 6 Передан STRING существующий target, и НЕ передан listener
    const result6 = 0;
    expect(localState.subscribe('data2')).toBe(result6);

    // 7 Передан Еще раз тот же target 
    const result7 = 0;
    expect(localState.subscribe('data2')).toBe(result7);

    // 8 Передан Array<STRING> только НЕ существующих в localState target, и НЕ передан listener
    const result8 = '[StateManager.subscribe] Модели состояния с ключами "example-one", "example-two", "data3" не существуют';
    expect(() => localState.subscribe(['example-one', 'example-two', 'data3'])).toThrow(result8);

    // 9 Передан Array<STRING> только НЕ существующих в localState и НЕ валидных target, и НЕ передан listener
    const result9 = '[StateManager.subscribe] Аргумент target должен быть типа string | string[]';
    expect(() => localState.subscribe(['example-one', true, 83])).toThrow(result9);

    // 10 Передан Array<ПУСТОЙ> в target, и НЕ передан listener
    const result10 = '[StateManager.subscribe] Аргумент target должен быть типа string | string[]';
    expect(() => localState.subscribe([])).toThrow(result10);

    // 11 Передан Array<STRING> с пустой строкой в target, и НЕ передан listener
    const result11 = '[StateManager.subscribe] Аргумент target должен быть типа string | string[]';
    expect(() => localState.subscribe(['', 'data2'])).toThrow(result11);

    // 12 Передан Array<STRING> с валидными, существующими в localState target, и НЕ передан listener
    const result12 = 1;
    expect(localState.subscribe(['check', 'data2', 'data2'])).toBe(result12);

    // 13 Передан Array<STRING> с валидными, существующими в localState target, и передан listener
    localState.subscribe(['check', 'data2'], () => { })
    const result13 = ['check', 'data2'];
    expect(Object.keys(localState.listenerMap)).toEqual(result13);

    // 14 Передан STRING валидный, существующий в localState target, и передан listener
    localState.resetListeners(); // сброс всех активных обработчиков
    localState.subscribe('data1', () => { })
    const result14 = ['data1'];
    expect(Object.keys(localState.listenerMap)).toEqual(result14);

    // 15 Передан STRING валидный, существующий в localState target, и передано 3 listener'а, 
    // которые все должны быть установлены для одного target
    localState.resetListeners(); // сброс всех активных обработчиков
    localState.subscribe('data2', () => { console.log('Первый обработчик') });
    localState.subscribe('data2', () => { console.log('Второй обработчик') });
    localState.subscribe('data2', () => { console.log('Третий обработчик') });
    const result15 = 3;
    expect(localState.listenerMap['data2'].length).toEqual(result15);

    // 16 Передан Array<STRING> c валидными, существующими в localState target, и передано по 2 listener'а, 
    // которые все должны быть установлены для каждого target
    localState.resetListeners(); // сброс всех активных обработчиков
    localState.subscribe('data2', () => { console.log('[data2] обработчик 1') });
    localState.subscribe(['data2'], () => { console.log('[data2] обработчик 2') });
    localState.subscribe(['data2', 'data1'], () => { console.log('[data2 | data1] - [3 | 1]') });
    localState.subscribe(['data1', 'check'], () => { console.log('[data1 | check] - [2,| 1]') });
    localState.subscribe(['data1', 'data2', 'check'], () => { console.log('[data1 | data2 | check] - [3 | 4 | 2]') });
    const handlers = {
        data1: localState.listenerMap['data1'].length,
        data2: localState.listenerMap['data2'].length,
        check: localState.listenerMap['check'].length,
    }
    expect(handlers).toEqual({ data1: 3, data2: 4, check: 2 });
});


// ########################################  NOTIFY  ###################################
// Тестирование уведомляющего модуля, который оповещает всех слушателей изменения зависимых моделей стейта
test('[StateManager]:: Notify subscribed listener ', () => {
    const localStore = new StateManager('local-store-noty', { data1: 'value_1', data2: { i: 123, j: 'abc' } });

    // 1. Ничего не было передано
    const result1 = undefined;
    expect(localStore.notify()).toBe(result1);

    // 2. Передана пустая строка
    const result2 = undefined;
    expect(localStore.notify('')).toBe(result2);

    // 3. Передан null
    const result3 = '[StateManager.notify] keys должен быть типа string | string[]';
    expect(() => localStore.notify(null)).toThrow(result3);

    // 4. Передано число
    const result4 = '[StateManager.notify] keys должен быть типа string | string[]';
    expect(() => localStore.notify(0)).toThrow(result4);

    // 5. Передан объект
    const result5 = '[StateManager.notify] keys должен быть типа string | string[]';
    expect(() => localStore.notify({ key: 'text' })).toThrow(result5);

    // 6. Передана строка - ключ несуществующей модели
    const result6 = '[StateManager.notify] keys должен быть типа string | string[]';
    expect(() => localStore.notify({ key: 'text' })).toThrow(result6);

    // 7. Передан массив с ключами несуществующих моделей
    const result7 = '[StateManager.notify] моделей с ключами: "isNotExists" не существует';
    expect(() => localStore.notify(['data1', 'isNotExists'])).toThrow(result7);

    // 8. Передан массив с ключами несуществующих моделей + Ключ невалидного типа
    const result8 = '[StateManager.notify] keys должен быть типа string | string[]';
    expect(() => localStore.notify(['data1', 'isNotExists', false, []])).toThrow(result8);
});

test('[StateManager]:: Notify Work listener -> Unit[1]', () => {
    const localStore = new StateManager('local-store-noty-1', { data1: 'value_1', data2: { i: 123, j: 'abc' } });
    // 9. Вызов прослушивателя при изменении одного ключа
    let chagedData;
    localStore.subscribe('data1', (state) => chagedData = state);
    localStore.setState({ data1: 'updated_value' });
    const result1 = {
        data1: {
            value: 'updated_value', [KEY_SOURCE]: 'data1', [STORE_ID_KEY]: 'store/local-store-noty-1',
        }
    };
    expect(chagedData).toEqual(result1);
});

test('[StateManager]:: Notify Work listener -> Unit[2]', () => {
    const localStore = new StateManager('local-store-noty-2', { data1: 'value_1', data2: { i: 123, j: 'abc' } });

    // 10. Вызов прослушивателей при изменении нескольких полей
    let changedData;
    localStore.subscribe(['data1', 'data2'], (state) => {
        changedData = state;            
    });
    localStore.setState({ data1: 'updated_value', data2: 'another_value' });
    const result1 = {
        data1: { value: 'updated_value', [KEY_SOURCE]: 'data1', [STORE_ID_KEY]: 'store/local-store-noty-2' },
        data2: { value: 'another_value', [KEY_SOURCE]: 'data2', [STORE_ID_KEY]: 'store/local-store-noty-2' }
    };
    setTimeout(() => {
        expect(changedData).toEqual(result1);
    }, 0)
});