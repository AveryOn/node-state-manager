/**
 * Часть снимка состояния. Это объект который может содержать любые ключи из общего стейта
 */
export type ChunkStateData<Store> = Partial<{ [K in keyof Store]: Store[K] }>;

/**
 * Общий интерфейс данных стейта обернутых реактивной оболочкой.
 * * Для чтения/обновления реактивных моделей используется ключ `value`
 */
export type StateItemRef<T> = { [K in keyof T]: { value: T[K]; key: K; uid: string } };

/**
 * Слушатель события. В коллбэк передается актуальный снимок стейта
 */
export type Listener<T> = (state: StateItemRef<T>) => void;

export type ListenerFields<T> = keyof T | (keyof T)[] | '*' | null;

export type ListenerMap<T> = Partial<Record<keyof T, ListenerMapValue<T>[]>>;

/**
 * Тип значения хэш таблицы слушателей данных стейт менеджера
 */
export interface ListenerMapValue<T> {
  listener: Listener<T>;
  fields: ListenerFields<T>;
}

/**
 * Объект конфигураций, который расширяет поведение функции.
 */
export interface SubscribeConfig<T> {
  /**
   * ключ определеяет, какие поля стейта должны приходить в колбэке слушателя
   */
  fetch?: ListenerFields<T>;
}
