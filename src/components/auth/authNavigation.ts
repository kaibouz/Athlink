import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type FinalizeNavigateParams = {
  session?: { currentTask?: { key: string } | null } | null;
  decorateUrl: (url: string) => string;
};

export function createAuthFinalizeNavigate(router: AppRouterInstance) {
  return ({ session, decorateUrl }: FinalizeNavigateParams) => {
    if (session?.currentTask) {
      const destination = decorateUrl(`/onboarding/${session.currentTask.key}`);
      if (destination.startsWith("http")) {
        window.location.href = destination;
        return;
      }
      router.push(destination);
      return;
    }

    const url = decorateUrl("/app");
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };
}
