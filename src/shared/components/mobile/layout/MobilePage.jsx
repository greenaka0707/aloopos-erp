export default function MobilePage({
  children,
  className = "",
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div
        className={`
          mx-auto 
          w-full 
          max-w-sm 
          px-4      // Gunakan px-4, jangan px-5 (lebih rapat)
          pt-4      // Gunakan pt-4, jangan pt-5
          pb-8      // Gunakan pb-8, jangan pb-32 (terlalu jauh ke bawah)
          space-y-4 // Gunakan space-y-4, jangan space-y-5
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
