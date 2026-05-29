import { FileText } from "lucide-react";

export default function EmptyState({
  title = "Belum ada data",
  description = "Data belum tersedia",
  action,
}) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-lg
        border
        border-slate-200
        bg-white
        px-6
        py-14
        text-center
      "
    >
      <div
        className="
          mb-4
          rounded-full
          bg-slate-100
          p-3
          text-slate-400
        "
      >
        <FileText size={24} />
      </div>

      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
