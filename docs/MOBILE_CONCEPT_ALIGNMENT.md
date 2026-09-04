# AthlinkPro mobile concept alignment

Source of truth: `docs/athlinkpro-mobile-concept-coaches-athletes.html`  
(uploaded: AthlinkPro Mobile App Concept — Coaches:Athletes)

## Tokens
| Token | Value | Role |
| --- | --- | --- |
| `--mx-bg` | `#05070c` | Shell background |
| `--mx-panel` | `#0b0f1a` | Cards |
| `--mx-blue-1` | `#3b6ef6` | Coach accent / indigo |
| `--mx-blue-2` / accent | `#22c7e0` | Athlete accent / cyan |
| Status amber/green/red | `#f5a623` / `#3ddc97` / `#ff5f6d` | Not brand |

## Marketing ↔ gateway
- HQ (`BrandHomeLanding`) and `/get-started` (`JoinGateway`) use the same coach/athlete split and indigo/cyan accents.
- Role choice copy mirrors concept gateway (“Continue as coach/athlete →”).
- How-it-works lives on `/#how-it-works` (not a separate marketing page).

## Platform screens (priority match)
| Concept | Route / chrome |
| --- | --- |
| Book — 3-across grid | `/search` + `CoachBookCard` |
| Coach profile — About / Where & when / Reviews | `/coaches/[id]` (`CoachDetailView`) |
| Athlete Home | `/home` (`AthleteHomeScreen`) |
| Coach Today | `/coach/dashboard` (`CoachTodayScreen`) |
| Tab bars | `MobileNav` — athlete cyan / coach indigo |
| AI breakdown | `/breakdown` (`AthleteBreakdownScreen`) — Home toast / Progress / You AI posts |

## Still open (later)
Progress real data (not hardcoded cards), coach Calendar colour codes, Scout feed, Earnings `$0` fee line-item, real CV pipeline behind `/breakdown`.

## Done in this pass
- Book month-view picker (`AvailabilityMonthGrid` in `BookingForm`)
- Athlete You (`AthleteYouScreen` on `/me`, 5th tab)
- Coach profile X-shell + Book discovery grid (prior)
- AI breakdown demo screen + entry points (`/breakdown`)
