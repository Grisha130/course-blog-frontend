export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(meta.current_page - 1)}
        disabled={meta.current_page <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Prev
      </button>
      <span className="text-sm text-gray-500">
        Page {meta.current_page} of {meta.last_page}
      </span>
      <button
        onClick={() => onPageChange(meta.current_page + 1)}
        disabled={meta.current_page >= meta.last_page}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Next
      </button>
    </div>
  );
}