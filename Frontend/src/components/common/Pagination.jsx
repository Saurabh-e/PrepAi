import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers
  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(0, currentPage - 2);
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(0, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-border-base px-4 py-3 sm:px-6">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 0 || disabled}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages - 1 || disabled}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-text-muted">
            Page <span className="font-semibold text-text-main">{currentPage + 1}</span> of{' '}
            <span className="font-semibold text-text-main">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Prev button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0 || disabled}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-text-muted ring-1 ring-inset ring-border-base hover:bg-border-base/50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Numbers */}
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={disabled}
                aria-current={currentPage === p ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold focus:z-20 ${
                  currentPage === p
                    ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    : 'text-text-muted ring-1 ring-inset ring-border-base hover:bg-border-base/50 focus:outline-offset-0'
                }`}
              >
                {p + 1}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || disabled}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-text-muted ring-1 ring-inset ring-border-base hover:bg-border-base/50 focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
