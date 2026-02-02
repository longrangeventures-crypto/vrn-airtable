import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldCheck, MapPin, FileText, UserPlus, ArrowRight, RefreshCw } from "lucide-react";

/**
 * Verified Response Network (VRN) — Vercel-ready Vite+React site (Airtable-powered)
 *
 * LIVE DATA SOURCE:
 * Public (read-only) Airtable view JSON:
 * https://airtable.com/appqTkwG4v9gpDjl8/shrAUcmQU0GoSZYbu?format=json
 *
 * Safety:
 * - No API keys are used.
 * - Only fields visible in your Airtable public view are exposed.
 */

const DISASTER_TYPES = [
  "Flood / Storm Surge",
  "Hurricane / Tropical Storm",
  "Severe Storm / Tornado",
  "Wildfire",
  "Winter Storm / Ice",
  "Earthquake",
  "Landslide / Mudslide",
  "Extreme Heat",
  "Extreme Cold",
  "Other",
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm">
      {children}
    </span>
  );
}

function Pill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/5 px-3 py-1.5 text-sm text-zinc-800">
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <div className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">{eyebrow}</div>
      ) : null}
      <div className="text-2xl md:text-3xl font-semibold text-zinc-900">{title}</div>
      {subtitle ? <div className="text-zinc-600 max-w-2xl">{subtitle}</div> : null}
    </div>
  );
}

function Card({ children, className }) {
  return (
    <div className={cx("rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200", className)}>
      {children}
    </div>
  );
}

