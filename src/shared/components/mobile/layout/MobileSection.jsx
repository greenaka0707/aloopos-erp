export default function MobileSection({
  title,
  action,
  children,
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}
