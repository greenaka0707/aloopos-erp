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
        rounded-3xl
        border border-zinc-100
        bg-white
        p-4
        flex items-center gap-3
        active:scale-[0.99]
        transition
      "
    >
      {icon && (
        <div
          className="
            h-12 w-12
            rounded-full
            bg-zinc-100
            flex items-center justify-center
            shrink-0
          "
        >
          {icon}
        </div>
      )}

      <div className="flex-1 text-left min-w-0">
        <p className="font-medium text-zinc-900 truncate">
          {title}
        </p>

        {subtitle && (
          <p className="text-sm text-zinc-500 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        {value && (
          <p className="font-semibold text-zinc-900">
            {value}
          </p>
        )}

        {meta && (
          <p className="text-xs text-zinc-500">
            {meta}
          </p>
        )}

        {badge}
      </div>
    </button>
  );
}