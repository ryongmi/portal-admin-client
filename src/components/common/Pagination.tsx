import { LimitType } from '@krgeobuk/core/enum';
import type { PaginatedResultBase } from '@krgeobuk/core/interfaces';
import Button from './Button'

interface PaginationProps {
  pageInfo: PaginatedResultBase
  onPageChange: (page: number) => void
  onLimitChange: (limit: LimitType) => void
}

export default function Pagination({ pageInfo, onPageChange, onLimitChange }: PaginationProps): JSX.Element {
  const { page, limit, totalItems, totalPages, hasPreviousPage, hasNextPage } = pageInfo

  const generatePageNumbers = (): number[] => {
    const pages: number[] = []
    const maxVisiblePages = 5
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()
  const pageInfoText = `${(page - 1) * limit + 1}-${Math.min(page * limit, totalItems)} / ${totalItems}개`

  const handlePreviousPage = (): void => {
    if (hasPreviousPage) {
      onPageChange(page - 1)
    }
  }

  const handleNextPage = (): void => {
    if (hasNextPage) {
      onPageChange(page + 1)
    }
  }

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onLimitChange(Number(event.target.value) as LimitType)
  }

  return (
    <nav 
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6"
      role="navigation"
      aria-label="페이지네이션 내비게이션"
    >
      {/* 페이지 정보 */}
      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <span id="pagination-info">
          {pageInfoText}
        </span>
        <div className="flex items-center space-x-2">
          <label htmlFor="limit-select" className="text-sm text-gray-600 dark:text-gray-400">
            페이지당:
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label="페이지당 표시할 항목 수 선택"
          >
            <option value={LimitType.FIFTEEN}>15개</option>
            <option value={LimitType.THIRTY}>30개</option>
            <option value={LimitType.FIFTY}>50개</option>
            <option value={LimitType.HUNDRED}>100개</option>
          </select>
        </div>
      </div>

      {/* 페이지 네비게이션 */}
      <div className="flex items-center space-x-2" role="group" aria-label="페이지 네비게이션">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePreviousPage}
          disabled={!hasPreviousPage}
          aria-label={`이전 페이지 (${page - 1}페이지)`}
        >
          이전
        </Button>

        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            size="sm"
            variant={pageNumber === page ? 'primary' : 'outline'}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`${pageNumber}페이지${pageNumber === page ? ' (현재 페이지)' : ''}`}
            aria-current={pageNumber === page ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          size="sm"
          variant="outline"
          onClick={handleNextPage}
          disabled={!hasNextPage}
          aria-label={`다음 페이지 (${page + 1}페이지)`}
        >
          다음
        </Button>
      </div>
    </nav>
  )
}