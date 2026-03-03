"use client";

interface RatingBadgeProps {
  rating: string;
  size?: "sm" | "md" | "lg";
}

export function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  const variant =
    rating === "A+"
      ? "emerald"
      : rating === "A"
        ? "primary"
        : rating === "B"
          ? "slate"
          : rating === "C"
            ? "amber"
            : "rose";

  const styles = {
    emerald:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
    primary:
      "bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-700",
    slate:
      "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600",
    amber:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
    rose:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-lg",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-bold ${sizeStyles[size]} ${
        styles[variant as keyof typeof styles]
      }`}
      title="Investment grade: A+ (IRR>14% & positive CF) to D (IRR<6%)"
    >
      {rating}
    </span>
  );
}
