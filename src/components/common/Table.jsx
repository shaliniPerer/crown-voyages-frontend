import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const Table = ({ 
  columns = [], 
  data = [], 
  onRowClick, 
  emptyMessage = 'No data available',
  loading = false,
  sortable = false,
  hoverable = true,
  striped = false
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (columnKey) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const sortedData = getSortedData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gold-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-luxury">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={`${column.headerClassName || ''} ${sortable && column.sortable !== false ? 'cursor-pointer select-none' : ''}`}
                onClick={() => sortable && column.sortable !== false && handleSort(column.accessor)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {sortable && column.sortable !== false && sortConfig.key === column.accessor && (
                    <span className="text-gold-500">
                      {sortConfig.direction === 'asc' ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer' : ''} 
                  ${hoverable ? 'hover:bg-luxury-lighter' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-luxury-lighter/30' : ''}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.cellClassName || ''}>
                    {column.render 
                      ? column.render(row, rowIndex) 
                      : row[column.accessor] !== undefined 
                        ? row[column.accessor] 
                        : '-'
                    }
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-12">
                <div className="flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;