export default function MobileTransactionCard({
  icon,
  title,
  subtitle,
  amount,
  meta,
}) {
  return (
    <div
      className="
        bg-white
        rounded-[28px]
        px-5
        py-4
        flex items-center justify-between
        shadow-[0_1px_4px_rgba(0,0,0,0.03)]
      "
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="
            h-12
            w-12
            rounded-full
            bg-zinc-100
            flex items-center justify-center
            shrink-0
            text-zinc-700
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[17px] font-semibold text-zinc-900 truncate">
            {title}
          </p>

          <p className="text-sm text-zinc-500 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0 ml-3">
        <p className="text-[17px] font-semibold text-zinc-900">
          {amount}
        </p>

        <p className="text-sm text-zinc-400">
          {meta}
        </p>
      </div>
    </div>
  );
}
