const { isEqual, isEmpty } = require("./store.utils");

const STORE_ID_KEY = 'uid';
const KEY_SOURCE = 'key';
const STATE = 'state';

const confReturnedProxyKey = {
    get: function (target, prop, receiver) {
        return target[prop];
    },
    set: function (target, prop, value, receiver) {
        target[prop] = value;
        // Обновление зависимости в хранилище
        if (!StateManager.instances[target[STORE_ID_KEY]]) return void console.error(`Хранилище ${target[STORE_ID_KEY]} не доступно`);
        StateManager.instances[target[STORE_ID_KEY]][STATE][target[KEY_SOURCE]] = value;
        return true;
    },
}

const configProxyState = {
    get: function (target, prop, receiver) {
        if (prop in target) {
            return target[prop];
        }
        else {
            return void 0;
        }
    },
    set: function (target, prop, value, receiver) {
        target[prop] = value;
        return true;
    },
    has: function (target, prop) {
        if (target.hasOwn(target, prop)) return true;
    },
    deleteProperty: function (target, prop) {
        if (target[prop]) Reflect.deleteProperty(target, prop);
        else return void 0;
    },
    apply: function (target, thisArg, argumentsList) {
        console.log(`Вызов функции с аргументами: ${argumentsList}`);
        return target.apply(thisArg, argumentsList);
    },
}

// Форматирование Uid экземпляра стора для его хранения в хэше instances
function normalizeUid(uid) {
    if (uid) return `store/${uid}`;
    else {
        return `store/${Date.now()}`;
    }

}

// Создает Proxy обертку над элементом стора
function createProxyInner(key) {
    if (!key || typeof key === 'undefined') {
        throw new Error(`[${createProxyInner.name}] key обязательный аргумент!`);
    }
    if (typeof key !== 'string') {
        throw new Error(`[${createProxyInner.name}] key должен быть типа string`);
    }
    if (!Object.hasOwn(this.state, key)) return undefined;
    return new Proxy({
        value: this.state[key],
        [KEY_SOURCE]: key,
        [STORE_ID_KEY]: this.uid,
    }, confReturnedProxyKey);
}

class StateManager {
    static instances = {};
    listenerMap = null;
    uid = null;
    state = null;
    constructor(uid = '', state = {}) {
        if (!uid || typeof uid !== 'string') uid = normalizeUid();
        this.uid = normalizeUid(uid);
        this.state = new Proxy(state, configProxyState);
        this.listenerMap = {};
        StateManager.instances[this.uid] = this;
    }

    // Установить состояние
    setState(newState) {
        try {
            if (!StateManager.instances[this.uid]) return void console.error(`Хранилище ${this.uid} не доступно`);
            if (typeof newState === 'undefined') throw ReferenceError('[StateManager.setState] newState обязательный аргумент');
            if (newState === null || typeof newState !== 'object' || Array.isArray(newState)) {
                throw new TypeError('[StateManager.setState] аргумент newState должен быть типа "object"')
            }
            // Если объект newState пустой, то выходим из функции
            if (isEmpty(newState)) return void 0;
            // Делаем снимок тех ключей параметра newState, которые есть в фактическом this.state
            // Для того чтобы сравнить есть ли изменения в передаваемых данных
            let newLen = 0;
            let rootLen = 0;
            const mergedKeys = [];  // Перекрывающиеся ключи newState и this.state
            const snapshotOwn = Object.keys(newState).reduce((acc, key) => {
                newLen++;
                if (Object.hasOwn(this.state, key)) {
                    rootLen++;
                    mergedKeys.push(key);
                    acc[key] = this.state[key];
                }
                // На месте вносим новые изменения в исходный state
                this.state[key] = newState[key];
                return acc;
            }, {});
            // если исходные и новые данные равны, то игнорируем дальнейшие действия, 
            // т.к это считается ложным вызовом. (newLen !== rootLen - Помогает избежать лишнего вызова isEqual если данные отличаются на кол-во ключей, т.к итак понятно, что данные уже не равны)
            if (newLen === rootLen && isEqual(snapshotOwn, newState)) {
                return void 0;
            }
            
            // Если различия в данных есть, то нужно уведомить всех зависимых от этих данных слушателей, о внесенных изменениях
            else {
                for (const key of mergedKeys) {
                    // Если значения перекрывающихся ключей разные, то уведомляем слушателя, связанного с этим ключем
                    // Если нет, то пропускаем итерацию, чтобы лишний раз не триггерить другие слушатели, которые связаны с этими же данными
                    if (!isEqual(snapshotOwn[key], newState[key])) {
                        this.notify(key);
                    }
                    else continue;
                }
            }
            return void 0;
        } catch (err) {
            throw err;
        }
    }

    // Получить данные стейта
    getState(request=undefined) {
        if (!StateManager.instances[this.uid]) return void console.error(`Хранилище ${this.uid} не доступно`);
        if(typeof request !== 'string' && !Array.isArray(request) && typeof request !== 'undefined') {
            throw TypeError('[StateManager.getState] параметр request должен быть типа string[] | string | undefined');
        }
        if (request) {
            // Если request - массив ключей объекта state
            if (Array.isArray(request) && request.length > 0) {
                return request.reduce((acc, key) => {
                    if(typeof key !== 'string') {
                        throw TypeError('[StateManager.getState] параметр request должен быть типа string[] | string | undefined');
                    }
                    // Если такой ключ существует в стейте
                    if(Object.hasOwn(this.state, key)) {
                        acc[key] = createProxyInner.apply(this, [key]);
                    }
                    return acc;
                }, {});
            }
            // Если request - строка с ключем который нужно получить
            else if (request && typeof request === 'string') {
                if(Object.hasOwn(this.state, request)) {
                    return createProxyInner.apply(this, [request]);
                } 
                else return void 0; 
            }
        }
        // Если аргуенты не были переданы получаем все данные стора
        else {
            return Object.keys(this.state).reduce((acc, key) => {
                acc[key] = createProxyInner.apply(this, [key]);
                return acc;
            }, {});
        }
    }

