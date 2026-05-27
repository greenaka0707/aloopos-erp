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
        rounded-[26px]
        px-4
        py-3
        flex items-center gap-3
        shadow-[0_1px_4px_rgba(0,0,0,0.03)]
      "
    >
      <div
        className="
          h-11
          w-11
          rounded-full
          bg-zinc-50
          flex items-center justify-center
          shrink-0
        "
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-zinc-900 truncate">
          {title}
        </p>

        <p className="text-sm text-zinc-500 truncate">
          {subtitle}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-lg font-semibold text-zinc-900">
          {amount}
        </p>

        <p className="text-sm text-zinc-400">
          {meta}
        </p>
      </div>
    </div>
  );
}
