export function MobileSection({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <h2 className="text-sm font-semibold text-zinc-500">
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}
