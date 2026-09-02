"use client";

import Link from "next/link";
import { AthlinkProLogo } from "@/components/brand/AthlinkProLogo";
import { useAthleteLandingAnim } from "@/components/athlete/useAthleteLandingAnim";
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

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="6" width="14" height="12" rx="2" />
      <path d="M16.5 10l5-3v10l-5-3" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

export function AthleteHomeLanding() {
  useAthleteLandingAnim();

  return (
    <div className="athlete-landing min-h-full">
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
            <Link className="ah-for-coaches" href="/join/coach">
              I&apos;m a coach →
            </Link>
            <Link className="ah-hide-m" href="/login">
              Log in
            </Link>
            <Link className="ah-btn ah-btn-clay ah-btn-sm" href="/join/athlete">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="ah-hero">
        <div className="ah-wrap" style={{ position: "relative" }}>
          <svg className="ah-deco" viewBox="0 0 600 640" preserveAspectRatio="xMidYMid meet">
            <path
              d="M 40 40 C 220 90, 180 220, 340 260 S 420 420, 300 460 S 500 560, 480 600"
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="1.4"
            />
            <circle cx="40" cy="40" r="4.5" fill="#f2c94c" />
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
            <circle cx="480" cy="600" r="4.5" fill="#f2c94c" />
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
              <Link className="ah-btn ah-btn-clay" href="#pricing">
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

      <section className="ah-block">
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>How AthlinkPro Works for Athletes</h3>
            <p>Getting started takes less than 2 minutes.</p>
          </div>
          <div className="ah-steps">
            <div className="ah-step">
              <div className="ah-ic">
                <CalendarIcon />
              </div>
              <div className="ah-n">Step 1 — Book</div>
              <h4>Find and book a coach</h4>
              <p>
                Browse verified private coaches near you, compare availability and pricing, and book a
                session in a couple of taps.
              </p>
            </div>
            <div className="ah-step">
              <div className="ah-ic">
                <MessageIcon />
              </div>
              <div className="ah-n">Step 2 — Message</div>
              <h4>Talk to your coach</h4>
              <p>
                Questions, reschedules, and clips for feedback, in one thread per coach — no juggling
                texts, DMs, and email.
              </p>
            </div>
            <div className="ah-step">
              <div className="ah-ic">
                <VideoIcon />
              </div>
              <div className="ah-n">Step 3 — Share</div>
              <h4>Post to your training feed</h4>
              <p>
                Share clips and progress from every session on a feed built for athletes, not
                influencers — and get seen by coaches and scouts nearby.
              </p>
            </div>
            <div className="ah-step">
              <div className="ah-ic">
                <ChartIcon />
              </div>
              <div className="ah-n">Step 4 — Breakdown</div>
              <h4>Get your AI breakdown</h4>
              <p>
                Upload your swing or throw and get an automatic biomechanical breakdown — joint angles,
                timing, and mechanics flagged for your next session.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ah-block ah-tight" id="features" style={{ paddingTop: 0 }}>
        <div className="ah-wrap">
          <div className="ah-feat">
            <div className="ah-copy">
              <div className="ah-kicker">Booking</div>
              <h3>The right coach, on your schedule.</h3>
              <p>
                Every coach on AthlinkPro is verified — real credentials, real background check. See their
                open times, pricing, and specialties before you book, and pay once with no transaction
                fees stacked on top.
              </p>
              <ul>
                <li>Filter by position, skill (hitting, pitching, catching, infield, OF), and city</li>
                <li>Book single sessions or packages — reminders and confirmations sent automatically</li>
                <li>Reschedule or cancel from your phone, with the coach&apos;s policy shown up front</li>
              </ul>
            </div>
            <div className="ah-mock">
              <div className="ah-mock-top">
                <b>Coaches near Redondo Beach</b>
                <span>Hitting · This week</span>
              </div>
              <div className="ah-coach-row">
                <div className="ah-avatar">CA</div>
                <div className="ah-who">
                  <b>Chris Alvarez</b>
                  <span>Hitting · Manhattan Beach · ex-D1 · 4.9 (62)</span>
                </div>
                <div className="ah-price">
                  $80<span>Verified</span>
                </div>
              </div>
              <div className="ah-coach-row">
                <div
                  className="ah-avatar"
                  style={{ background: "linear-gradient(135deg,#6b4ff6,#22c7e0)" }}
                >
                  JP
                </div>
                <div className="ah-who">
                  <b>Jenna Park</b>
                  <span>Pitching · Torrance · 4.8 (31)</span>
                </div>
                <div className="ah-price">
                  $70<span>Verified</span>
                </div>
              </div>
              <div className="ah-mock-top" style={{ margin: "16px 0 0" }}>
                <b>Chris Alvarez — Thursday</b>
                <span>60 min</span>
              </div>
              <div className="ah-slots">
                <span className="ah-slot">3:00 PM</span>
                <span className="ah-slot ah-on">4:00 PM</span>
                <span className="ah-slot">5:00 PM</span>
                <span className="ah-slot">6:30 PM</span>
              </div>
            </div>
          </div>

          <div className="ah-feat ah-flip">
            <div className="ah-copy">
              <div className="ah-kicker">Messaging</div>
              <h3>One thread with every coach.</h3>
              <p>
                Ask a question before you book, send a clip between sessions, or push a lesson back an
                hour — it all lives in one conversation per coach, right next to your bookings.
              </p>
              <ul>
                <li>Send video clips straight from your camera roll or your feed</li>
                <li>Coach reminders, confirmations, and follow-ups land in the same thread</li>
                <li>Reschedule requests are one tap, no back-and-forth</li>
              </ul>
            </div>
            <div className="ah-mock ah-anim" data-anim="chat">
              <div className="ah-mock-top">
                <b>Chris Alvarez</b>
                <span>Replies in ~1h</span>
              </div>
              <div className="ah-thread">
                <div className="ah-msg ah-me">
                  Hey coach, felt like I was late on inside pitches today. Does this look right?
                  <span className="ah-clip">▶ swing_0902.mov · 6s</span>
                  <small>4:52 PM</small>
                </div>
                <div className="ah-msg">
                  Good eye. Your hands are loading late — watch the AI breakdown, it flagged the same
                  thing. We&apos;ll fix the trigger Thursday.
                  <small>5:10 PM</small>
                </div>
                <div className="ah-msg ah-me">
                  Can we move Thursday to 5?
                  <small>5:11 PM</small>
                </div>
                <div className="ah-msg">
                  Done — moved to 5:00 PM. Confirmation sent.
                  <small>5:12 PM</small>
                </div>
                <div className="ah-typing">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>

          <div className="ah-feat">
            <div className="ah-copy">
              <div className="ah-kicker">Training feed</div>
              <h3>A feed built for athletes, not influencers.</h3>
              <p>
                Post your swings, bullpens, and PRs. Your coaches see it. Local coaches and scouts can
                find you. No ads, no algorithm chasing outrage — just work.
              </p>
              <ul>
                <li>Clips tag the session and coach automatically</li>
                <li>Progress posts pull from your goals and breakdowns</li>
                <li>Discoverable by verified coaches and recruiters in your area (you control who)</li>
              </ul>
            </div>
            <div className="ah-mock ah-anim" data-anim="feed" style={{ position: "relative" }}>
              <div className="ah-newpost">New post from Jordan Kim</div>
              <div className="ah-post">
                <div className="ah-ph">
                  <div className="ah-avatar ah-c">JK</div>
                  <div>
                    <b>Jordan Kim</b>
                    <span>SS · Hermosa · with Chris Alvarez</span>
                  </div>
                </div>
                <div className="ah-vid">
                  Tee work — 6s<span className="ah-scrub" />
                </div>
                <div className="ah-cap">Exit velo up to 84 this week. Working on staying inside the ball.</div>
                <div className="ah-meta">
                  <span>
                    <span className="ah-heart">♥</span>{" "}
                    <span className="ah-likes" data-from="24" data-to="31">
                      24
                    </span>
                  </span>
                  <span>💬 5</span>
                  <span>Exit velo 84 mph</span>
                </div>
              </div>
              <div className="ah-post">
                <div className="ah-ph">
                  <div
                    className="ah-avatar ah-c"
                    style={{ background: "linear-gradient(135deg,#3ddc97,#22c7e0)", color: "#06201a" }}
                  >
                    MT
                  </div>
                  <div>
                    <b>Maya Torres</b>
                    <span>P · Torrance · with Jenna Park</span>
                  </div>
                </div>
                <div className="ah-cap">First bullpen back. 42 pitches, changeup finally doing something.</div>
                <div className="ah-meta">
                  <span>
                    <span className="ah-heart">♥</span>{" "}
                    <span className="ah-likes" data-from="18" data-to="22">
                      18
                    </span>
                  </span>
                  <span>💬 3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ah-feat ah-flip">
            <div className="ah-copy">
              <div className="ah-kicker">AI biomechanical breakdown</div>
              <h3>See what your coach sees — after every rep.</h3>
              <p>
                Upload a swing or throw from your phone. In under a minute you get joint angles, timing,
                and sequencing mapped frame by frame, with the things worth fixing flagged. Your coach gets
                the same report, so Thursday&apos;s lesson starts where the data left off.
              </p>
              <ul>
                <li>Swing, pitch, and throwing analysis from a single phone camera</li>
                <li>Compare this week to last week, or to a coach&apos;s reference model</li>
                <li>Reports save to your progress history and can be shared to your feed</li>
              </ul>
            </div>
            <div className="ah-mock ah-anim" data-anim="bio">
              <div className="ah-mock-top">
                <b>Swing breakdown — Sep 2</b>
                <span>Processed in 44s</span>
              </div>
              <div className="ah-bio">
                <div className="ah-fig">
                  <svg viewBox="0 0 200 210">
                    <g stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none">
                      <line x1="0" y1="180" x2="200" y2="180" />
                    </g>
                    <g className="legs" stroke="#f2c94c" strokeWidth="2.2" strokeLinecap="round" fill="none">
                      <line x1="92" y1="110" x2="70" y2="150" />
                      <line x1="70" y1="150" x2="62" y2="180" />
                      <line x1="92" y1="110" x2="118" y2="145" />
                      <line x1="118" y1="145" x2="130" y2="180" />
                    </g>
                    <g fill="#f2c94c">
                      <circle cx="92" cy="110" r="3.5" />
                      <circle cx="70" cy="150" r="3.5" />
                      <circle cx="118" cy="145" r="3.5" />
                    </g>
                    <g className="body">
                      <line x1="95" y1="60" x2="92" y2="110" stroke="#f2c94c" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="95" cy="60" r="3.5" fill="#f2c94c" />
                      <circle cx="95" cy="42" r="10" fill="none" stroke="#f2c94c" strokeWidth="2.2" />
                      <g className="arms" stroke="#f2c94c" strokeWidth="2.2" strokeLinecap="round" fill="none">
                        <line x1="95" y1="60" x2="60" y2="75" />
                        <line x1="60" y1="75" x2="45" y2="55" />
                        <line x1="95" y1="60" x2="125" y2="80" />
                        <line x1="125" y1="80" x2="150" y2="60" />
                        <line x1="45" y1="55" x2="150" y2="60" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
                        <g fill="#f2c94c" stroke="none">
                          <circle cx="60" cy="75" r="3.5" />
                          <circle cx="125" cy="80" r="3.5" />
                          <circle cx="45" cy="55" r="3.5" />
                          <circle cx="150" cy="60" r="3.5" />
                        </g>
                      </g>
                    </g>
                    <g className="angle">
                      <path
                        d="M 92 110 A 30 30 0 0 1 115 118"
                        fill="none"
                        stroke="#f5a623"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                      />
                      <text x="120" y="122" fontSize="9" fill="#f5a623" fontFamily="-apple-system,sans-serif">
                        38°
                      </text>
                    </g>
                  </svg>
                  <div className="ah-scan" />
                </div>
                <div className="ah-metrics">
                  <div className="ah-metric">
                    Hip–shoulder separation
                    <b>
                      38° <span className="ah-flag ah-warn">Low</span>
                    </b>
                  </div>
                  <div className="ah-metric">
                    Time to contact
                    <b>
                      0.16s <span className="ah-flag ah-ok">Good</span>
                    </b>
                  </div>
                  <div className="ah-metric">
                    Hand load
                    <b>
                      Late by 40ms <span className="ah-flag ah-warn">Fix</span>
                    </b>
                  </div>
                  <div className="ah-metric">
                    Bat path
                    <b>
                      +9° attack <span className="ah-flag ah-ok">Good</span>
                    </b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="ah-block ah-anim"
        data-anim="chart"
        style={{
          background: "var(--ah-panel)",
          borderTop: "1px solid var(--ah-border)",
          borderBottom: "1px solid var(--ah-border)",
        }}
      >
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>Every session adds up.</h3>
            <p>
              Goals by position, session notes from your coach, and breakdown data in one place — so you
              can actually see the work paying off.
            </p>
          </div>
          <div className="ah-progress-grid">
            <div className="ah-chart-card">
              <h4>Exit velocity</h4>
              <div className="ah-sub">Last 8 weeks · logged by Chris Alvarez</div>
              <svg viewBox="0 0 520 200" width="100%" style={{ display: "block" }}>
                <g stroke="rgba(255,255,255,0.06)">
                  <line x1="0" y1="40" x2="520" y2="40" />
                  <line x1="0" y1="90" x2="520" y2="90" />
                  <line x1="0" y1="140" x2="520" y2="140" />
                </g>
                <path
                  className="ah-chart-line"
                  d="M 20 150 L 90 142 L 160 146 L 230 128 L 300 118 L 370 110 L 440 84 L 500 70"
                  fill="none"
                  stroke="url(#ahChartGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="ahChartGrad" x1="0" x2="1">
                    <stop offset="0" stopColor="#e0a458" />
                    <stop offset="1" stopColor="#f2c94c" />
                  </linearGradient>
                </defs>
                <g fill="#f2c94c">
                  <circle className="ah-chart-dot" style={{ animationDelay: "0.10s" }} cx="20" cy="150" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "0.32s" }} cx="90" cy="142" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "0.54s" }} cx="160" cy="146" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "0.76s" }} cx="230" cy="128" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "0.98s" }} cx="300" cy="118" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "1.20s" }} cx="370" cy="110" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "1.42s" }} cx="440" cy="84" r="4" />
                  <circle className="ah-chart-dot" style={{ animationDelay: "1.64s" }} cx="500" cy="70" r="5" />
                </g>
                <text
                  className="ah-chart-val"
                  x="470"
                  y="60"
                  fontSize="13"
                  fill="#f5f7fa"
                  fontWeight="700"
                  fontFamily="-apple-system,sans-serif"
                >
                  84 mph
                </text>
                <text x="12" y="172" fontSize="11" fill="#5f6773" fontFamily="-apple-system,sans-serif">
                  76
                </text>
                <text x="12" y="190" fontSize="11" fill="#5f6773" fontFamily="-apple-system,sans-serif">
                  Jul 8
                </text>
                <text x="470" y="190" fontSize="11" fill="#5f6773" fontFamily="-apple-system,sans-serif">
                  Sep 2
                </text>
              </svg>
            </div>
            <div className="ah-goals">
              <div className="ah-goal">
                <div className="ah-t">
                  <b>Exit velo → 88 mph</b>
                  <span>84 / 88</span>
                </div>
                <div className="ah-bar">
                  <i style={{ "--w": "78%" } as React.CSSProperties} />
                </div>
              </div>
              <div className="ah-goal">
                <div className="ah-t">
                  <b>Pop time → 2.0s</b>
                  <span>2.08 / 2.0</span>
                </div>
                <div className="ah-bar">
                  <i style={{ "--w": "60%" } as React.CSSProperties} />
                </div>
              </div>
              <div className="ah-goal">
                <div className="ah-t">
                  <b>Sessions this month</b>
                  <span>6 / 8</span>
                </div>
                <div className="ah-bar">
                  <i style={{ "--w": "75%" } as React.CSSProperties} />
                </div>
              </div>
              <div className="ah-goal">
                <div className="ah-t">
                  <b>Hip–shoulder sep → 45°</b>
                  <span>38 / 45</span>
                </div>
                <div className="ah-bar">
                  <i style={{ "--w": "45%" } as React.CSSProperties} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ah-block" id="coaches">
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>Coaches near you</h3>
            <p>
              Verified private coaches across the South Bay. Every one has been through a background check
              and credential review.
            </p>
          </div>
          <div className="ah-coaches">
            <div className="ah-coach-card">
              <div className="ah-top">
                <div className="ah-avatar">CA</div>
                <div>
                  <b>Chris Alvarez</b>
                  <span>Manhattan Beach · Hitting</span>
                </div>
              </div>
              <div className="ah-tags">
                <span className="ah-tag ah-v">Verified</span>
                <span className="ah-tag">ex-D1</span>
                <span className="ah-tag">8 yrs</span>
                <span className="ah-tag">4.9 · 62 reviews</span>
              </div>
              <div className="ah-bottom">
                <div>
                  <b>$80</b> <span>/ 60 min</span>
                </div>
                <Link className="ah-btn ah-btn-ghost ah-btn-sm" href="/search">
                  View profile
                </Link>
              </div>
            </div>
            <div className="ah-coach-card">
              <div className="ah-top">
                <div className="ah-avatar" style={{ background: "linear-gradient(135deg,#6b4ff6,#22c7e0)" }}>
                  JP
                </div>
                <div>
                  <b>Jenna Park</b>
                  <span>Torrance · Pitching</span>
                </div>
              </div>
              <div className="ah-tags">
                <span className="ah-tag ah-v">Verified</span>
                <span className="ah-tag">Velo &amp; command</span>
                <span className="ah-tag">4 yrs</span>
                <span className="ah-tag">4.8 · 31 reviews</span>
              </div>
              <div className="ah-bottom">
                <div>
                  <b>$70</b> <span>/ 60 min</span>
                </div>
                <Link className="ah-btn ah-btn-ghost ah-btn-sm" href="/search">
                  View profile
                </Link>
              </div>
            </div>
            <div className="ah-coach-card">
              <div className="ah-top">
                <div className="ah-avatar" style={{ background: "linear-gradient(135deg,#3ddc97,#3b6ef6)" }}>
                  AY
                </div>
                <div>
                  <b>Alex Yin</b>
                  <span>South Bay · Hitting &amp; Infield</span>
                </div>
              </div>
              <div className="ah-tags">
                <span className="ah-tag ah-v">Verified</span>
                <span className="ah-tag">310 Baseball</span>
                <span className="ah-tag">LBCC</span>
                <span className="ah-tag">日本語 OK</span>
              </div>
              <div className="ah-bottom">
                <div>
                  <b>$75</b> <span>/ 60 min</span>
                </div>
                <Link className="ah-btn ah-btn-ghost ah-btn-sm" href="/search">
                  View profile
                </Link>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link className="ah-btn ah-btn-ghost" href="/search">
              Browse all coaches
            </Link>
          </div>
        </div>
      </section>

      <section
        className="ah-block"
        id="pricing"
        style={{
          background: "var(--ah-panel)",
          borderTop: "1px solid var(--ah-border)",
          borderBottom: "1px solid var(--ah-border)",
        }}
      >
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>Simple pricing. Zero transaction fees.</h3>
            <p>You pay your coach their rate. We never take a cut of the session.</p>
          </div>
          <div className="ah-plans">
            <div className="ah-plan">
              <h4>Free</h4>
              <div className="ah-price">
                $0<span> / forever</span>
              </div>
              <div className="ah-desc">Everything you need to find a coach and start training.</div>
              <ul>
                <li>Book any verified coach</li>
                <li>Message your coaches</li>
                <li>Training feed</li>
                <li>Session history &amp; report cards</li>
                <li>2 AI breakdowns per month</li>
                <li className="ah-no">Unlimited AI breakdowns</li>
                <li className="ah-no">Week-over-week comparisons</li>
                <li className="ah-no">Scout &amp; recruiter visibility</li>
              </ul>
              <Link className="ah-btn ah-btn-ghost" href="/join/athlete">
                Start Free
              </Link>
            </div>
            <div className="ah-plan ah-pro">
              <h4>Pro</h4>
              <div className="ah-price">
                $29<span> / month</span>
              </div>
              <div className="ah-desc">For athletes who train every week and want the full picture.</div>
              <ul>
                <li>Everything in Free</li>
                <li>Unlimited AI breakdowns</li>
                <li>Week-over-week and coach reference comparisons</li>
                <li>Full progress dashboard with goals by position</li>
                <li>Discoverable by scouts &amp; recruiters (opt-in)</li>
                <li>Priority booking on high-demand coaches</li>
                <li>Cancel anytime</li>
              </ul>
              <Link className="ah-btn ah-btn-clay" href="/join/athlete">
                Start Pro — No Credit Card Needed →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ah-block">
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>Questions</h3>
          </div>
          <div className="ah-faq">
            <details>
              <summary>Do I need to be on Pro to book a coach?</summary>
              <p>
                No. Booking, messaging, and the training feed are free. Pro adds unlimited AI breakdowns,
                comparisons, the full progress dashboard, and scout visibility.
              </p>
            </details>
            <details>
              <summary>How are coaches verified?</summary>
              <p>
                Every coach submits credentials, proof of insurance, and passes a background check before
                their profile goes live. Verified coaches show a badge on their profile.
              </p>
            </details>
            <details>
              <summary>What do I need for an AI breakdown?</summary>
              <p>
                A clip from your phone, ideally 5–15 seconds, shot from the side or behind. 1080p is plenty
                — 4K takes longer to process and doesn&apos;t improve results.
              </p>
            </details>
            <details>
              <summary>Who can see my feed?</summary>
              <p>
                By default, your coaches and other athletes on AthlinkPro. You choose whether verified
                coaches and recruiters outside your circle can discover you, and you can make any post
                private.
              </p>
            </details>
            <details>
              <summary>Are there any fees on top of the coach&apos;s rate?</summary>
              <p>
                No. You pay the coach&apos;s listed price. AthlinkPro doesn&apos;t charge a platform or
                transaction fee on sessions.
              </p>
            </details>
            <details>
              <summary>I&apos;m under 18. Can I use AthlinkPro?</summary>
              <p>
                Yes, with a parent or guardian on the account. Parents can manage bookings and payments,
                see session notes, and control feed and discovery settings.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="ah-final">
        <div className="ah-wrap">
          <h3>Your next session starts here.</h3>
          <p>Free to start. Verified coaches across the South Bay. No credit card needed.</p>
          <div className="ah-cta-row">
            <Link className="ah-btn ah-btn-clay" href="/join/athlete">
              Start Free →
            </Link>
            <Link className="ah-btn ah-btn-ghost" href="#coaches">
              Find a Coach Near You
            </Link>
          </div>
        </div>
      </section>

      <footer className="ah-footer">
        <div className="ah-wrap ah-in">
          <div>© 2026 AthlinkPro · South Bay, CA</div>
          <div className="ah-cols">
            <Link href="/join/coach">For coaches</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/search">Safety &amp; verification</Link>
            <Link href="/dns">Privacy</Link>
            <Link href="/dns">Terms</Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
