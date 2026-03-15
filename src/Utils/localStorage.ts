// src/utils/localStorage.ts

/**
 * 保存数据到 localStorage
 * @param key string 键名
 * @param value any 要保存的值（会自动序列化）
 */
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error(`[localStorage] Save error for key "${key}":`, err);
  }
};

/**
 * 从 localStorage 加载数据
 * @param key string 键名
 * @returns T | null
 */
export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    return JSON.parse(serialized) as T;
  } catch (err) {
    console.error(`[localStorage] Load error for key "${key}":`, err);
    return null;
  }
};

/**
 * 从 localStorage 删除指定键
 * @param key string 键名
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[localStorage] Remove error for key "${key}":`, err);
  }
};


export const saveBacktestTasksToLocalStorage = (tasks: string[]) => {
  try {    localStorage.setItem("runningTasks", JSON.stringify(tasks));
  }
  catch (err) {
    console.error("保存 runningTasks 到 localStorage 失败:", err);
  }
} 

