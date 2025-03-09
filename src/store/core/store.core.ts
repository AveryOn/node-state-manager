import { Listener, ChunkStateData } from '../../@types/store.types';
import { isEqual, isEmpty, findDependency } from './store.utils'

const STORE_ID_KEY = 'uid';
const KEY_SOURCE = 'key';
const STATE = 'state';

const confReturnedProxyKey = {
    get: function (target: any, prop: string, receiver: any) {
        return target[prop];
    },
    set: function (target: any, prop: string, value: any, receiver: any) {
        target[prop] = value;
        // Обновление зависимости в хранилище
        if (!StateManager.instances[target[STORE_ID_KEY]]) {
            console.error(`Хранилище ${target[STORE_ID_KEY]} не доступно`);
            return false
        }
        StateManager.instances[target[STORE_ID_KEY]][STATE][target[KEY_SOURCE]] = value;
        return true;
    },
}

const configProxyState: ProxyHandler<object> = {
    get: function (target: any, prop: any, receiver: any) {
        if (prop in target) {
            return target[prop as keyof typeof target];
        }
        else {
            return undefined;
        }
    },
    set: function (target: any, prop: any, value: any, receiver: any) {
        target[prop as keyof typeof target] = value;
        return true;
    },
    has: function (target: any, prop: any) {
        if (target.hasOwn(target, prop)) {
            return true;
        }
        return false;
    },
    deleteProperty: function (target: any, prop: any) {
        if (target[prop]) {
            return Reflect.deleteProperty(target, prop);
        }
        else return false;
    },
    apply: function (target: any, thisArg: any, argumentsList: any) {
        return target.apply(thisArg, argumentsList);
    },
}

// Форматирование Uid экземпляра стора для его хранения в хэше instances
function normalizeUid(uid: string) {
    if (uid) return `store/${uid}`;
    else {
        return `store/${Date.now()}`;
    }

}

// Создает Proxy обертку над элементом стора
function createProxyInner<T extends Record<any, any>>(this: StateManager<T>, key: string) {
    if(!this.state) {
        throw new Error('Хранилище не инициализировано');
    }
    if (!key || typeof key === 'undefined') {
        throw new Error(`[${createProxyInner.name}] key обязательный аргумент!`);
    }
    if (typeof key !== 'string') {
        throw new Error(`[${createProxyInner.name}] key должен быть типа string`);
    }
    if (this.state && !Object.hasOwn(this.state, key)) return undefined;
    return new Proxy({
        value: this.state[key],
        [KEY_SOURCE]: key,
        [STORE_ID_KEY]: this.uid,
    }, confReturnedProxyKey);
}



/**
 * Класс конструирующий экземпляры стейт менеджера
 */
class StateManager<T extends Record<string, any>> {
    static instances: { [key: string]: StateManager<any> } = {};
    listenerMap: Partial<Record<keyof T, Listener<T>[]>> | null = null;
    uid: string | null = null;
    state: T | null = null;
    constructor(uid: string, state: T) {
        if (!uid || typeof uid !== 'string') uid = normalizeUid(uid);
        if(!state) state = {} as T;

        this.uid = normalizeUid(uid);
        this.state = new Proxy(state, configProxyState) as T;
        this.listenerMap = {};
        StateManager.instances[this.uid] = this;
    }

