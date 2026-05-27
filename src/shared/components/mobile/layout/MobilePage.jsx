export default function MobilePage({
  children,
  className = "",
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div
        className={`
          mx-auto
          max-w-md
          px-4
          pt-4
          pb-28
          space-y-6
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}