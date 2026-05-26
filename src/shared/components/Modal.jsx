export default function Modal({ open, onClose, title, children }) {
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
        backdrop-blur-sm
      "
    >
      {/* ===================================================== */}
      {/* BACKDROP */}
      {/* ===================================================== */}

      <div className="absolute inset-0" onClick={onClose} />

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}

      <div
        className="
          relative
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
      >
        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-semibold
                text-slate-900
              "
            >
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            ✕
          </button>
        </div>

        {/* ===================================================== */}
        {/* CONTENT */}
        {/* ===================================================== */}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
