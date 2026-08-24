import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * COMPONENT PHÂN TRANG (PAGINATION) CHUẨN GIAO DIỆN HIỆN ĐẠI
 * @param {number} currentPage - Trang hiện tại (1-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {function} onPageChange - Hàm chuyển trang
 * @param {number} totalItems - Tổng số mục dữ liệu
 * @param {number} itemsPerPage - Số mục trên mỗi trang
 * @param {string} itemLabel - Nhãn của mục (ví dụ: 'bài viết', 'bài học', 'hoạt động')
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 12,
  itemLabel = 'mục'
}) {
  if (totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo danh sách các số trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      // Tự động cuộn mượt về đầu danh sách
      const el = document.getElementById('main-content-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 pb-2 border-t border-slate-200/80">
      {/* THÔNG TIN SỐ LƯỢNG */}
      <div className="text-xs font-semibold text-slate-500 text-center sm:text-left">
        Đang xem <span className="font-black text-slate-800">{startItem} - {endItem}</span> trong tổng số <span className="font-black text-blue-700">{totalItems}</span> {itemLabel}
      </div>

      {/* CỤM NÚT ĐIỀU HƯỚNG */}
      <div className="flex items-center gap-1">
        {/* NÚT VỀ ĐẦU */}
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Trang đầu tiên"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* NÚT TRANG TRƯỚC */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed shadow-2xs flex items-center gap-1"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* CÁC SỐ TRANG */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 font-bold text-xs">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => handlePageClick(page)}
                className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                  page === currentPage
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* NÚT TRANG TIẾP */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed shadow-2xs flex items-center gap-1"
          title="Trang tiếp theo"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* NÚT ĐẾN CUỐI */}
        <button
          type="button"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Trang cuối cùng"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