    // Подписаться на обновления модели
    subscribe(target, listener) {
        try {
            if (!StateManager.instances[this.uid]) return void console.error(`Хранилище ${this.uid} не доступно`);
            if (!target && (typeof target === 'undefined' || typeof target === 'string')) throw new Error('[StateManager.subscribe] target - обязательный аргумент');
            // В случае если цель отслеживания одна
            if (typeof target === 'string') {
                // Если модель с таким именем не существует
                if (!Object.hasOwn(this.state, target)) throw new Error(`[StateManager.subscribe] Модель "${target}" отсутствует в хранилище`);
                // Добавляется в таблицу имя текущей модели наблюдения и соответствующий ей обработчик 
                if (listener) {
                    if (!this.listenerMap[target]) {
                        this.listenerMap[target] = [listener];
                    }
                    else {
                        if (!this.listenerMap[target].includes(listener)) {
                            this.listenerMap[target].push(listener)
                        }
                    }
                    return 1;
                }
                else return 0;
            }
            // В случае если целей для отслеживания больше чем 1
            else if (Array.isArray(target) && target.length > 0) {
                const notExistsKeys = [];
                for (let i = 0; i < target.length; i++) {
                    const key = target[i];
                    // Если хотябы один из ключей не является валидной строкой то выдает ошибку
                    if (!key || typeof key !== 'string') {
                        throw new Error(`[StateManager.subscribe] Аргумент target должен быть типа string | string[]`);
                    }
                    // Если модель с таким именем не существует
                    if (!Object.hasOwn(this.state, key)) {
                        notExistsKeys.push(key);
                        continue;
                    }
                    // Если по такому ключу уже существует обработчик, то пока ничего не делаем 
                    if (typeof this.listenerMap[key] === 'function') { }
                    /* Если все "Если" прошли успешно, то устанавливаем связь "ключ: значение", 
                    где "ключ" - это строковое представление модели состояния, а "значение" - это массив обработчиков, 
                    которые будут вызываться всякий раз, когда модель изменяется             */
                    if (listener) {
                        if (this.listenerMap[key]) {
                            if (!this.listenerMap[key].includes(key)) {
                                this.listenerMap[key].push(listener);
                            }
                            else continue;
                        } else {
                            this.listenerMap[key] = [listener];
                        }
                    }
                }
                /* Если за время прохода по списку ключей был обнаржуен хотябы один ключ 
                    который не соответствует существующей модели, то выдает ошибку           */
                if (notExistsKeys.length > 0) {
                    throw new Error(`[StateManager.subscribe] Модели состояния с ключами "${notExistsKeys.join('", "')}" не существуют`);
                }
                return 1;
            }
            // Если traget не установленного типа
            else {
                throw new Error(`[StateManager.subscribe] Аргумент target должен быть типа string | string[]`);
            }
        } catch (err) {
            throw err;
        }
    }

    // Уведомить слушателей
    notify(keys) {
        if (!StateManager.instances[this.uid]) return void console.error(`Хранилище ${this.uid} не доступно`);
        // Если keys не является допустимым типом
        if (typeof keys !== 'string' && !Array.isArray(keys) && typeof keys !== 'undefined') {
            throw TypeError('[StateManager.notify] keys должен быть типа string | string[]');
        }
        let state;
        const isNotExists = [];
        // Доп проверка на то, является ли каждый переданный key массива валидной строкой и определяет ли он существующую модель
        Array.isArray(keys) && keys.forEach((key) => {
            if(typeof key !== 'string') {
                throw TypeError('[StateManager.notify] keys должен быть типа string | string[]');
            }
            if(!Object.hasOwn(this.state, key)) {
                isNotExists.push(key);
            }
        });
        // Если хотябы один ключ в массиве не определяет существующую модель, то поднимается ошибка
        if(isNotExists.length > 0) throw new Error(`[StateManager.notify] моделей с ключами: "${isNotExists.join('", "')}" не существует` );
 
        // Если аргумент keys передан не был, то оповещаются все слушатели
        if (!keys) state = this.getState();
        else state = this.getState(keys);
        for (const key of Object.keys(this.listenerMap)) {
            if (Array.isArray(this.listenerMap[key])) {
                for (const listener of this.listenerMap[key]) {
                    listener(state);
                }
            }
        }
        return void 0;
    }

    // Сбросить все слушатели
    resetListeners() {
        this.listenerMap = {};
    }

    // Деактивация существующего стора. По итогу он удаляется из списка экземпляров и при дальнейших попытках 
    // взаимодействовать с его данными, будет подниматься ошибка о том что экземпляр не доступен  
    destoy() {
        if (!StateManager.instances[this.uid]) return void console.error(`Хранилище ${this.uid} не доступно`);
        Reflect.deleteProperty(StateManager.instances, this.uid);
    }
}

module.exports = {
    StateManager,
    confReturnedProxyKey,
    STORE_ID_KEY,
    KEY_SOURCE,
    STATE,
    normalizeUid,
    createProxyInner,
};