    // Установить состояние
    setState(newState: ChunkStateData<T>) {
        try {
            if (this.uid && !StateManager.instances[this.uid]) 
                return void console.error(`Хранилище ${this.uid} не доступно`);
            
            if(!this.state)
                throw new Error('Хранилище не инициализировано');

            if (typeof newState === 'undefined') throw ReferenceError('[StateManager.setState] newState обязательный аргумент');
            if (newState === null || typeof newState !== 'object' || Array.isArray(newState)) {
                throw new TypeError('[StateManager.setState] аргумент newState должен быть типа "object"')
            }
            // Если объект newState пустой, то выходим из функции
            if (isEmpty(newState)) return undefined;
            // Делаем снимок тех ключей параметра newState, которые есть в фактическом this.state
            // Для того чтобы сравнить есть ли изменения в передаваемых данных
            let newLen = 0;
            let rootLen = 0;
            const mergedKeys: string[] = [];  // Перекрывающиеся ключи newState и this.state
            const snapshotOwn = Object.keys(newState).reduce((acc: { [key: string]: any }, key) => {
                newLen++;
                if (Object.hasOwn(this.state!, key)) {
                    rootLen++;
                    mergedKeys.push(key);
                    acc[key] = this.state![key];
                }
                // На месте вносим новые изменения в исходный state
                (this.state as Record<string, any>)[key] = newState[key];
                return acc;
            }, {});
            // если исходные и новые данные равны, то игнорируем дальнейшие действия, 
            // т.к это считается ложным вызовом. (newLen !== rootLen - Помогает избежать лишнего вызова isEqual если данные отличаются на кол-во ключей, т.к итак понятно, что данные уже не равны)
            if (newLen === rootLen && isEqual(snapshotOwn, newState)) {
                return void 0;
            }
            
            // Если различия в данных есть, то нужно уведомить всех зависимых от этих данных слушателей, о внесенных изменениях
            else {
                // const changedDataKeys = [];
                // for (const key of mergedKeys) {
                //     // Если значения перекрывающихся ключей разные, то уведомляем слушателя, связанного с этим ключом
                //     // Если нет, то пропускаем итерацию, чтобы лишний раз не триггерить другие слушатели, которые связаны с этими же данными
                //     if (!isEqual(snapshotOwn[key], newState[key])) {
                //         changedDataKeys.push(key);
                //     }
                //     else continue;
                // }
                // Запускаем уведомления для пачки определенных ключей, который по факту были изменены
                this.notify(mergedKeys);
            }
            return void 0;
        } catch (err) {
            throw err;
        }
    }

