
/**
 * Часть снимка состояния. Это объект который может содержать любые ключи из общего стейта
 */
export type ChunkStateData<Store> = Partial<{ [K in keyof Store]: Store[K] }>

/**
 * Общий интерфейс данных стейта обернутых реактивной оболочкой.
 * * Для чтения/обновления реактивных моделей используется ключ `value`
 */
export type StateItemRef<T> = { [K in keyof T]: { value: T[K], key: K, uid: string } };

/**
 * Слушатель события. В коллбэк передается актуальный снимок стейта
 */
export type Listener<T> = (state: StateItemRef<T>) => void