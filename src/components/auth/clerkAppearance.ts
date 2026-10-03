/** Dark-only Clerk card styling — mobile-concept deck tokens (app parity). */
export const clerkAuthAppearance = {
  variables: {
    colorBackground: "#0b0f1a",
    colorInputBackground: "#10162a",
    colorInputText: "#f5f7fa",
    colorText: "#f5f7fa",
    colorTextSecondary: "#9aa3b2",
    // Ocean Blue 300 — primary accent for dark glass CTAs
    colorPrimary: "#3b6ef6",
    colorDanger: "#ff5f6d",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    card: "border border-white/[0.08] bg-[var(--surface-bg,rgba(11,15,26,0.92))] shadow-2xl shadow-black/40 backdrop-blur-md",
    headerTitle: "text-foreground",
    headerSubtitle: "text-brand-400",
    socialButtonsBlockButton:
      "border border-white/10 bg-[var(--app-bg-mid,#10162a)] text-foreground hover:bg-[var(--app-bg-accent,#1a2440)]",
    formFieldInput:
      "border-white/10 bg-[var(--app-bg-mid,#10162a)] text-foreground focus:border-accent",
    footerActionLink: "text-brand-400 hover:text-brand-300",
    // Frosted glass Continue — Ocean/Marlin; mirrors `.btn-premium`
    formButtonPrimary: {
      background:
        "linear-gradient(165deg, rgba(59,110,246,0.38) 0%, rgba(34,199,224,0.20) 45%, rgba(5,7,12,0.55) 100%)",
      border: "1px solid rgba(34,199,224,0.30)",
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
        "inset 0 1px 0 rgba(34,199,224,0.30), 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(59,110,246,0.16)",
      transition:
        "background 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease",
      "&:hover": {
        background:
          "linear-gradient(165deg, rgba(0,114,206,0.46) 0%, rgba(0,94,184,0.28) 45%, rgba(2,11,28,0.55) 100%)",
        borderColor: "rgba(156,194,229,0.45)",
        boxShadow:
          "inset 0 1px 0 rgba(156,194,229,0.4), 0 10px 28px rgba(0,0,0,0.34), 0 0 28px rgba(0,114,206,0.24)",
        filter: "brightness(1.04)",
      },
      "&:active": {
        background:
          "linear-gradient(165deg, rgba(0,114,206,0.28) 0%, rgba(0,94,184,0.16) 45%, rgba(2,11,28,0.58) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(156,194,229,0.2), 0 4px 12px rgba(0,0,0,0.32)",
        filter: "brightness(0.98)",
      },
      "&:focus": {
        boxShadow:
          "inset 0 1px 0 rgba(156,194,229,0.34), 0 0 0 2px rgba(0,94,184,0.42), 0 0 24px rgba(0,114,206,0.2)",
      },
    },
    footer: { display: "none" },
  },
};
