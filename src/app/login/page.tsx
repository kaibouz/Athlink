import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // Legacy links say ?next=…; the Clerk sign-in page reads ?redirect_url=….
    if (typeof value === "string") qs.set(key === "next" ? "redirect_url" : key, value);
  }
  const query = qs.toString();
  redirect(query ? `/sign-in?${query}` : "/sign-in");
}
