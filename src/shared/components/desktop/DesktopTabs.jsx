export default function DesktopTabs({
  tabs = [],
  value,
  onChange,
}) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex items-center gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`
              relative
              py-3
              text-sm
              whitespace-nowrap
              transition-colors
              ${
                value === tab
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }
            `}
          >
            {tab}

            {value === tab && (
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-0.5
                  w-full
                  rounded-full
                  bg-blue-600
                "
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
