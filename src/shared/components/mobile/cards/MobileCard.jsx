export default function MobileCard({
  children,
  className = "",
  padding = "p-4",
  // Tambahkan prop maxWidth untuk kontrol fleksibel
  maxWidth = "max-w-sm", 
}) {
  return (
    <div
      className={`
        w-full
        ${maxWidth}
        mx-auto
        rounded-2xl            // Mengubah ke 2xl agar lebih modern & tidak terlalu bulat
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
