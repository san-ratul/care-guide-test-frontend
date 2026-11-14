"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Activity, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .regex(/^\S+@\S+\.\S+$/, "Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const highlights = [
  { icon: ShieldCheck, text: "Secure JWT session with automatic refresh" },
  { icon: Activity, text: "Live analytics on doctors, patients and growth" },
  { icon: Lock, text: "Every route protected — server-side verified" },
];

export default function LoginPage() {
  const { login, status } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      toast.success("Logged in successfully");
      router.replace("/dashboard");
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Login failed. Please try again."));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-900 p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60rem 30rem at 20% 0%, rgba(13,148,136,0.35), transparent), radial-gradient(40rem 25rem at 90% 100%, rgba(56,189,248,0.25), transparent)",
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
            <Activity className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-base font-bold text-white">Care Guide</p>
            <p className="text-xs text-slate-400">Doctor Tracker</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            Manage doctors and their patients in one secure portal.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Create doctors, assign patients, track conditions, and watch growth through a
            real-time analytics dashboard.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-teal-400">
                  <item.icon className="h-4 w-4" aria-hidden />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Care Guide — internal administrative portal. Unauthorized access is prohibited.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Activity className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Care Guide</p>
              <p className="text-xs text-slate-500">Doctor Tracker</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Only authenticated administrators can access the portal.
          </p>

          {formError ? (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {formError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="admin@careguide.dev"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-[34px] text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded p-0.5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting || status === "loading"}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
            <p className="font-semibold text-slate-700">Development demo credentials</p>
            <p className="mt-1">
              email: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">admin@careguide.dev</code>{" "}
              · password: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">Admin@12345</code>
            </p>
            <p className="mt-1">Created by the backend seed script (<code className="font-mono text-[11px]">npm run seed</code>).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
