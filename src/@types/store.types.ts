
export type ChunkStateData<Store> = Partial<{ [K in keyof Store]: Store[K] }>
export type Listener<T> = (state: ChunkStateData<T>) => void