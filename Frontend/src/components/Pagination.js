import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  limit = 10,
  onPageChange,
  showInfo = true,
  className = ""
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return showInfo ? (
      <div className={`pagination-info ${className}`}>
        <small className="text-muted">
          Showing {totalCount} result{totalCount !== 1 ? 's' : ''}
        </small>
      </div>
    ) : null;
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className={`pagination-wrapper ${className}`}>
      {showInfo && (
        <div className="pagination-info mb-2">
          <small className="text-muted">
            Showing {startItem} to {endItem} of {totalCount} result{totalCount !== 1 ? 's' : ''}
          </small>
        </div>
      )}
      
      <BootstrapPagination className="justify-content-center">
        {/* Previous Button */}
        <BootstrapPagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {/* Page Numbers */}
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <BootstrapPagination.Ellipsis />
            ) : (
              <BootstrapPagination.Item
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </BootstrapPagination.Item>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        <BootstrapPagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </BootstrapPagination>
    </div>
  );
};

export default Pagination;
