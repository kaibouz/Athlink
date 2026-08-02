"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { AthLinkMark } from "@/components/brand/AthLinkMark";

type Host = "vercel" | "cloudflare" | "netlify" | "other";

const DNS_PRESETS: Record<
  Exclude<Host, "other">,
  { title: string; records: { type: string; name: string; value: string; note?: string }[] }
> = {
  vercel: {
    title: "Vercel",
    records: [
      { type: "A", name: "@", value: "76.76.21.21", note: "Apex domain (athlinkpro.com)" },
      {
        type: "CNAME",
        name: "www",
        value: "cname.vercel-dns.com",
        note: "www subdomain",
      },
    ],
  },
  cloudflare: {
    title: "Cloudflare Pages / proxy",
    records: [
      {
        type: "CNAME",
        name: "@",
        value: "(your Cloudflare target)",
        note: "Or use Cloudflare orange-cloud proxy to the host",
      },
      {
        type: "CNAME",
        name: "www",
        value: "(your Cloudflare target)",
      },
    ],
  },
  netlify: {
    title: "Netlify",
    records: [
      {
        type: "A",
        name: "@",
        value: "75.2.60.5",
        note: "Netlify load balancer (confirm in Netlify UI)",
      },
      {
        type: "CNAME",
        name: "www",
        value: "(your-site).netlify.app",
      },
    ],
  },
};

export default function DnsSetupPage() {
  const [domain, setDomain] = useState("athlinkpro.com");
  const [registrar, setRegistrar] = useState("");
  const [host, setHost] = useState<Host>("vercel");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const preset = host === "other" ? null : DNS_PRESETS[host];

  const summary = useMemo(() => {
    const lines = [
      `Domain: ${domain}`,
      `Registrar: ${registrar || "(not set)"}`,
      `Host target: ${host}`,
      `Contact: ${contact || "(not set)"}`,
      notes ? `Notes: ${notes}` : "",
      "",
      "DNS to add:",
      ...(preset
        ? preset.records.map(
            (r) => `${r.type}\t${r.name}\t${r.value}${r.note ? `  # ${r.note}` : ""}`,
          )
        : ["(custom — confirm with your host dashboard)"]),
    ];
    return lines.filter((l, i) => l !== "" || i === 0).join("\n");
  }, [domain, registrar, host, contact, notes, preset]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    try {
      localStorage.setItem(
        "athlink_dns_setup",
        JSON.stringify({ domain, registrar, host, contact, notes, at: new Date().toISOString() }),
      );
    } catch {
      /* ignore */
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-svh bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="inline-block text-2xl">
          <AthLinkMark />
        </Link>
        <h1 className="mt-8 text-2xl font-black text-brand-950 sm:text-3xl">
          Domain DNS setup
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-700 sm:text-base">
          Share this page with the domain owner. They fill in the basics here — no registrar
          password needed. Then they add the DNS records below at their DNS / registrar panel.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm sm:p-6"
          >
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="athlinkpro.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="registrar">Where the domain was bought</Label>
              <Input
                id="registrar"
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                placeholder="GoDaddy, Namecheap, Google Domains, Cloudflare…"
                required
              />
            </div>
            <div>
              <Label htmlFor="host">Where the site will be hosted</Label>
              <Select
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value as Host)}
              >
                <option value="vercel">Vercel</option>
                <option value="netlify">Netlify</option>
                <option value="cloudflare">Cloudflare</option>
                <option value="other">Other / not sure yet</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="contact">Contact email (optional)</Label>
              <Input
                id="contact"
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="friend@email.com"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything we should know about the current site or DNS…"
                rows={3}
              />
            </div>
            <Button type="submit" size="lg" className="w-full font-bold">
              Show DNS records
            </Button>
          </form>
        ) : (
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
              Info saved in this browser. Next step is on the <strong>DNS server / registrar</strong> —
              add the records below, then wait for propagation (often minutes, sometimes up to 24h).
            </div>

            <div className="rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
              <h2 className="font-bold text-brand-950">
                DNS records for {domain}
                {preset ? ` (${preset.title})` : ""}
              </h2>
              <p className="mt-1 text-sm text-brand-600">
                Open the DNS panel where nameservers are managed, then create:
              </p>
              <ul className="mt-4 space-y-3">
                {(preset?.records ?? []).map((r) => (
                  <li
                    key={`${r.type}-${r.name}`}
                    className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 font-mono text-sm"
                  >
                    <p className="font-sans text-xs font-semibold text-brand-500 uppercase">
                      {r.type}
                    </p>
                    <p className="mt-1 text-brand-950">
                      <span className="text-brand-500">Name:</span> {r.name}
                    </p>
                    <p className="text-brand-950">
                      <span className="text-brand-500">Value:</span> {r.value}
                    </p>
                    {r.note && <p className="mt-1 font-sans text-xs text-brand-600">{r.note}</p>}
                  </li>
                ))}
                {!preset && (
                  <li className="text-sm text-brand-600">
                    Host is &quot;other&quot; — after the app is deployed, copy the exact A/CNAME values
                    from that host&apos;s custom-domain screen into your DNS panel.
                  </li>
                )}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={copySummary} className="font-bold">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy summary"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setSubmitted(false)}>
                Edit info
              </Button>
              <Link href="/">
                <Button type="button" variant="ghost">
                  Back home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
