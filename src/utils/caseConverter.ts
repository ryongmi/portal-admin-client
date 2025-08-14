/**
 * snake_case를 camelCase로 변환 (전체 응답 객체 처리)
 */
export function snakeToCamel(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  if (typeof obj === "object") {
    const converted: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        converted[camelKey] = snakeToCamel((obj as Record<string, unknown>)[key]);
      }
    }
    return converted;
  }

  return obj;
}

/**
 * camelCase를 snake_case로 변환 (전체 요청 객체 처리)
 */
export function camelToSnake(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  if (typeof obj === "object") {
    const converted: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`
        );
        converted[snakeKey] = camelToSnake((obj as Record<string, unknown>)[key]);
      }
    }
    return converted;
  }

  return obj;
}