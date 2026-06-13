/* ============================================================
   WhereQ Universe — ecosystem data (single source of truth)
   ------------------------------------------------------------
   To add a new planet: append to `planets`, wire its dependencies
   in `edges`, and (optionally) add a `roadmap` milestone. The
   galaxy map, detail panel, and roadmap all rebuild from this data.
   ============================================================ */

export type PlanetRing = "inner" | "outer";
export type PlanetStatus = "live" | "soon";
export type RoadmapEra = "past" | "now" | "future";

export interface Planet {
  id: string;
  question: string;
  name: string;
  domain: string;
  url: string;
  ring: PlanetRing;
  /** Position on its orbit, degrees (0 = right, CCW positive). */
  angle: number;
  /** Node radius in galaxy SVG units. */
  size: number;
  status: PlanetStatus;
  color: string;
  metaphor: string;
  tagline: string;
  blurb: string;
  responsibilities: string[];
}

export interface Edge {
  from: string;
  to: string[];
}

export interface Milestone {
  era: RoadmapEra;
  planet: string | null;
  title: string;
  text: string;
}

export interface Universe {
  planets: Planet[];
  edges: Edge[];
  roadmap: Milestone[];
}

export const UNIVERSE: Universe = {
  planets: [
    {
      id: "where",
      question: "WHERE",
      name: "WhereQ",
      domain: "whereq.com",
      url: "https://www.whereq.com",
      ring: "inner",
      angle: 162,
      size: 46,
      status: "live",
      color: "#2DD4BF",
      metaphor: "The Spatial Engine",
      tagline: "Every place has a story.",
      blurb:
        "The geospatial core of the universe. Maps, routing, navigation, places and location discovery — built on Google Maps. Many future products depend on it.",
      responsibilities: [
        "Maps",
        "Geospatial intelligence",
        "Routing & navigation",
        "Places & discovery",
        "Distance & geography",
      ],
    },
    {
      id: "who",
      question: "WHO",
      name: "KeyToMarvel",
      domain: "keytomarvel.com",
      url: "https://www.keytomarvel.com",
      ring: "inner",
      angle: 90,
      size: 42,
      status: "live",
      color: "#F4B33D",
      metaphor: "The Universal Passport",
      tagline: "One identity across every world.",
      blurb:
        "The identity planet. Unified single sign-on, secure identity and access management, social login and MFA. Every product in the universe trusts KeyToMarvel to answer one question: who are you?",
      responsibilities: [
        "Identity & SSO",
        "Authentication",
        "Authorization",
        "Profiles & relationships",
        "Trust & MFA",
      ],
    },
    {
      id: "when",
      question: "WHEN",
      name: "ChroniQ",
      domain: "chroniq.cc",
      url: "https://www.chroniq.cc",
      ring: "inner",
      angle: 18,
      size: 40,
      status: "soon",
      color: "#A78BFA",
      metaphor: "The Temporal Engine",
      tagline: "Time, orchestrated.",
      blurb:
        "The time planet, currently forming. Events, scheduling, booking, appointments and calendar intelligence — the temporal layer the rest of the universe will set its clocks by.",
      responsibilities: [
        "Time & events",
        "Scheduling",
        "Booking & appointments",
        "Calendar intelligence",
      ],
    },
    {
      id: "why",
      question: "WHY",
      name: "WhereQ.ca",
      domain: "whereq.ca",
      url: "https://www.whereq.ca",
      ring: "inner",
      angle: 306,
      size: 38,
      status: "live",
      color: "#F46BA9",
      metaphor: "The Research Station",
      tagline: "Where ideas are tested first.",
      blurb:
        "The laboratory of the universe — an app hub for experimentation, validation, prototyping and community feedback. Innovations prove themselves here before they reach production. This very map lives here, in the lab.",
      responsibilities: [
        "Experimentation",
        "Validation",
        "Prototyping",
        "Community feedback",
        "Innovation",
      ],
    },
    {
      id: "what",
      question: "WHAT",
      name: "whereq.github.io",
      domain: "whereq.github.io",
      url: "https://whereq.github.io",
      ring: "inner",
      angle: 234,
      size: 38,
      status: "live",
      color: "#4DA8F0",
      metaphor: "Mission Control",
      tagline: "The public voice of the universe.",
      blurb:
        "The broadcast planet — the official voice of the universe. News, announcements, releases, changelogs and ecosystem updates transmit from here to the rest of the world.",
      responsibilities: [
        "News & announcements",
        "Releases",
        "Changelogs",
        "Ecosystem updates",
      ],
    },

    /* ---- HOW: incubated products ---- */
    {
      id: "flowdesk",
      question: "HOW",
      name: "FlowDesk",
      domain: "flowdesk.top",
      url: "https://www.flowdesk.top",
      ring: "outer",
      angle: 122,
      size: 34,
      status: "live",
      color: "#3FD68F",
      metaphor: "NOVA Command Center",
      tagline: "Deep stock analysis, powered by AI.",
      blurb:
        "An AI trading platform built on top of all five foundational planets. Structured, intelligent stock analysis and professional-grade market conversations — guided by NOVA, the AI trading guru.",
      responsibilities: [
        "AI stock analysis",
        "Company exploration",
        "Investment research",
        "NOVA — AI trading guru",
      ],
    },
    {
      id: "ccbus",
      question: "HOW",
      name: "CCBus",
      domain: "ccbus.cc",
      url: "https://www.ccbus.cc",
      ring: "outer",
      angle: 58,
      size: 34,
      status: "live",
      color: "#F08A4B",
      metaphor: "The DeFi Engine",
      tagline: "An all-in-one Web3 toolkit.",
      blurb:
        "The crypto planet. Custom token creation with 11+ tokenomics models, presale launches, liquidity management and wallet tools — across BSC, Ethereum and Polygon.",
      responsibilities: [
        "Token creation",
        "Presale launch",
        "Liquidity pools",
        "Wallet tools",
        "Market dashboard",
      ],
    },
    {
      id: "cato",
      question: "HOW",
      name: "Catobigato",
      domain: "catobigato.com",
      url: "https://www.catobigato.com",
      ring: "outer",
      angle: 352,
      size: 34,
      status: "live",
      color: "#F47B6B",
      metaphor: "The Knowledge Galaxy",
      tagline: "Your chubby cat tutor, K-12 to college.",
      blurb:
        "The learning planet. Vibe tutoring that combines learning, visualization, social interaction and AI — built for K-12 students and expandable to every age.",
      responsibilities: [
        "AI tutoring",
        "Learning & visualization",
        "Social interaction",
        "K-12 → all ages",
      ],
    },
  ],

  edges: [
    /* products are born in the lab and announced from mission control */
    { from: "flowdesk", to: ["who", "where", "when", "why", "what"] },
    { from: "ccbus", to: ["who", "why", "what"] },
    { from: "cato", to: ["who", "when", "why", "what"] },
    /* the foundational planets trust the identity core */
    { from: "where", to: ["who"] },
    { from: "when", to: ["who"] },
    { from: "why", to: ["who"] },
    { from: "what", to: ["who"] },
  ],

  roadmap: [
    {
      era: "past",
      planet: "where",
      title: "WhereQ lifts off",
      text: "The spatial engine comes online — every place gets a story.",
    },
    {
      era: "past",
      planet: "who",
      title: "KeyToMarvel issues passports",
      text: "One identity across the universe. SSO, MFA, social login.",
    },
    {
      era: "past",
      planet: "ccbus",
      title: "CCBus enters orbit",
      text: "The DeFi engine ignites — tokens, presales, liquidity.",
    },
    {
      era: "past",
      planet: "flowdesk",
      title: "FlowDesk launches NOVA",
      text: "AI-powered deep stock analysis opens for trading minds.",
    },
    {
      era: "past",
      planet: "cato",
      title: "Catobigato starts teaching",
      text: "The chubby cat tutor welcomes its first students.",
    },
    {
      era: "now",
      planet: "what",
      title: "Mission Control goes live",
      text: "whereq.github.io becomes the public voice of the universe.",
    },
    {
      era: "now",
      planet: "when",
      title: "ChroniQ is forming",
      text: "The temporal engine is under construction. Coming soon.",
    },
    {
      era: "future",
      planet: null,
      title: "The next planet",
      text: "An empty orbit is reserved. The universe keeps expanding.",
    },
  ],
};

/** Quick id → Planet lookup built once from `UNIVERSE.planets`. */
export const PLANET_BY_ID: Record<string, Planet> = Object.fromEntries(
  UNIVERSE.planets.map((p) => [p.id, p]),
);
