export default function MobileSection({
  title,
  action,
  children,
}) {
  return (
    // Mengurangi space-y-4 menjadi space-y-2 agar lebih rapat
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        {/* Mengurangi ukuran font dari text-lg ke text-sm/base agar lebih proporsional */}
        <h2 className="text-sm font-semibold text-zinc-500 m-0">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}
