
// Проверка равенства данных между собой
function isEqual(data1, data2) {
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
function isEmpty(obj) {
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
        [key1: string]: Array<(args: any[]) => any>,
        [key2: string]: Array<(args: any[]) => any>,
        [key3: string]: Array<(args: any[]) => any>,
    }
    Нужно найти ключи, которые имеют общие (перекрывающиеся) функции-обработчики
    В качестве опорных ключей от которых нужно отталкиваться для поиска приходит 
    аргумент pivotKeys - массив строк-ключей
*/
function findDependency(structure, pivotKeys) {
    if (!structure && typeof structure !== 'object' && structure !== null) {
        throw TypeError('[findDependency] аргумент structure не установленного типа');
    }
    if (!pivotKeys || !Array.isArray(pivotKeys)) {
        throw TypeError('[findDependency] аргумент pivotKeys должен быть массивом');
    }
    try {
        // На основе опорных ключей собираем массив методов которые имеют эти ключи
        // Также убираются дубликаты, чтобы избежать лишних итераций
        const sourceMethods = [...new Set(pivotKeys
            .map((key) => {
                return structure[key];
            })
            .flat(1)
        )];
        console.log(sourceMethods);
        // Сбор ключей, которые перекрываются по одинаковым методам
        const mergedKeys = new Set();
        for (const [key, methods] of Object.entries(structure)) {
            if (methods && Array.isArray(methods)) {
                sourceMethods.forEach((sourceMethod) => {
                    if (methods.includes(sourceMethod)) {
                        mergedKeys.add(key)
                    }
                });
            }
        }
        return [...mergedKeys];
    } catch (err) {
        throw err;
    }

}

module.exports = {
    isEqual,
    isEmpty,
    findDependency,
}