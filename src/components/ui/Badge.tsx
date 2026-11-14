import { cn } from "@/lib/utils";
import type { PatientCondition, PatientStatus } from "@/types";

type Tone = "teal" | "blue" | "amber" | "rose" | "violet" | "slate" | "emerald" | "sky" | "orange";

const toneClasses: Record<Tone, string> = {
  teal: "bg-teal-50 text-teal-700 ring-teal-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

export function Badge({
  tone = "slate",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

const conditionTones: Record<PatientCondition, Tone> = {
  hypertension: "rose",
  diabetes: "violet",
  asthma: "sky",
  cardiac: "rose",
  orthopedic: "amber",
  dermatology: "orange",
  neurological: "blue",
  other: "slate",
};

const statusTones: Record<PatientStatus, Tone> = {
  active: "emerald",
  recovering: "sky",
  critical: "rose",
  discharged: "slate",
};

export function ConditionBadge({ condition }: { condition: PatientCondition }) {
  return <Badge tone={conditionTones[condition]}>{condition}</Badge>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <Badge tone={statusTones[status]}>
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          status === "critical" ? "bg-rose-500" : status === "recovering" ? "bg-sky-500" : status === "active" ? "bg-emerald-500" : "bg-slate-400"
        )}
        aria-hidden
      />
      {status}
    </Badge>
  );
}

export function SpecializationBadge({ value, className }: { value: string; className?: string }) {
  return <Badge tone="teal" className={className}>{value}</Badge>;
}
