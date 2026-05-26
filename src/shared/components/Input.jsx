export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`
        h-11
        w-full
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        text-sm
        text-slate-900
        outline-none
        transition

        placeholder:text-slate-400

        focus:border-blue-500
        focus:ring-4
        focus:ring-blue-100

        disabled:bg-slate-100
        disabled:text-slate-400

        ${className}
      `}
      {...props}
    />
  );
}
