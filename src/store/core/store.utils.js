
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
    if(!obj) return true;
    if(obj && typeof obj === 'object' && !Array.isArray(obj)) {
        for (const key in obj) {
            if(Object.hasOwn(obj, key)) return false;
        }
    }
    return true;
}

module.exports = {
    isEqual,
    isEmpty,
}