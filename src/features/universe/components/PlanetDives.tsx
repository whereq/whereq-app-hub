import { useState, type CSSProperties } from "react";
import clsx from "clsx";
import { Kicker } from "@/components/section/Kicker";
import { ScreenFrame } from "@/components/screen-frame/ScreenFrame";
import { ImageLightbox } from "@/components/lightbox/ImageLightbox";

interface Dive {
  id: string;
  q: string;
  name: string;
  domain: string;
  accent: string;
  metaphor: string;
  blurb: string;
  caps: string[];
  url?: string;
  soon?: boolean;
  motif: string;
  flip?: boolean;
  /** Chrome-bar address for the screenshot frame. */
  frameUrl: string;
  /** Optional screenshot; placeholder is shown until one is supplied. */
  screenshot?: string;
}

const DIVES: Dive[] = [
  {
    id: "where",
    q: "WHERE",
    name: "WhereQ",
    domain: "whereq.com",
    accent: "var(--c-where)",
    metaphor: "The Spatial Engine — every place has a story.",
    blurb:
      "The geospatial heart of the universe. A map for every kind of place — neighborhoods, memorials, friends, routes, hazards — built on Google Maps. Many planets in this universe navigate by it.",
    caps: ["Maps", "Routing & navigation", "Places & discovery", "Geospatial intelligence", "Distance & geography"],
    url: "https://www.whereq.com",
    motif: "grid",
    frameUrl: "whereq.com",
    screenshot: "/images/planets/whereq-com.png",
  },
  {
    id: "who",
    q: "WHO",
    name: "KeyToMarvel",
    domain: "keytomarvel.com",
    accent: "var(--c-who)",
    metaphor: "The Universal Passport — one identity across every world.",
    blurb:
      "The identity planet. Unified single sign-on, secure identity and access management, social login and MFA. Every product in the universe trusts it to answer the first question: who are you?",
    caps: ["Identity & SSO", "Authentication", "Authorization", "Profiles & trust", "MFA & social login"],
    url: "https://www.keytomarvel.com",
    motif: "network",
    flip: true,
    frameUrl: "keytomarvel.com",
    screenshot: "/images/planets/keytomarvel.png",
  },
  {
    id: "when",
    q: "WHEN",
    name: "ChroniQ",
    domain: "chroniq.cc",
    accent: "var(--c-when)",
    metaphor: "The Temporal Engine — time, orchestrated.",
    blurb:
      "A planet still forming. Events, scheduling, booking, appointments and calendar intelligence — the temporal layer the rest of the universe will set its clocks by.",
    caps: ["Time & events", "Scheduling", "Booking & appointments", "Calendar intelligence"],
    soon: true,
    motif: "ripple",
    frameUrl: "chroniq.cc",
    screenshot: "/images/planets/chroniq-cc.png",
  },
  {
    id: "why",
    q: "WHY",
    name: "WhereQ.ca",
    domain: "whereq.ca · you are here",
    accent: "var(--c-why)",
    metaphor: "The Research Station — where ideas are tested first.",
    blurb:
      "The laboratory of the universe. An app hub for experimentation, validation, prototyping and community feedback. Every innovation proves itself here before it earns an orbit of its own — including this very map of the universe, which lives here in the lab.",
    caps: ["Experimentation", "Validation", "Prototyping", "Community feedback"],
    url: "https://www.whereq.ca",
    motif: "lab",
    flip: true,
    frameUrl: "whereq.ca",
    screenshot: "/images/planets/whereq-ca.png",
  },
  {
    id: "what",
    q: "WHAT",
    name: "whereq.github.io",
    domain: "github pages",
    accent: "var(--c-what)",
    metaphor: "Mission Control — the public voice of the universe.",
    blurb:
      "The broadcast planet. News, announcements, releases, changelogs and ecosystem updates transmit from here — the official channel that keeps the whole universe in sync.",
    caps: ["News & announcements", "Releases", "Changelogs", "Ecosystem updates"],
    url: "https://whereq.github.io",
    motif: "signal",
    frameUrl: "whereq.github.io",
    screenshot: "/images/planets/whereq-github-io.png",
  },
  {
    id: "flowdesk",
    q: "HOW · INCUBATED",
    name: "FlowDesk",
    domain: "flowdesk.top",
    accent: "var(--c-flowdesk)",
    metaphor: "NOVA Command Center — deep stock analysis, powered by AI.",
    blurb:
      "The trading planet, built on top of all five foundations. Structured, intelligent stock analysis and professional-grade conversations about markets — guided by NOVA, the AI trading guru.",
    caps: ["AI stock analysis", "Company exploration", "Investment research", "NOVA — AI guru"],
    url: "https://www.flowdesk.top",
    motif: "market",
    flip: true,
    frameUrl: "flowdesk.top",
    screenshot: "/images/planets/flowdesk-top.png",
  },
  {
    id: "ccbus",
    q: "HOW · INCUBATED",
    name: "CCBus",
    domain: "ccbus.cc",
    accent: "var(--c-ccbus)",
    metaphor: "The DeFi Engine — an all-in-one Web3 toolkit.",
    blurb:
      "The crypto planet. Custom token creation with 11+ tokenomics models, presale launches, liquidity management and wallet tooling — across BSC, Ethereum and Polygon.",
    caps: ["Token creation", "Presale launch", "Liquidity pools", "Wallet tools", "Market dashboard"],
    url: "https://www.ccbus.cc",
    motif: "hex",
    frameUrl: "ccbus.cc",
    screenshot: "/images/planets/ccbus-cc.png",
  },
  {
    id: "cato",
    q: "HOW · INCUBATED",
    name: "CatoBigato",
    domain: "catobigato.com",
    accent: "var(--c-cato)",
    metaphor: "The Knowledge Galaxy — your chubby cat tutor.",
    blurb:
      "The learning planet. Vibe tutoring that blends learning, visualization, social interaction and AI — built for K-12 students and expandable to every age.",
    caps: ["AI tutoring", "Learning & visualization", "Social interaction", "K-12 → all ages"],
    url: "https://www.catobigato.com",
    motif: "doodle",
    flip: true,
    frameUrl: "catobigato.com",
    screenshot: "/images/planets/catobigato-com.png",
  },
];

