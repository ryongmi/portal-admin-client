import { useState, useCallback, useMemo } from 'react'
import { LimitType, SortOrderType } from '@krgeobuk/core/enum';
import type { PaginateBaseOptions } from '@krgeobuk/core/interfaces';
import type { SearchFilters } from '@/types';

type PaginationQuery = PaginateBaseOptions;

interface UsePaginationProps {
  initialPage?: number
  initialLimit?: LimitType
  initialSortBy?: string
  initialSortOrder?: SortOrderType
  onParamsChange?: (params: PaginationQuery & SearchFilters) => void
}

export function usePagination({
  initialPage = 1,
  initialLimit = LimitType.THIRTY,
  initialSortBy = 'createdAt',
  initialSortOrder = SortOrderType.DESC,
  onParamsChange: _onParamsChange
}: UsePaginationProps = {}): {
  page: number;
  limit: LimitType;
  sortBy: string;
  sortOrder: SortOrderType;
  searchFilters: SearchFilters;
  goToPage: (newPage: number) => void;
  changeLimit: (newLimit: LimitType) => void;
  changeSort: (newSortBy: string, newSortOrder?: SortOrderType) => void;
  updateSearch: (filters: SearchFilters) => void;
  resetFilters: () => void;
  params: PaginationQuery & SearchFilters;
} {
  const [page, setPage] = useState<number>(initialPage)
  const [limit, setLimit] = useState<LimitType>(initialLimit)
  const [sortBy, setSortBy] = useState<string>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<SortOrderType>(initialSortOrder)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})

  const _updateParams = useCallback((newParams: Partial<PaginationQuery & SearchFilters>): void => {
    // 검색 필터 분리
    const newFilters = Object.fromEntries(
      Object.entries(newParams).filter(([key]) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(key))
    )
    
    // 상태 업데이트
    if (newParams.page !== undefined) setPage(newParams.page)
    if (newParams.limit !== undefined) setLimit(newParams.limit)
    if (newParams.sortBy !== undefined) setSortBy(newParams.sortBy)
    if (newParams.sortOrder !== undefined) setSortOrder(newParams.sortOrder)
    
    // 검색 필터 업데이트
    if (Object.keys(newFilters).length > 0) {
      setSearchFilters((prev: SearchFilters) => ({ ...prev, ...newFilters }))
    }
  }, [])

  const resetFilters = useCallback((): void => {
    setSearchFilters({})
    setPage(1)
  }, [])

  const goToPage = useCallback((newPage: number): void => {
    setPage(newPage)
  }, [])

  const changeLimit = useCallback((newLimit: LimitType): void => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  const changeSort = useCallback((newSortBy: string, newSortOrder?: SortOrderType): void => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder ?? (sortBy === newSortBy && sortOrder === SortOrderType.DESC ? SortOrderType.ASC : SortOrderType.DESC))
    setPage(1)
  }, [sortBy, sortOrder])

  const updateSearch = useCallback((filters: SearchFilters): void => {
    setSearchFilters((prev: SearchFilters) => ({ ...prev, ...filters }))
    setPage(1)
  }, [])

  return {
    // 현재 상태
    page,
    limit,
    sortBy,
    sortOrder,
    searchFilters,
    
    // 액션 함수들
    goToPage,
    changeLimit,
    changeSort,
    updateSearch,
    resetFilters,
    
    // 전체 파라미터 (useMemo로 메모이제이션)
    params: useMemo(() => ({
      page,
      limit,
      sortBy,
      sortOrder,
      ...searchFilters
    }), [page, limit, sortBy, sortOrder, searchFilters])
  }
}