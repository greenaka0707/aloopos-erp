export default function MobileCard({
  children,
  className = "",
  padding = "p-4",
}) {
  return (
    <div
      className={`
        rounded-3xl
        border border-zinc-100
        bg-white
        shadow-sm
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
