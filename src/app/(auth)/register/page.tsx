import RegisterClient from "./RegisterClient";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const rawCallback = resolvedParams.callbackUrl;

  const callbackUrl = Array.isArray(rawCallback)
    ? rawCallback[0] ?? "/"
    : typeof rawCallback === "string" && rawCallback.length > 0
    ? rawCallback
    : "/";

  return <RegisterClient callbackUrl={callbackUrl} />;
}
