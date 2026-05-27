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
        px-4
        py-4
        flex items-center gap-3
        shadow-sm
      "
    >
      <div
        className="
          h-12
          w-12
          rounded-full
          bg-zinc-100
          flex items-center justify-center
          shrink-0
        "
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[20px] font-semibold text-zinc-900 truncate">
          {title}
        </p>

        <p className="text-sm text-zinc-400 truncate">
          {subtitle}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[20px] font-bold text-zinc-900">
          {amount}
        </p>

        <p className="text-sm text-zinc-400">
          {meta}
        </p>
      </div>
    </div>
  );
}
