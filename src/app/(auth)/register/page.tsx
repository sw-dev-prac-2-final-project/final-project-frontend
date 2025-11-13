"use client";

import { FormEvent, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .trim()
  .replace(/\/$/, "");

type RegisterFormState = {
  name: string;
  tel: string;
  email: string;
  password: string;
  role: "staff" | "admin";
};

type RegisterResponse = {
  success: boolean;
  msg?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    tel: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const callbackUrl = useMemo(
    () => searchParams?.get("callbackUrl") ?? "/",
    [searchParams]
  );

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const updateField = <Key extends keyof RegisterFormState>(
    key: Key,
    value: RegisterFormState[Key]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!apiBaseUrl) {
      setErrorMessage("API base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL.");
      return;
    }

    if (!form.name.trim() || !form.tel.trim()) {
      setErrorMessage("Name and telephone number are required.");
      return;
    }

    if (!form.email || !form.password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const registerResponse = await fetch(`${apiBaseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          tel: form.tel.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const registerJson =
        ((await registerResponse.json().catch(() => null)) ??
          {}) as RegisterResponse;

      if (!registerResponse.ok || !registerJson.success) {
        const message =
          registerJson.msg ??
          "Unable to register. Please verify your details and try again.";
        throw new Error(message);
      }

      setSuccessMessage("Account created successfully. Signing you in…");

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl,
      });

      if (loginResult?.error) {
        throw new Error(loginResult.error);
      }

      router.replace(loginResult?.url ?? callbackUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create an Account"
      subtitle="Easiest management system to stay on top of your stock"
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-secondary-color hover:underline">
            Log in
          </Link>
        </span>
      }
    >
      {status === "loading" && (
        <div className="rounded-xl border border-secondary-color-soft bg-neutral-color px-4 py-3 text-sm text-primary-color-muted">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking your session…
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="rounded-xl border border-danger-color/40 bg-danger-color/10 px-4 py-3 text-sm text-danger-color">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="rounded-xl border border-success-color/30 bg-success-color/10 px-4 py-3 text-sm text-success-color">
          {successMessage}
        </p>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <FormField
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Dream Team"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
        />

        <FormField
          label="Telephone"
          name="tel"
          autoComplete="tel"
          placeholder="+66 812-345-678"
          value={form.tel}
          onChange={(event) => updateField("tel", event.target.value)}
          required
        />

        <fieldset className="flex flex-col gap-2 text-sm font-medium text-primary-color">
          <legend>Role</legend>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm font-normal text-primary-color-muted">
              <input
                type="radio"
                name="role"
                value="staff"
                checked={form.role === "staff"}
                onChange={(event) => updateField("role", event.target.value as "staff")}
                className="h-4 w-4 border-secondary-color-soft text-secondary-color focus:ring-secondary-color"
              />
              Staff (Default)
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-normal text-primary-color-muted">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === "admin"}
                onChange={(event) => updateField("role", event.target.value as "admin")}
                className="h-4 w-4 border-secondary-color-soft text-secondary-color focus:ring-secondary-color"
              />
              Admin
            </label>
          </div>
        </fieldset>

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="dreamteam@gmail.com"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-color px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-color/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Sign Up
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
};

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-primary-color">
      {label}
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="rounded-xl border border-secondary-color-soft px-4 py-3 text-sm text-primary-color-muted shadow-sm transition focus:border-secondary-color focus:outline-none focus:ring-2 focus:ring-secondary-color-soft"
      />
    </label>
  );
}