    // Получить данные стейта
    getState(request: Array<keyof T> | undefined = undefined): ChunkStateData<T> | undefined {
        if (!StateManager.instances[this.uid!]) 
            return void console.error(`Хранилище ${this.uid} не доступно`);
        if(!this.state)
            throw new Error('Хранилище не инициализировано');
        if(
            typeof request !== 'string' && 
            !Array.isArray(request) && 
            typeof request !== 'undefined'
        ) {
            throw TypeError('[StateManager.getState] параметр request должен быть типа string[] | string | undefined');
        }
        if (request) {
            // Если request - массив ключей объекта state
            if (Array.isArray(request) && request.length > 0) {
                return request.reduce((acc: ChunkStateData<T>, key: keyof T) => {
                    if(typeof key !== 'string') {
                        throw TypeError('[StateManager.getState] параметр request должен быть типа string[] | string | undefined');
                    }
                    // Если такой ключ существует в стейте
                    if(Object.hasOwn(this.state!, key)) {
                        (acc as any)[key] = createProxyInner.apply(this, [key]);
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
            return Object.keys(this.state).reduce((acc: ChunkStateData<T>, key: string) => {
                (acc as any)[key] = createProxyInner.apply(this, [key]);
                return acc;
            }, {});
        }
    }

    // Подписаться на обновления модели
    subscribe(target: keyof T | (keyof T)[], listener: Listener<T>) {
        try {
            if (!StateManager.instances[this.uid!]) 
                return void console.error(`Хранилище ${this.uid} не доступно`);
            if(!this.state)
                throw new Error('Хранилище не инициализировано');

            if (!target && (typeof target === 'undefined' || typeof target === 'string')) 
                throw new Error('[StateManager.subscribe] target - обязательный аргумент');

            // В случае если цель отслеживания одна
            if (typeof target === 'string' && target.length > 0) {
                // Если модель с таким именем не существует
                if (!Object.hasOwn(this.state, target)) 
                    throw new Error(`[StateManager.subscribe] Модель "${target}" отсутствует в хранилище`);

                // Добавляется в таблицу имя текущей модели наблюдения и соответствующий ей обработчик 
                if (listener) {
                    // Если для такой модели еще не был назначен ни один обработчик
                    if (!this.listenerMap![target] || typeof this.listenerMap![target] === 'undefined') {
                        (this.listenerMap as Record<string, Listener<T>[]>)[target] = [listener];
                    }
                    else {
                        if (!this.listenerMap![target].includes(listener)) {
                            this.listenerMap![target].push(listener)
                        }
                    }
                    return 1;
                }
                else return 0;
            }
            // В случае если целей для отслеживания больше чем 1
            else if (Array.isArray(target) && target.length > 0) {
                const notExistsKeys: string[] = [];

                for (let i = 0; i < target.length; i++) {
                    const key: keyof T = target[i];
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
                    if (typeof this.listenerMap![key] === 'function') { }
                    /* Если все "Если" прошли успешно, то устанавливаем связь "ключ: значение", 
                    где "ключ" - это строковое представление модели состояния, а "значение" - это массив обработчиков, 
                    которые будут вызываться всякий раз, когда модель изменяется             */
                    if (listener) {
                        if (this.listenerMap![key]) {
                            if (!this.listenerMap![key].includes(listener)) {
                                this.listenerMap![key].push(listener);
                            }
                            else continue;
                        } else {
                            (this.listenerMap as Record<string, Listener<T>[]>)[key] = [listener];
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
    notify(keys?: keyof T | Array<keyof T> | undefined) {
        if (!StateManager.instances[this.uid!]) 
            return void console.error(`Хранилище ${this.uid} не доступно`);
        if(!this.state)
            throw new Error('Хранилище не инициализировано');
        // Если keys не является допустимым типом
        if (typeof keys !== 'string' && !Array.isArray(keys) && typeof keys !== 'undefined') {
            throw TypeError('[StateManager.notify] keys должен быть типа string | string[]');
        }
        let state;
        const isNotExists: string[] = [];
        // Доп проверка на то, является ли каждый переданный key массива валидной строкой и определяет ли он существующую модель
        // Проверка применяется только в том случае, есди переданный keys это список моделей а не одна модель
        Array.isArray(keys) && keys.forEach((key) => {
            if(typeof key !== 'string') {
                throw TypeError('[StateManager.notify] keys должен быть типа string | string[]');
            }
            if(!Object.hasOwn(this.state!, key)) {
                isNotExists.push(key);
            }
        });
        // Если хотябы один ключ в массиве не определяет существующую модель, то поднимается ошибка
        if(isNotExists.length > 0) 
            throw new Error(`[StateManager.notify] моделей с ключами: "${isNotExists.join('", "')}" не существует` );
 
        // Если аргумент keys передан не был, то оповещаются все слушатели
        if (!keys) state = this.getState();
        else {
            // Поиск всех ключей данных, которые связаны между собой общими обработчикам с ключами в keys
            const linkedKeys = findDependency(this.listenerMap!, keys as keyof T[]);
            console.log(linkedKeys);

            
            state = this.getState(linkedKeys);
        }
        // Собираем массив обработчиков и убираем дубликаты, чтобы исключить повторного вызова обработчиков
        let listeners: Array<Listener<T>> = []
        if(this.listenerMap) {
            listeners = [...new Set(Object.values(this.listenerMap).filter(Boolean).flat(1) as Listener<T>[])];
        }
        // Вызываем все прослушиватели
        console.log(keys);
        listeners.forEach((listener) => {
            listener(state!);
        });
        return void 0;
    }

    // Сбросить все слушатели
    resetListeners() {
        this.listenerMap = {};
    }

    // Деактивация существующего стора. По итогу он удаляется из списка экземпляров и при дальнейших попытках 
    // взаимодействовать с его данными, будет подниматься ошибка о том что экземпляр не доступен  
    destoy() {
        if (!StateManager.instances[this.uid!]) 
            return void console.error(`Хранилище ${this.uid} не доступно`);
        Reflect.deleteProperty(StateManager.instances, this.uid!);
    }
}

export {
    StateManager,
    confReturnedProxyKey,
    STORE_ID_KEY,
    KEY_SOURCE,
    STATE,
    normalizeUid,
    createProxyInner,
}
