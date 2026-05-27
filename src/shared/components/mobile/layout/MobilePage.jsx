export default function MobilePage({
  children,
  className = "",
}) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div
        className={`
          mx-auto
          w-full
          max-w-lg
          px-5
          pt-5
          pb-32
          space-y-6
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}