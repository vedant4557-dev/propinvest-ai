"use client";

interface RedFlagsListProps {
  flags: string[];
  greenFlags?: string[];
}

export function RedFlagsList({ flags, greenFlags = [] }: RedFlagsListProps) {
  if (flags.length === 0 && greenFlags.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {flags.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-900/20">
          <h3 className="mb-2 text-sm font-semibold text-rose-800 dark:text-rose-200">⚠ Red Flags</h3>
          <ul className="space-y-1.5">
            {flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-300">
                <span className="mt-1 shrink-0">•</span>{flag}
              </li>
            ))}
          </ul>
        </div>
      )}
      {greenFlags.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h3 className="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">✓ Green Flags</h3>
          <ul className="space-y-1.5">
            {greenFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <span className="mt-1 shrink-0">•</span>{flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