/** Section 4 — one deep-dive panel per platform. */
export function PlanetDives() {
  const [zoom, setZoom] = useState<Dive | null>(null);

  return (
    <section className="section" id="planets" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <Kicker num="03">PLANET DEEP DIVE</Kicker>
        <h2 className="section-title" data-reveal="">
          Meet the worlds.
        </h2>
      </div>

      {DIVES.map((d) => (
        <article
          key={d.id}
          className={clsx("dive", d.flip && "dive--flip")}
          id={`dive-${d.id}`}
          data-motif={d.motif}
          style={{ "--accent": d.accent } as CSSProperties}
        >
          <div className="wrap dive-inner">
            <div className="dive-copy" data-reveal="">
              <p className="dive-q">{d.q}</p>
              <h3 className="dive-name">
                {d.name}
                <span className="domain">{d.domain}</span>
              </h3>
              <p className="dive-metaphor">{d.metaphor}</p>
              <p className="dive-blurb">{d.blurb}</p>
              <ul className="dive-caps">
                {d.caps.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="dive-links">
                {d.soon ? (
                  <span className="dive-soon">COMING SOON</span>
                ) : (
                  <a
                    className="dive-visit"
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit {d.url?.replace(/^https?:\/\/(www\.)?/, "")} ↗
                  </a>
                )}
              </div>
            </div>
            <div className="dive-media" data-reveal="">
              <ScreenFrame
                url={d.frameUrl}
                src={d.screenshot}
                alt={d.name}
                accent={d.accent}
                onZoom={d.screenshot ? () => setZoom(d) : undefined}
                placeholder={
                  d.soon
                    ? "ChroniQ — coming soon · preview pending"
                    : `${d.name} — screenshot coming soon`
                }
              />
            </div>
          </div>
        </article>
      ))}

      <ImageLightbox
        open={zoom !== null}
        src={zoom?.screenshot}
        alt={`${zoom?.name ?? ""} — full screenshot`}
        accent={zoom?.accent}
        onClose={() => setZoom(null)}
        caption={zoom ? `${zoom.name} · ${zoom.frameUrl}` : ""}
        actions={
          zoom && !zoom.soon && zoom.url ? (
            <a
              className="dive-visit"
              href={zoom.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit {zoom.frameUrl} ↗
            </a>
          ) : null
        }
      />
    </section>
  );
}
