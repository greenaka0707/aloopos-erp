import { Menu } from "lucide-react";

export default function MobileHeader({
  title,
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <button
        className="
          h-14
          w-14
          rounded-2xl
          bg-white
          border border-zinc-200
          flex items-center justify-center
          shadow-sm
        "
      >
        <Menu size={24} />
      </button>

      <div>
        <p className="text-sm text-zinc-400">
          Welcome back
        </p>

        <h1 className="text-2xl font-bold text-zinc-900">
          {title}
        </h1>
      </div>
    </div>
  );
}