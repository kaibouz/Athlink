/** Dark-theme Clerk card styling aligned with AthlinkPro surfaces */
export const clerkAuthAppearance = {
  variables: {
    colorBackground: "#121826",
    colorInputBackground: "#0b0f1a",
    colorInputText: "#f5f7fa",
    colorText: "#f5f7fa",
    colorTextSecondary: "#9aa3b2",
    colorPrimary: "#3b82f6",
    colorDanger: "#ff5f6d",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    card: "border border-white/[0.08] bg-[#121826] shadow-2xl shadow-black/40",
    headerTitle: "text-foreground",
    headerSubtitle: "text-brand-400",
    socialButtonsBlockButton:
      "border border-white/10 bg-[#0b0f1a] text-foreground hover:bg-[#10162a]",
    formFieldInput:
      "border-white/10 bg-[#0b0f1a] text-foreground focus:border-brand-500",
    footerActionLink: "text-brand-400 hover:text-brand-300",
    // "Secured by Clerk" + "Development mode" — not the sign-in/sign-up switch (footerAction)
    footer: { display: "none" },
  },
};
