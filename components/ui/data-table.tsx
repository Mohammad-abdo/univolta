"use client";

import { useState, useEffect, ReactNode } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, getLanguage } from "@/lib/i18n";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: FilterOption[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filters = [],
  pagination,
  emptyMessage = "No data found",
  className = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1);

  // Initialize filter values
  useEffect(() => {
    const initialFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = "all";
    });
    setFilterValues(initialFilters);
  }, [filters]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(term);
        })
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      const filterValue = filterValues[filter.key];
      if (filterValue && filterValue !== "all") {
        filtered = filtered.filter((item) => {
          const value = item[filter.key as keyof T];
          // Handle boolean values
          if (typeof value === "boolean") {
            return String(value) === filterValue;
          }
          return String(value) === filterValue;
        });
      }
    });

    setFilteredData(filtered);

    // Reset to first page when filters change
    if (pagination && (searchTerm || Object.values(filterValues).some(v => v !== "all"))) {
      setCurrentPage(1);
      pagination.onPageChange(1);
    }
  }, [data, searchTerm, filterValues, searchKeys, filters]);

  // Calculate pagination
  const pageSize = pagination?.pageSize || 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination && filteredData.length > pageSize
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (pagination) {
      pagination.onPageChange(newPage);
    }
  };

  return (
    <div className={`space-y-3 md:space-y-4 ${className} w-full overflow-x-hidden`}>
      {/* Search and Filters */}
      {(searchable || filters.length > 0) && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            {searchable && (
              <div className="flex-1 relative w-full">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 ${getLanguage() === "ar" ? "right-2 md:right-3" : "left-2 md:left-3"}`} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce] focus:border-transparent text-sm md:text-base ${getLanguage() === "ar" ? "pr-8 md:pr-10 pl-3 md:pl-4" : "pl-8 md:pl-10 pr-3 md:pr-4"} py-2`}
                />
              </div>
            )}
            {filters.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 md:py-2"
                >
                  <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {t("filter")}
                </Button>
              </div>
            )}
          </div>
          {showFilters && filters.length > 0 && (
            <div className="mt-3 md:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={filterValues[filter.key] || "all"}
                    onChange={(e) =>
                      setFilterValues({ ...filterValues, [filter.key]: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce] text-sm md:text-base"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table - Desktop */}
      <div className="bg-white rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="text-gray-500">{t("loading")}</div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 md:px-6 py-3 md:py-4 text-sm">
                        {column.render
                          ? column.render(item)
                          : String(item[column.key as keyof T] || "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-sm text-gray-500">{t("loading")}</div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 p-3 space-y-2.5">
              {columns
                .filter((col) => col.key !== "actions")
                .map((column) => (
                  <div
                    key={column.key}
                    className="flex flex-col gap-1.5 pb-2 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase">{column.header}:</span>
                    <div className="text-sm text-gray-900 break-words">
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] || "-")}
                    </div>
                  </div>
                ))}
              {columns.find((col) => col.key === "actions") && (
                <div className="pt-2 border-t border-gray-200 flex justify-end flex-wrap gap-2">
                  {columns.find((col) => col.key === "actions")?.render?.(item)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-white rounded-lg shadow flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="text-xs md:text-sm text-gray-700 text-center sm:text-left">
            <span className="hidden sm:inline">
              {t("showing")} {startIndex + 1} {t("to")} {Math.min(endIndex, filteredData.length)} {t("of")}{" "}
              {filteredData.length} {t("results")}
            </span>
            <span className="sm:hidden">
              {currentPage}/{totalPages}
            </span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-xs px-2 md:px-3 py-1 md:py-2 h-8 md:h-9"
            >
              <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline ml-1">{t("previous")}</span>
            </Button>
            <span className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-700 whitespace-nowrap">
              {t("page")} {currentPage} {t("of")} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="text-xs px-2 md:px-3 py-1 md:py-2 h-8 md:h-9"
            >
              <span className="hidden md:inline mr-1">{t("next")}</span>
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

