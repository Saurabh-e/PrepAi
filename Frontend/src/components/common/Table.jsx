import React from 'react';

export const Table = ({
  headers = [],
  children,
  className = '',
  loading = false,
  emptyMessage = 'No data available',
  renderSkeleton, // React component / function to render skeletons
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border-base bg-bg-card shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-border-base text-left text-sm">
        <thead className="bg-bg-base/40 text-xs font-semibold text-text-muted uppercase tracking-wider">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-base text-text-main">
          {loading ? (
            renderSkeleton ? (
              renderSkeleton()
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </td>
              </tr>
            )
          ) : React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
