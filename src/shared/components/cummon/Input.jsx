export default function Input({
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`
        h-10
        w-full
        rounded-md
        border
        border-slate-300
        bg-white
        px-3
        text-sm
        outline-none
        transition
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-100
        ${className}
      `}
    />
  );
}
