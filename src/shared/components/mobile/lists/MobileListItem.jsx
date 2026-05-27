export default function MobileListItem({
  icon,
  title,
  subtitle,
  value,
  meta,
  badge,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        min-h-[92px]
        rounded-[30px]
        bg-white
        border border-zinc-100
        px-5
        py-4
        flex items-center gap-4
        shadow-sm
        active:scale-[0.99]
        transition
      "
    >
      {icon && (
        <div
          className="
            h-16
            w-16
            rounded-full
            bg-zinc-100
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0 text-left">
        <p className="text-xl font-semibold text-zinc-900 truncate">
          {title}
        </p>

        {subtitle && (
          <p className="text-base text-zinc-400 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        {value && (
          <p className="text-xl font-semibold text-zinc-900">
            {value}
          </p>
        )}

        {meta && (
          <p className="text-sm text-zinc-400">
            {meta}
          </p>
        )}

        {badge}
      </div>
    </button>
  );
}