export default function Tabs({ tabs = [], value, onChange }) {
  return (
    <div
      className="
        flex
        items-center
        gap-8
        border-b
        border-slate-200
      "
    >
      {tabs.map((tab) => {
        const active = value === tab;

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`
              relative
              pb-3
              text-sm
              font-medium
              transition
              ${active ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}
            `}
          >
            {tab}

            {/* ACTIVE LINE */}

            {active && (
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-full
                  rounded-full
                  bg-blue-600
                "
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
