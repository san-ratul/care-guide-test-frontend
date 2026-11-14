import { cn, initials } from "@/lib/utils";

const palette = [
  "bg-teal-100 text-teal-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

export function Avatar({ name, className }: { name: string; className?: string }) {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tone = palette[hash % palette.length];

  return (
    <div
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        tone,
        className
      )}
    >
      {initials(name) || "?"}
    </div>
  );
}
