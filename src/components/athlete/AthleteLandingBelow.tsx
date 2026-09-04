"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useAthleteLandingAnim } from "@/components/athlete/useAthleteLandingAnim";
import { useLocale } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";
import "./athlete-landing.css";

/**
 * Everything below the "How AthlinkPro works" section of the athlete marketing
 * flow: feature rows, progress, coaches, pricing, FAQ, final CTA and footer.
 * Shared by /for-athletes and /how-it-works so both pages tell the same story.
 */
export function AthleteLandingBelow() {
  useAthleteLandingAnim();
  const { t } = useLocale();

  const featureBullets = (prefix: string) =>
    ([1, 2, 3] as const).map((n) => t(`${prefix}_li${n}` as MessageKey));

  return (
    <div className="athlete-landing">
      <section className="ah-block ah-tight" id="features" style={{ paddingTop: 0 }}>
        <div className="ah-wrap">
          <div className="ah-feat">
            <div className="ah-copy">
              <div className="ah-kicker">{t("ahb_book_kicker")}</div>
              <h3>{t("ahb_book_title")}</h3>
              <p>{t("ahb_book_body")}</p>
              <ul>
                {featureBullets("ahb_book").map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ah-mock">
              <div className="ah-mock-top">
                <b>{t("ahb_mock_coaches_title")}</b>
                <span>{t("ahb_mock_coaches_meta")}</span>
              </div>
              <div className="ah-coach-row">
                <div className="ah-avatar">CA</div>
                <div className="ah-who">
                  <b>Chris Alvarez</b>
                  <span>{t("ahb_coach_ca_meta")}</span>
                </div>
                <div className="ah-price">
                  $80<span>{t("ahb_verified")}</span>
                </div>
              </div>
              <div className="ah-coach-row">
                <div className="ah-avatar" style={{ background: "linear-gradient(135deg,#1e3a8a,#3b6ef6)" }}>
                  JP
                </div>
                <div className="ah-who">
                  <b>Jenna Park</b>
                  <span>{t("ahb_coach_jp_meta")}</span>
                </div>
                <div className="ah-price">
                  $70<span>{t("ahb_verified")}</span>
                </div>
              </div>
              <div className="ah-mock-top" style={{ margin: "16px 0 0" }}>
                <b>{t("ahb_mock_slots_title")}</b>
                <span>{t("ahb_mock_slots_meta")}</span>
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
              <div className="ah-kicker">{t("ahb_msg_kicker")}</div>
              <h3>{t("ahb_msg_title")}</h3>
              <p>{t("ahb_msg_body")}</p>
              <ul>
                {featureBullets("ahb_msg").map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ah-mock ah-anim" data-anim="chat">
              <div className="ah-mock-top">
                <b>Chris Alvarez</b>
                <span>{t("ahb_chat_replies")}</span>
              </div>
              <div className="ah-thread">
                <div className="ah-msg ah-me">
                  {t("ahb_chat_1")}
                  <span className="ah-clip">▶ swing_0902.mov · 6s</span>
                  <small>4:52 PM</small>
                </div>
                <div className="ah-msg">
                  {t("ahb_chat_2")}
                  <small>5:10 PM</small>
                </div>
                <div className="ah-msg ah-me">
                  {t("ahb_chat_3")}
                  <small>5:11 PM</small>
                </div>
                <div className="ah-msg">
                  {t("ahb_chat_4")}
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
              <div className="ah-kicker">{t("ahb_feed_kicker")}</div>
              <h3>{t("ahb_feed_title")}</h3>
              <p>{t("ahb_feed_body")}</p>
              <ul>
                {featureBullets("ahb_feed").map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ah-mock ah-anim" data-anim="feed" style={{ position: "relative" }}>
              <div className="ah-newpost">{t("ahb_feed_newpost")}</div>
              <div className="ah-post">
                <div className="ah-ph">
                  <div className="ah-avatar ah-c">JK</div>
                  <div>
                    <b>Jordan Kim</b>
                    <span>{t("ahb_post_1_meta")}</span>
                  </div>
                </div>
                <div className="ah-vid">
                  {t("ahb_post_1_vid")}
                  <span className="ah-scrub" />
                </div>
                <div className="ah-cap">{t("ahb_post_1_cap")}</div>
                <div className="ah-meta">
                  <span>
                    <span className="ah-heart">♥</span>{" "}
                    <span className="ah-likes" data-from="24" data-to="31">
                      24
                    </span>
                  </span>
                  <span>💬 5</span>
                  <span>{t("ahb_post_1_stat")}</span>
                </div>
              </div>
              <div className="ah-post">
                <div className="ah-ph">
                  <div
                    className="ah-avatar ah-c"
                    style={{ background: "linear-gradient(135deg,#3ddc97,#22c7e0)", color: "#04121f" }}
                  >
                    MT
                  </div>
                  <div>
                    <b>Maya Torres</b>
                    <span>{t("ahb_post_2_meta")}</span>
                  </div>
                </div>
                <div className="ah-cap">{t("ahb_post_2_cap")}</div>
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
              <div className="ah-kicker">{t("ahb_ai_kicker")}</div>
              <h3>{t("ahb_ai_title")}</h3>
              <p>{t("ahb_ai_body")}</p>
              <ul>
                {featureBullets("ahb_ai").map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ah-mock ah-anim" data-anim="bio">
              <div className="ah-mock-top">
                <b>{t("ahb_bio_title")}</b>
                <span>{t("ahb_bio_meta")}</span>
              </div>
              <div className="ah-bio">
                <div className="ah-fig">
                  <svg viewBox="0 0 200 210">
                    <g stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none">
                      <line x1="0" y1="180" x2="200" y2="180" />
                    </g>
                    <g className="legs" stroke="#22c7e0" strokeWidth="2.2" strokeLinecap="round" fill="none">
                      <line x1="92" y1="110" x2="70" y2="150" />
                      <line x1="70" y1="150" x2="62" y2="180" />
                      <line x1="92" y1="110" x2="118" y2="145" />
                      <line x1="118" y1="145" x2="130" y2="180" />
                    </g>
                    <g fill="#22c7e0">
                      <circle cx="92" cy="110" r="3.5" />
                      <circle cx="70" cy="150" r="3.5" />
                      <circle cx="118" cy="145" r="3.5" />
                    </g>
                    <g className="body">
                      <line x1="95" y1="60" x2="92" y2="110" stroke="#22c7e0" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="95" cy="60" r="3.5" fill="#22c7e0" />
                      <circle cx="95" cy="42" r="10" fill="none" stroke="#22c7e0" strokeWidth="2.2" />
                      <g className="arms" stroke="#22c7e0" strokeWidth="2.2" strokeLinecap="round" fill="none">
                        <line x1="95" y1="60" x2="60" y2="75" />
                        <line x1="60" y1="75" x2="45" y2="55" />
                        <line x1="95" y1="60" x2="125" y2="80" />
                        <line x1="125" y1="80" x2="150" y2="60" />
                        <line x1="45" y1="55" x2="150" y2="60" stroke="rgba(255,255,255,0.55)" strokeWidth="3" />
                        <g fill="#22c7e0" stroke="none">
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
                    {t("ahb_metric_hipsep")}
                    <b>
                      38° <span className="ah-flag ah-warn">{t("ahb_flag_low")}</span>
                    </b>
                  </div>
                  <div className="ah-metric">
                    {t("ahb_metric_contact")}
                    <b>
                      0.16s <span className="ah-flag ah-ok">{t("ahb_flag_good")}</span>
                    </b>
                  </div>
                  <div className="ah-metric">
                    {t("ahb_metric_handload")}
                    <b>
                      {t("ahb_metric_handload_val")}{" "}
                      <span className="ah-flag ah-warn">{t("ahb_flag_fix")}</span>
                    </b>
                  </div>
                  <div className="ah-metric">
                    {t("ahb_metric_batpath")}
                    <b>
                      {t("ahb_metric_batpath_val")}{" "}
                      <span className="ah-flag ah-ok">{t("ahb_flag_good")}</span>
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
            <h3>{t("ahb_progress_title")}</h3>
            <p>{t("ahb_progress_sub")}</p>
          </div>
          <div className="ah-progress-grid">
            <div className="ah-chart-card">
              <h4>{t("ahb_chart_title")}</h4>
              <div className="ah-sub">{t("ahb_chart_sub")}</div>
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
                    <stop offset="0" stopColor="#3b6ef6" />
                    <stop offset="1" stopColor="#22c7e0" />
                  </linearGradient>
                </defs>
                <g fill="#22c7e0">
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
              {[
                { key: "ahb_goal_velo", value: "84 / 88", width: "78%" },
                { key: "ahb_goal_pop", value: "2.08 / 2.0", width: "60%" },
                { key: "ahb_goal_sessions", value: "6 / 8", width: "75%" },
                { key: "ahb_goal_hipsep", value: "38 / 45", width: "45%" },
              ].map((goal) => (
                <div className="ah-goal" key={goal.key}>
                  <div className="ah-t">
                    <b>{t(goal.key as MessageKey)}</b>
                    <span>{goal.value}</span>
                  </div>
                  <div className="ah-bar">
                    <i style={{ "--w": goal.width } as CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ah-block" id="coaches">
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>{t("ahb_coaches_title")}</h3>
            <p>{t("ahb_coaches_sub")}</p>
          </div>
          <div className="ah-coaches">
            {[
              {
                initials: "CA",
                name: "Chris Alvarez",
                locKey: "ahb_coach_ca_loc",
                tags: ["ahb_verified", "ahb_tag_exd1", "ahb_tag_8yrs", "ahb_tag_ca_rating"],
                price: "$80",
                avatarStyle: undefined as CSSProperties | undefined,
              },
              {
                initials: "JP",
                name: "Jenna Park",
                locKey: "ahb_coach_jp_loc",
                tags: ["ahb_verified", "ahb_tag_velo", "ahb_tag_4yrs", "ahb_tag_jp_rating"],
                price: "$70",
                avatarStyle: { background: "linear-gradient(135deg,#1e3a8a,#3b6ef6)" },
              },
              {
                initials: "AY",
                name: "Alex Yin",
                locKey: "ahb_coach_ay_loc",
                tags: ["ahb_verified", "ahb_tag_310", "ahb_tag_lbcc", "ahb_tag_ja_ok"],
                price: "$75",
                avatarStyle: { background: "linear-gradient(135deg,#3ddc97,#3b6ef6)" },
              },
            ].map((coach) => (
              <div className="ah-coach-card" key={coach.name}>
                <div className="ah-top">
                  <div className="ah-avatar" style={coach.avatarStyle}>
                    {coach.initials}
                  </div>
                  <div>
                    <b>{coach.name}</b>
                    <span>{t(coach.locKey as MessageKey)}</span>
                  </div>
                </div>
                <div className="ah-tags">
                  {coach.tags.map((tag, index) => (
                    <span key={tag} className={index === 0 ? "ah-tag ah-v" : "ah-tag"}>
                      {t(tag as MessageKey)}
                    </span>
                  ))}
                </div>
                <div className="ah-bottom">
                  <div>
                    <b>{coach.price}</b> <span>{t("ahb_per_session")}</span>
                  </div>
                  <Link className="ah-btn ah-btn-ghost ah-btn-sm" href="/search">
                    {t("ahb_view_profile")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link className="ah-btn ah-btn-ghost" href="/search">
              {t("ahb_browse_all")}
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
            <h3>{t("ahb_pricing_title")}</h3>
            <p>{t("ahb_pricing_sub")}</p>
          </div>
          <div className="ah-plans">
            <div className="ah-plan">
              <h4>{t("ahb_plan_free_name")}</h4>
              <div className="ah-price">
                $0<span> {t("ahb_plan_free_period")}</span>
              </div>
              <div className="ah-desc">{t("ahb_plan_free_desc")}</div>
              <ul>
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <li key={n}>{t(`ahb_plan_free_li${n}` as MessageKey)}</li>
                ))}
                {([1, 2, 3] as const).map((n) => (
                  <li className="ah-no" key={`no${n}`}>
                    {t(`ahb_plan_free_no${n}` as MessageKey)}
                  </li>
                ))}
              </ul>
              <Link className="ah-btn ah-btn-ghost" href="/join/athlete">
                {t("ahb_plan_free_cta")}
              </Link>
            </div>
            <div className="ah-plan ah-pro">
              <span className="ah-plan-badge">{t("ahb_plan_popular")}</span>
              <h4>{t("ahb_plan_pro_name")}</h4>
              <div className="ah-price">
                $29<span> {t("ahb_plan_pro_period")}</span>
              </div>
              <div className="ah-desc">{t("ahb_plan_pro_desc")}</div>
              <ul>
                {([1, 2, 3, 4, 5, 6, 7] as const).map((n) => (
                  <li key={n}>{t(`ahb_plan_pro_li${n}` as MessageKey)}</li>
                ))}
              </ul>
              <Link className="ah-btn ah-btn-accent" href="/join/athlete">
                {t("ahb_plan_pro_cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ah-block">
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <h3>{t("ahb_faq_title")}</h3>
          </div>
          <div className="ah-faq">
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <details key={n}>
                <summary>{t(`ahb_faq_q${n}` as MessageKey)}</summary>
                <p>{t(`ahb_faq_a${n}` as MessageKey)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ah-final">
        <div className="ah-wrap">
          <h3>{t("how_final_title")}</h3>
          <p>{t("how_final_sub")}</p>
          <div className="ah-cta-row">
            <Link className="ah-btn ah-btn-accent" href="/join/athlete">
              {t("ahb_final_cta_free")}
            </Link>
            <Link className="ah-btn ah-btn-ghost" href="#coaches">
              {t("ahb_final_cta_find")}
            </Link>
          </div>
        </div>
      </section>

      <footer className="ah-footer">
        <div className="ah-wrap ah-in">
          <div>{t("ahb_footer_copy")}</div>
          <div className="ah-cols">
            <Link href="/for-coaches">{t("ahb_footer_coaches")}</Link>
            <Link href="#pricing">{t("ahb_footer_pricing")}</Link>
            <Link href="/search">{t("ahb_footer_safety")}</Link>
            <Link href="/dns">{t("ahb_footer_privacy")}</Link>
            <Link href="/dns">{t("ahb_footer_terms")}</Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
