import { ReactNode, memo, useMemo } from 'react';
import { SortOrderType } from '@krgeobuk/core/enum';

interface Column<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: SortOrderType;
  onSort?: (column: string) => void;
  caption?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Table = <T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  sortBy,
  sortOrder,
  onSort,
  caption,
  ...props
}: TableProps<T>): JSX.Element => {
  // 정렬된 데이터 메모이제이션 (정렬 기능이 있을 때만)
  const _processedData = useMemo(() => {
    if (!sortBy || !onSort) return data;
    // TODO: 실제 정렬 로직 구현 필요
    return data;
  }, [data, sortBy, sortOrder, onSort]);
  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100"
        role="status"
        aria-live="polite"
        aria-label="데이터 로딩 중"
      >
        <div className="p-12 text-center">
          <div 
            className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100"
        role="status"
        aria-live="polite"
        aria-label="데이터 없음"
      >
        <div className="p-12 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table 
          className="min-w-full divide-y divide-gray-200"
          role="table"
          aria-label={props['aria-label'] || `${data.length}개의 행이 있는 데이터 테이블`}
          aria-describedby={props['aria-describedby']}
          aria-rowcount={data.length}
        >
          {caption && (
            <caption className="sr-only">
              {caption}
            </caption>
          )}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr role="row">
              {columns.map((column, index) => {
                // 안정적인 헤더 key 생성
                const headerKey = `header-${String(column.key)}-${index}`;
                return (
                  <th
                    key={headerKey}
                  className={`px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                    column.sortable
                      ? 'cursor-pointer hover:bg-gray-200 transition-colors duration-150 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : ''
                  }`}
                  onClick={() => column.sortable && onSort && onSort(String(column.key))}
                  onKeyDown={(e) => {
                    if (column.sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSort(String(column.key));
                    }
                  }}
                  role="columnheader"
                  scope="col"
                  tabIndex={column.sortable ? 0 : -1}
                  aria-sort={
                    column.sortable && sortBy === String(column.key)
                      ? sortOrder === SortOrderType.ASC
                        ? 'ascending'
                        : 'descending'
                      : column.sortable
                      ? 'none'
                      : undefined
                  }
                  aria-label={
                    column.sortable
                      ? `${column.label} 컬럼 - ${
                          sortBy === String(column.key)
                            ? sortOrder === SortOrderType.ASC
                              ? '오름차순으로 정렬됨'
                              : '내림차순으로 정렬됨'
                            : '정렬 가능'
                        }`
                      : column.label
                  }
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="ml-2 flex flex-col">
                        {sortBy === String(column.key) ? (
                          <span className="text-blue-500 text-sm">
                            {sortOrder === SortOrderType.ASC ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </span>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
            {data.map((row, index) => {
              // 안정적인 key 사용 (가능한 경우 ID 사용)
              const rowKey = (row as T & { id?: string | number })?.id || index;
              return (
                <TableRow<T>
                  key={rowKey}
                  row={row}
                  columns={columns}
                  index={index}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 개별 테이블 행 컴포넌트 메모이제이션
interface TableRowProps<T> {
  row: T;
  columns: Column<T>[];
  index: number;
}

const TableRow = <T,>({ row, columns, index }: TableRowProps<T>): JSX.Element => (
  <tr
    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 focus-within:bg-blue-50"
    role="row"
    aria-rowindex={index + 1}
  >
    {columns.map((column, colIndex) => {
      // 컬럼 key를 안정적으로 생성
      const cellKey = `cell-${String(column.key)}-${colIndex}`;
      return (
        <td
          key={cellKey}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center"
          role="cell"
          aria-describedby={`${column.label}-${index}`}
        >
          {column.render
            ? column.render(row[column.key], row)
            : String(row[column.key] ?? '')}
        </td>
      );
    })}
  </tr>
);

TableRow.displayName = 'TableRow';

// 메모이제이션된 Table export
export default memo(Table) as <T = Record<string, unknown>>(
  props: TableProps<T>
) => JSX.Element;

