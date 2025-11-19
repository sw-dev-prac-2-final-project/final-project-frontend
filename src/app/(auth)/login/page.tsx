import LoginClient from "./LoginClient";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const rawCallback = resolvedParams.callbackUrl;

  const callbackUrl = Array.isArray(rawCallback)
    ? rawCallback[0] ?? "/"
    : typeof rawCallback === "string" && rawCallback.length > 0
    ? rawCallback
    : "/";

  return <LoginClient callbackUrl={callbackUrl} />;
}
