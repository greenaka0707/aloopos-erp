export default function Button({ children, variant = "primary", size = "md", loading = false, className = "", ...props }) {
  const variants = {
    primary: `
      bg-orange-500
      text-white
      hover:bg-orange-600
      focus:ring-orange-100
    `,

    secondary: `
      border
      border-slate-200
      bg-white
      text-slate-700
      hover:bg-slate-50
      focus:ring-slate-100
    `,

    ghost: `
      text-slate-600
      hover:bg-slate-100
      hover:text-slate-900
      focus:ring-slate-100
    `,

    danger: `
      bg-red-500
      text-white
      hover:bg-red-600
      focus:ring-red-100
    `,
  };

  const sizes = {
    sm: `
      h-9
      px-3
      text-sm
    `,

    md: `
      h-11
      px-5
      text-sm
    `,

    lg: `
      h-12
      px-6
      text-base
    `,
  };

  return (
    <button
      disabled={loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold
        transition-all
        duration-200
        outline-none

        focus:ring-4

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
