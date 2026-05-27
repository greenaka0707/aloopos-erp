export default function MobilePage({
  children,
  className = "",
}) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div
        className={`
          w-full
          px-5
          pt-5
          pb-32
          space-y-5
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
