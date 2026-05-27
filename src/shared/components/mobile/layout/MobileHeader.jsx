import { Menu } from "lucide-react";

export default function MobileHeader({
  title,
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        className="
          h-11
          w-11
          rounded-2xl
          bg-white
          border border-zinc-100
          flex items-center justify-center
          shadow-[0_1px_4px_rgba(0,0,0,0.03)]
          shrink-0
        "
      >
        <Menu size={20} />
      </button>

      <div>
        <p className="text-sm text-zinc-400">
          Welcome back
        </p>

        <h1 className="text-2xl font-semibold text-zinc-900 leading-tight">
          {title}
        </h1>
      </div>
    </div>
  );
}
