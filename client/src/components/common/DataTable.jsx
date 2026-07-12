import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle,
  emptyDescription,
  searchQuery = '',
  searchKeys = [],
  pageSize = 5,
  className = '',
}) => {
  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  // Track prev search query to reset pagination during render pass
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setCurrentPage(1);
  }

  // Handle Header Sorting Click
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      return searchKeys.some((key) => {
        const val = item[key];
        return val != null && String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Sort Data
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (aString < bString) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));



  const renderSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortConfig.key !== column.key) {
      return <ArrowUpDown size={14} className="text-text-muted opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUp size={14} className="text-primary" />
      : <ArrowDown size={14} className="text-primary" />;
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Table Container */}
      <div className="overflow-x-auto bg-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-surface-alt/70 border-b border-border/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary select-none ${col.sortable ? 'cursor-pointer group' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {renderSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border/60">
            {loading ? (
              // Table Loading Skeletons
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <Skeleton variant="text" width={col.width || '60%'} height="14px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-6 py-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx} 
                  className="hover:bg-surface-alt/30 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className="px-6 py-4 text-xs font-semibold text-text-primary"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && sortedData.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
          <span className="text-xs font-semibold text-text-secondary">
            Showing <span className="text-text-primary">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-text-primary">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="text-text-primary">{sortedData.length}</span> results
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border bg-surface text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-alt transition-colors duration-150 cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-xs text-text-muted px-1">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer
                      ${currentPage === pageNum 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'border border-border bg-surface text-text-secondary hover:bg-surface-alt'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border bg-surface text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-alt transition-colors duration-150 cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
