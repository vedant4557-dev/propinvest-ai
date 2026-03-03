"use client";

interface RedFlagsListProps {
  flags: string[];
}

export function RedFlagsList({ flags }: RedFlagsListProps) {
  if (flags.length === 0) return null;

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
      <h3 className="mb-2 text-sm font-semibold text-rose-800 dark:text-rose-200">
        Red Flags
      </h3>
      <ul className="space-y-1 text-sm text-rose-700 dark:text-rose-300">
        {flags.map((flag, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
            {flag}
          </li>
        ))}
      </ul>
    </div>
  );
}
