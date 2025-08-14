import { useState, useEffect, useCallback, useRef, memo } from 'react'
import type { SearchFilters as SearchFiltersType } from '@/types';
import Button from './Button'

interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean'
  options?: { value: string | boolean; label: string }[]
  placeholder?: string
}

interface SearchFiltersProps {
  fields: FilterField[]
  onFiltersChange: (filters: SearchFiltersType) => void
  onReset: () => void
}

const SearchFilters = memo<SearchFiltersProps>(function SearchFilters({ fields, onFiltersChange, onReset }) {
  const [filters, setFilters] = useState<SearchFiltersType>({})
  const [debouncedFilters, setDebouncedFilters] = useState<SearchFiltersType>({})
  const onFiltersChangeRef = useRef(onFiltersChange)

  // 콜백 ref 업데이트
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
  }, [onFiltersChange])

  // 디바운싱 효과
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)

    return (): void => clearTimeout(timer)
  }, [filters])

  // 디바운싱된 필터가 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    const activeFilters = Object.entries(debouncedFilters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as SearchFiltersType)

    onFiltersChangeRef.current(activeFilters)
  }, [debouncedFilters])

  const handleFilterChange = useCallback((key: string, value: string | boolean | undefined): void => {
    setFilters((prev: SearchFiltersType) => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const handleReset = useCallback((): void => {
    setFilters({})
    onReset()
  }, [onReset])

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">검색 필터</h3>
          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={handleReset}>
              초기화
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              
              {field.type === 'text' && (
                <input
                  type="text"
                  value={String(filters[field.key] || '')}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              )}
              
              {field.type === 'select' && (
                <select
                  value={String(filters[field.key] || '')}
                  onChange={(e) => handleFilterChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">전체</option>
                  {field.options?.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === 'boolean' && (
                <select
                  value={filters[field.key] === undefined ? '' : String(filters[field.key])}
                  onChange={(e) => handleFilterChange(field.key, e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">전체</option>
                  <option value="true">예</option>
                  <option value="false">아니오</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
});

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;