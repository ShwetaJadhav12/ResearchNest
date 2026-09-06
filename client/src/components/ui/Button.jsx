export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const styles = {
    primary:
      "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-lg hover:shadow-violet-500/30",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700 shadow-xs",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    outline:
      "border border-violet-200 bg-violet-50/60 text-violet-700 hover:bg-violet-100",
  };

  return (
    <button
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}