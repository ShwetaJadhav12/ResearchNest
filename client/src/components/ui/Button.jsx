export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "rounded-xl px-6 py-3 font-semibold transition-all duration-300";

  const styles = {
    primary:
      "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl",
    secondary:
      "border border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}