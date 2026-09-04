/** Dark-theme Clerk card styling aligned with AthlinkPro surfaces */
export const clerkAuthAppearance = {
  variables: {
    colorBackground: "#121826",
    colorInputBackground: "#0a1220",
    colorInputText: "#f5f7fa",
    colorText: "#f5f7fa",
    colorTextSecondary: "#9aa3b2",
    // Soft silver-blue — avoids flat #3b82f6 on primary controls
    colorPrimary: "#c5d4e8",
    colorDanger: "#ff5f6d",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    card: "border border-white/[0.08] bg-[var(--surface-bg,rgba(18,24,38,0.72))] shadow-2xl shadow-black/40 backdrop-blur-md",
    headerTitle: "text-foreground",
    headerSubtitle: "text-brand-400",
    socialButtonsBlockButton:
      "border border-white/10 bg-[var(--app-bg-mid,#0a1220)] text-foreground hover:bg-[var(--app-bg-accent,#0a1628)]",
    formFieldInput:
      "border-white/10 bg-[var(--app-bg-mid,#0a1220)] text-foreground focus:border-brand-500",
    footerActionLink: "text-brand-400 hover:text-brand-300",
    // Frosted glass Continue — mirrors `.btn-premium` in globals.css (SignIn + SignUp)
    formButtonPrimary: {
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)",
      border: "1px solid rgba(255,255,255,0.18)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      color: "#f5f7fa",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: "500",
      fontSize: "0.9375rem",
      letterSpacing: "0.08em",
      height: "3.125rem",
      paddingInline: "1.5rem",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 24px rgba(0,0,0,0.28), 0 0 0 1px rgba(125,211,252,0.06)",
      transition:
        "background 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease",
      "&:hover": {
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%)",
        borderColor: "rgba(255,255,255,0.28)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.32), 0 10px 28px rgba(0,0,0,0.32), 0 0 28px rgba(148,200,255,0.18)",
        filter: "brightness(1.04)",
      },
      "&:active": {
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 4px 12px rgba(0,0,0,0.3)",
        filter: "brightness(0.98)",
      },
      "&:focus": {
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 2px rgba(197,212,232,0.35), 0 0 24px rgba(148,200,255,0.15)",
      },
    },
    // "Secured by Clerk" + "Development mode" — not the sign-in/sign-up switch (footerAction)
    footer: { display: "none" },
  },
};