function Nav({ route, setRoute }) {
  const items = [
    { key: "home", label: "Home" },
    { key: "signup", label: "Sign Up" },
    { key: "about", label: "About" },
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setRoute("home")}
          className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-zinc-100"
          aria-label="Go to home"
        >
          <div className="h-9 w-9 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight text-left">
            <div className="text-sm font-semibold text-zinc-900">Verified Response Network</div>
            <div className="text-xs text-zinc-500">Crisis-ready provider registry</div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => setRoute(it.key)}
              className={cx(
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                route === it.key ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer({ setRoute }) {
  return (
    <div className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-900">Verified Response Network</div>
          <div className="text-sm text-zinc-600">A verified registry of crisis-ready service providers.</div>
          <div className="flex flex-wrap gap-2">
            <Badge>Families-first</Badge>
            <Badge>Verification-focused</Badge>
            <Badge>Independent providers</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-zinc-900">Quick Links</div>
          <div className="grid gap-2 text-sm">
            <button className="text-left text-zinc-700 hover:underline" onClick={() => setRoute("home")}>Search providers</button>
            <button className="text-left text-zinc-700 hover:underline" onClick={() => setRoute("signup")}>Provider sign up</button>
            <button className="text-left text-zinc-700 hover:underline" onClick={() => setRoute("about")}>About + verification</button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-zinc-900">Important</div>
          <div className="text-xs text-zinc-600 leading-relaxed">
            VRN does not dispatch emergency services and does not guarantee provider performance.
            If you are in immediate danger, call 911 or your local emergency number.
          </div>
        </div>
      </div>
      <div className="px-4 pb-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Verified Response Network, LLC. All rights reserved.
      </div>
    </div>
  );
}

function normalizeProviders(records) {
  return (records || [])
    .map((r) => {
      const f = r.fields || {};
      return {
        name: f["Provider Name"] || f["Name"] || "Unnamed Provider",
        category: f["Provider Type"] || f["Category"] || "Service Provider",
        regions: Array.isArray(f["Regions Served"]) ? f["Regions Served"].join(", ") : (f["Regions Served"] || ""),
        mobilization: f["Mobilization Window"] || "",
        badges: Array.isArray(f["Badges Earned"]) ? f["Badges Earned"] : (f["Badges Earned"] ? [f["Badges Earned"]] : []),
        phone: f["Primary Contact Phone"] || f["Phone"] || "",
        email: f["Primary Contact Email"] || f["Email"] || "",
        website: f["Website"] || "",
      };
    })
    .filter((p) => p.name);
}

function Home() {
  const [disaster, setDisaster] = useState("Flood / Storm Surge");
  const [location, setLocation] = useState("");
  const [queryRan, setQueryRan] = useState(false);

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const AIRTABLE_PUBLIC_JSON = "https://airtable.com/appqTkwG4v9gpDjl8/shrAUcmQU0GoSZYbu?format=json";

  const loadProviders = () => {
    setLoading(true);
    setLoadError("");
    fetch(AIRTABLE_PUBLIC_JSON, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProviders(normalizeProviders(data.records));
      })
      .catch((err) => {
        setLoadError("We couldn't load provider listings right now. Please try again in a moment.");
        console.error("Airtable load error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => {
    if (!queryRan) return [];
    const loc = location.trim().toLowerCase();

    return providers.filter((r) => {
      const matchDisaster = disaster === "Other" ? true : true;
      const matchLoc = loc ? (r.regions || "").toLowerCase().includes(loc) : true;
      return matchDisaster && matchLoc;
    });
  }, [disaster, location, queryRan, providers]);

  function onSearch(e) {
    e.preventDefault();
    setQueryRan(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
            <SectionTitle
              eyebrow="Families-first • Natural disasters"
              title="Find verified help fast — when it matters most"
              subtitle="Search by disaster type and location to find providers who have documented readiness indicators. In a crisis, clarity matters."
            />

            <div className="flex flex-wrap gap-2">
              <Pill icon={ShieldCheck} label="Verification badges" />
              <Pill icon={MapPin} label="Region + mobilization" />
              <Pill icon={FileText} label="Transparent standards" />
            </div>
          </motion.div>

          <Card className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-900">Search the registry</div>
              <button type="button" onClick={loadProviders} className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200" title="Refresh provider listings">
                <RefreshCw className={cx("h-4 w-4", loading ? "animate-spin" : "")} />
                Refresh
              </button>
            </div>

            <form onSubmit={onSearch} className="mt-4 grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Disaster type</span>
                  <select value={disaster} onChange={(e) => setDisaster(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900">
                    {DISASTER_TYPES.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Location</span>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State or Region (e.g., Mid-Atlantic)" className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                </label>
              </div>

              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
                <Search className="h-4 w-4" />
                Search
              </button>

              <div className="text-xs text-zinc-500 leading-relaxed">
                <span className="font-medium">Immediate emergency?</span> Call 911. VRN is a registry of independent providers and does not dispatch emergency services.
              </div>

              {loading ? (
                <div className="text-sm text-zinc-600">Loading provider listings…</div>
              ) : loadError ? (
                <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 text-sm text-amber-900">{loadError}</div>
              ) : (
                <div className="text-xs text-zinc-500">Loaded {providers.length} verified providers from Airtable.</div>
              )}
            </form>
          </Card>

          <AnimatePresence>
            {queryRan ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-zinc-900">Results {results.length ? `(${results.length})` : ""}</div>
                  <div className="text-xs text-zinc-500">Source: Verified Airtable view</div>
                </div>

                {results.length === 0 ? (
                  <Card className="p-6">
                    <div className="text-sm font-semibold text-zinc-900">No matches yet</div>
                    <div className="mt-1 text-sm text-zinc-600">Try a broader region (e.g., “Southeast”) or leave location blank to see all providers.</div>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {results.map((r) => (
                      <Card key={r.name} className="p-5">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="text-lg font-semibold text-zinc-900">{r.name}</div>
                            <div className="text-sm text-zinc-600">{r.category}</div>
                            <div className="flex flex-wrap gap-2">
                              {r.regions ? <Badge>{r.regions}</Badge> : null}
                              {r.mobilization ? <Badge>Mobilization: {r.mobilization}</Badge> : null}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {(r.badges || []).map((b) => (<Badge key={b}>{b}</Badge>))}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-4 min-w-[250px]">
                            <div className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Contact</div>
                            {r.phone ? <div className="mt-2 text-sm text-zinc-800">{r.phone}</div> : null}
                            {r.email ? <div className="text-sm text-zinc-800">{r.email}</div> : null}
                            {r.website ? (
                              <a className="mt-2 inline-block text-sm font-semibold text-zinc-900 hover:underline" href={r.website} target="_blank" rel="noreferrer">Website</a>
                            ) : null}
                            <div className="mt-3 text-xs text-zinc-500">Tip: Ask for current availability, insurance COI, and a written scope before authorizing work.</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6">
            <div className="text-sm font-semibold text-zinc-900">A calm checklist for families</div>
            <div className="mt-2 text-sm text-zinc-600 leading-relaxed">When everything feels urgent, your next step should still be safe. Here’s a simple sequence you can follow.</div>
            <ol className="mt-4 space-y-3 text-sm text-zinc-700">
              <li className="flex gap-3"><span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">1</span> Ensure everyone is safe. If needed, call 911.</li>
              <li className="flex gap-3"><span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">2</span> Document damage with photos/video and note dates/times.</li>
              <li className="flex gap-3"><span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">3</span> Contact your insurer (if applicable) and ask about next steps.</li>
              <li className="flex gap-3"><span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">4</span> Use VRN to find providers by region and mobilization window.</li>
              <li className="flex gap-3"><span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs">5</span> Get a written scope and confirm insurance before work begins.</li>
            </ol>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Are you a provider?</div>
                <div className="mt-1 text-sm text-zinc-600">Apply to be listed and earn verification badges.</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-500">Providers remain independent. VRN verifies documented readiness indicators and publishes transparent standards.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Signup({ setRoute }) {
  const [role, setRole] = useState("provider");
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [hq, setHq] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-4">
          <SectionTitle
            eyebrow="Sign up"
            title="Get listed — or apply for verification"
            subtitle="VRN is built to help families find capable help quickly. Providers can apply to be listed and optionally pursue verification badges based on documented readiness indicators."
          />

          <Card className="p-5">
            <div className="text-sm font-semibold text-zinc-900">Choose your path</div>
            <div className="mt-3 grid gap-2">
              <button onClick={() => setRole("provider")} className={cx("rounded-xl border px-3 py-2 text-left text-sm", role === "provider" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50")}>
                <div className="font-semibold">Provider / Contractor</div>
                <div className={cx("text-xs", role === "provider" ? "text-white/80" : "text-zinc-500")}>Apply to join the registry</div>
              </button>
              <button onClick={() => setRole("family")} className={cx("rounded-xl border px-3 py-2 text-left text-sm", role === "family" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50")}>
                <div className="font-semibold">Family / Community Member</div>
                <div className={cx("text-xs", role === "family" ? "text-white/80" : "text-zinc-500")}>Get updates when new providers are added</div>
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-semibold text-zinc-900">Next step</div>
            <div className="mt-2 text-sm text-zinc-600 leading-relaxed">For the MVP, submissions are collected manually. Next we can connect this to your Airtable submissions form.</div>
            <button onClick={() => setRoute("about")} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200">
              Read our standards <ArrowRight className="h-4 w-4" />
            </button>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="p-6 md:p-7">
            <div className="text-lg font-semibold text-zinc-900">{role === "provider" ? "Provider onboarding (MVP)" : "Family updates"}</div>
            <div className="mt-1 text-sm text-zinc-600">{role === "provider" ? "For now, use your Airtable intake form link. We can embed it here next." : "Get notified when verified providers are added in your area."}</div>

            {!submitted ? (
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900" placeholder="you@example.com" required />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-800">Location</span>
                  <input value={hq} onChange={(e) => setHq(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900" placeholder="City, State" required />
                </label>

                <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">
                  Submit
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-6">
                <div className="text-lg font-semibold text-zinc-900">Thanks — you’re in</div>
                <div className="mt-2 text-sm text-zinc-600">We’ll email you when verified providers are added or updated in your area.</div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="About"
          title="Built for families — grounded in clarity and trust"
          subtitle="Verified Response Network (VRN) exists to help families and communities find capable help quickly during natural disasters. Our focus is verification: documented readiness indicators, transparent standards, and a calm experience when time is tight."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-zinc-900">Our verification process</div>
                  <div className="mt-1 text-sm text-zinc-600">We verify documented readiness indicators — not outcomes, availability, or performance.</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {[
                  ["1) Documentation review", "Providers submit business identifiers, insurance certificates, relevant licenses/certifications, and capability summaries."],
                  ["2) Consistency & plausibility checks", "We look for internal alignment across staffing, equipment, regions served, mobilization claims, and incident history."],
                  ["3) Attestation & update obligations", "Providers attest that submitted information is accurate and agree to update VRN when material changes occur."],
                  ["4) Selective external touchpoints (when needed)", "For higher verification tiers, we may request references or confirm public-facing items such as contract history."],
                  ["5) Re-verification cadence", "Verification status may require periodic renewal (e.g., annual) or document refresh (e.g., updated insurance)."],
                ].map(([t, d]) => (
                  <div key={t} className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-4">
                    <div className="text-sm font-semibold text-zinc-900">{t}</div>
                    <div className="mt-1 text-sm text-zinc-600">{d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6">
              <div className="text-lg font-semibold text-zinc-900">Legal + liability statements</div>
              <div className="mt-3 text-sm text-zinc-600 leading-relaxed space-y-3">
                <p>Verified Response Network, LLC (&quot;VRN&quot;) operates a professional registry of service providers who self-report and document capabilities related to emergency and disaster response.</p>
                <p>VRN does <span className="font-semibold">not</span> provide emergency response services, dispatch providers, or direct field operations. If you are in immediate danger, call 911 or your local emergency number.</p>
                <p>Inclusion in the registry does not constitute endorsement, recommendation, certification of quality, or guarantee of performance. Verification reflects documented information and self-reported readiness at the time of review.</p>
                <p>All services are performed solely by independent third-party providers. Users are responsible for conducting their own due diligence prior to engaging any provider.</p>
                <p>To the fullest extent permitted by law, VRN disclaims liability arising from reliance on registry information.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState("home");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Nav route={route} setRoute={setRoute} />

      <AnimatePresence mode="wait">
        {route === "home" && (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Home />
          </motion.main>
        )}

        {route === "signup" && (
          <motion.main key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Signup setRoute={setRoute} />
          </motion.main>
        )}

        {route === "about" && (
          <motion.main key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <About />
          </motion.main>
        )}
      </AnimatePresence>

      <Footer setRoute={setRoute} />
    </div>
  );
}
