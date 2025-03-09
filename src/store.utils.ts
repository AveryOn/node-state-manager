import { Listener } from "./@types/store.types";


// Проверка равенства данных между собой
function isEqual(data1: any, data2: any) {
    // Проверка на NaN
    if ((data1 !== data1) && (data2 !== data2)) return true;
    // Проверка на null;
    if (data1 === null && (data1 === data2)) return true;
    // Строгая проверка на равенство примитивов
    if (data1 === data2) return true;
    // Проерка сложных данных
    if (typeof data1 === 'object') {
        return JSON.stringify(data1) === JSON.stringify(data2);
    }
    return false;
}


// Проеряет существование ключей объекта
function isEmpty<T extends Record<string, any>>(obj: T) {
    if (!obj) return true;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const key in obj) {
            if (Object.hasOwn(obj, key)) return false;
        }
    }
    return true;
}

// Поиск перекрывающихся по методам зависимостей
/* 
    Приходит структура данных вида:
    {
        [key1: string]: Listener[],
        [key2: string]: Listener[],
        [key3: string]: Listener[],
    }
    Нужно найти ключи, которые имеют общих (перекрывающиеся) слушателей
    В качестве опорных ключей от которых нужно отталкиваться для поиска приходит 
    аргумент pivotKeys - массив ключей модлей
*/
function findDependency<T>(structure: Partial<Record<keyof T, Listener<T>[]>>, pivotKeys: keyof T[]) {
    if (!structure && typeof structure !== 'object' && structure !== null) {
        throw TypeError('[findDependency] аргумент structure не установленного типа');
    }
    if (!pivotKeys || !Array.isArray(pivotKeys)) {
        throw TypeError('[findDependency] аргумент pivotKeys должен быть массивом');
    }
    try {
        // На основе опорных ключей собираем массив методов которые имеют эти ключи
        // Также убираются дубликаты, чтобы избежать лишних итераций
        const sourceMethods: Listener<T>[] = [...new Set(pivotKeys
            .map((key) => {
                return (structure as Record<string, Listener<T>[]>)[key];
            })
            .flat(1)
        )];
        // Сбор ключей, которые перекрываются по одинаковым методам
        const mergedKeys = new Set<keyof T>();
        for (const [key, methods] of Object.entries(structure)) {
            if (methods && Array.isArray(methods)) {
                sourceMethods.forEach((sourceMethod) => {
                    if (methods.includes(sourceMethod)) {
                        mergedKeys.add(key as keyof T)
                    }
                });
            }
        }
        return [...mergedKeys];
    } catch (err) {
        throw err;
    }

}

export {
    isEqual,
    isEmpty,
    findDependency,
}
