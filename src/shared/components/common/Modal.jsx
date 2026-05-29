export default function Modal({
  open,
  onClose,
  title,
  children,
}) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          w-full
          max-w-lg
          rounded-lg
          bg-white
          shadow-xl
        "
      >
        <div
          className="
            border-b
            border-slate-200
            px-5
            py-4
          "
        >
          <h3 className="font-semibold">
            {title}
          </h3>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
