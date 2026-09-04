"use client";

import Link from "next/link";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { HowAthlinkWorks } from "@/components/landing/HowAthlinkWorks";
import { PitchingHeroVideo } from "@/components/landing/PitchingHeroVideo";
import { MarketingThemeToggle } from "@/components/layout/MarketingThemeToggle";
import { AthleteLandingBelow } from "@/components/athlete/AthleteLandingBelow";
import "./athlete-landing.css";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5.5 5.5 5.5 0 0121.5 12c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  );
}

type AthleteHomeLandingProps = {
  /** `full` = standalone page; `body` = from How-it-works / pitching video downward (for hybrid with Marketing hero). */
  variant?: "full" | "body";
};

export function AthleteHomeLanding({ variant = "full" }: AthleteHomeLandingProps) {
  const bodyOnly = variant === "body";

  return (
    <div className={bodyOnly ? "athlete-landing" : "athlete-landing min-h-full"}>
      {!bodyOnly && (
        <header className="ah-site">
          <div className="ah-wrap ah-in">
            <AthlinkProLogo href="/for-athletes" size="header" variant="monogram" tone="onGradient" priority />
            <nav className="ah-links">
              <Link className="ah-hide-m" href="#features">
                Features
              </Link>
              <Link className="ah-hide-m" href="#coaches">
                Coaches
              </Link>
              <Link className="ah-hide-m" href="#pricing">
                Pricing
              </Link>
              <Link className="ah-for-coaches" href="/for-coaches">
                I&apos;m a coach →
              </Link>
              <Link className="ah-hide-m" href="/login">
                Log in
              </Link>
              <MarketingThemeToggle />
              <Link className="ah-btn ah-btn-accent ah-btn-sm" href="/join/athlete">
                Get Started
              </Link>
            </nav>
          </div>
        </header>
      )}

      {!bodyOnly && (
        <section className="ah-hero">
          <div className="ah-wrap" style={{ position: "relative" }}>
            <svg className="ah-deco" viewBox="0 0 600 640" preserveAspectRatio="xMidYMid meet">
              <path
                d="M 40 40 C 220 90, 180 220, 340 260 S 420 420, 300 460 S 500 560, 480 600"
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1.4"
              />
              <circle cx="40" cy="40" r="4.5" fill="#22c7e0" />
              <text x="56" y="45">
                Book a coach
              </text>
              <circle cx="190" cy="140" r="4.5" fill="rgba(255,255,255,0.6)" />
              <text x="206" y="145">
                Message your coach
              </text>
              <circle cx="340" cy="260" r="4.5" fill="rgba(255,255,255,0.6)" />
              <text x="356" y="265">
                Train the session
              </text>
              <circle cx="300" cy="460" r="4.5" fill="rgba(255,255,255,0.6)" />
              <text x="316" y="465">
                Share your progress
              </text>
              <circle cx="480" cy="600" r="4.5" fill="#22c7e0" />
              <text x="410" y="628">
                Get your AI breakdown
              </text>
            </svg>
            <div className="ah-hero-inner">
              <h1>Train With Purpose.</h1>
              <h2>One Feed. Every Rep.</h2>
              <p>
                Book sessions with verified private coaches, message them directly, share your progress on
                a training feed built for athletes, and get an AI breakdown of your mechanics after every
                rep — all in one place.
              </p>
              <div className="ah-cta-row">
                <Link className="ah-btn ah-btn-accent" href="#pricing">
                  Start Free — No Credit Card Needed →
                </Link>
                <Link className="ah-btn ah-btn-ghost" href="#coaches">
                  Find a Coach Near You
                </Link>
              </div>
              <div className="ah-badges">
                <span>
                  <ShieldIcon />
                  Verified coaches
                </span>
                <span>
                  <PulseIcon />
                  AI mechanics feedback
                </span>
                <span>
                  <PinIcon />
                  South Bay LA
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {!bodyOnly && (
        <div className="ah-band">
          <div>
            <b>South Bay LA</b> — Hermosa · Manhattan · Redondo · Torrance · El Segundo
          </div>
          <div>
            <b>Beta Launch</b> — 2026
          </div>
          <div>
            <b>Built for Athletes</b>, Coached by the Best
          </div>
        </div>
      )}

      <div className="landing-page">
        <PitchingHeroVideo />
      </div>

      <HowAthlinkWorks showCta={false} />

      <AthleteLandingBelow />

    </div>
  );
}
