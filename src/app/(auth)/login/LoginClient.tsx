"use client";

import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";

type LoginFormState = {
  email: string;
  password: string;
};

type LoginClientProps = {
  callbackUrl: string;
};

export default function LoginClient({ callbackUrl }: LoginClientProps) {
  const router = useRouter();
  const { status } = useSession();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const updateField = <Key extends keyof LoginFormState>(
    key: Key,
    value: LoginFormState[Key]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!form.email || !form.password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.replace(result?.url ?? callbackUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Login to your Account"
      subtitle="See what is going on with your product"
      footer={
        <span>
          Not registered yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-secondary-color hover:underline"
          >
            Create an account
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

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          value={form.password}
          placeholder="••••••••"
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
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Login
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
