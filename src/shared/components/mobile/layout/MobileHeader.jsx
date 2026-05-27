import { ChevronLeft } from "lucide-react";

export default function MobileHeader({
  title,
  subtitle,
  onBack,
  right,
}) {
  return (
    <div className="sticky top-0 z-20 bg-zinc-50 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="
                h-10 w-10
                rounded-full
                bg-white
                border border-zinc-200
                flex items-center justify-center
              "
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-zinc-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {right}
      </div>
    </div>
  );
}