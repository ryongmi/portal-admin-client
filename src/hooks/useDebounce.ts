import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 *
 * 사용자 입력과 같이 빠르게 변경되는 값을 디바운싱하여
 * 마지막 변경 후 일정 시간이 지난 후에만 값을 업데이트합니다.
 *
 * @param value - 디바운싱할 값
 * @param delay - 지연 시간 (밀리초, 기본값: 500ms)
 * @returns 디바운싱된 값
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // API 호출
 *     fetchData(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 *
 * return (
 *   <input
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *   />
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 타이머 설정: delay 후에 값 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 다음 effect 실행 전 또는 컴포넌트 언마운트 시 타이머 취소
    return (): void => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
