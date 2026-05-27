export default function MobileSection({
  title,
  action,
  children,
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}