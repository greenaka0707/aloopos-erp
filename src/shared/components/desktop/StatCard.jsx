export default function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-slate-200
        bg-white
        p-4
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </h3>
        </div>

        {icon}
      </div>
    </div>
  );
}
