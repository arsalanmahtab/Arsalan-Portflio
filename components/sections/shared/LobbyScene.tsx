import { Customer, Guard, Receptionist } from "@/components/characters/LobbyPeople";
import { lobbyCopy as copy } from "@/data/lobbyServices";
import styles from "./ReceptionLobby.module.css";

const LIME = "#C6F24E";

type Props = {
  /** Prefix for this instance's SVG ids, so two lobbies never share a gradient or mask. */
  uid: string;
  /** Freeze the idle loops while the scene is off screen. */
  paused: boolean;
  customerWalking: boolean;
  guardGreeting: boolean;
  receptionistGreeting: boolean;
};

/**
 * The lobby, 1000×460: wall, pendant lamps, artwork, plants, the WELCOME gate
 * with sliding glass doors, the guard, the reception desk and the visitor.
 * LobbyStory moves the visitor, doors and glow (the data-lobby elements) with GSAP.
 * The server HTML shows the end of the visit: the visitor already at the desk.
 */
export function LobbyScene({ uid, paused, customerWalking, guardGreeting, receptionistGreeting }: Props) {
  const id = (name: string) => `${uid}-${name}`;

  return (
    <svg
      viewBox="0 0 1000 460"
      role="img"
      aria-label={copy.sceneLabel}
      className={styles.scene}
      data-paused={paused || undefined}
    >
      <defs>
        <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--bg-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--card)" }} />
        </linearGradient>
        <linearGradient id={id("cone")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIME} stopOpacity={0.22} />
          <stop offset="1" stopColor={LIME} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={id("fade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={id("reflection")}>
          <rect x={0} y={380} width={1000} height={80} fill={`url(#${id("fade")})`} />
        </mask>
        <clipPath id={id("doorway")}>
          <rect x={232} y={154} width={100} height={226} />
        </clipPath>
      </defs>

      {/* Room: wall with panel lines, polished floor with perspective lines. */}
      <rect width={1000} height={380} fill={`url(#${id("wall")})`} />
      <g opacity={0.5} strokeWidth={1} style={{ stroke: "var(--line)" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={380 + i * 70} y1={0} x2={380 + i * 70} y2={380} />
        ))}
      </g>
      <rect y={380} width={1000} height={80} style={{ fill: "var(--bg)" }} />
      <g strokeWidth={1.2} style={{ stroke: "var(--line)" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 90 - 40} y1={380} x2={i * 110 - 160} y2={460} />
        ))}
        <line x1={0} y1={410} x2={1000} y2={410} />
      </g>

      {/* Pendant lamps with soft light cones. */}
      {[540, 780].map((x) => (
        <g key={x}>
          <line x1={x} y1={0} x2={x} y2={58} strokeWidth={2} style={{ stroke: "var(--fg-2)" }} />
          <path d={`M${x - 16} 70 h32 l-6 -12 h-20z`} style={{ fill: "var(--fg-2)" }} />
          <polygon points={`${x - 12},70 ${x + 12},70 ${x + 70},300 ${x - 70},300`} fill={`url(#${id("cone")})`} />
          <circle className={styles.lamp} cx={x} cy={72} r={7} fill={LIME} />
        </g>
      ))}

      <text
        x={780}
        y={140}
        textAnchor="middle"
        fontSize={38}
        style={{ fill: "var(--fg-2)", fontFamily: "var(--serif)", fontStyle: "italic" }}
      >
        {copy.signs.wall}
      </text>
      <circle cx={700} cy={128} r={5} fill={LIME} />

      {/* Potted plants. */}
      <g transform="translate(430 380)">
        <path d="M-14 0 h28 l-4 -34 h-20z" fill={LIME} />
        <path className={styles.leaf} d="M0 -34 q-26 -30 -6 -66 q16 32 6 66z" fill="#3FB98B" />
        <path className={styles.leaf} d="M2 -34 q6 -44 30 -56 q2 38 -30 56z" fill="#5ED3A6" />
      </g>
      <g transform="translate(965 380)">
        <path d="M-14 0 h28 l-4 -34 h-20z" fill="#8A7CFF" />
        <path className={styles.leaf} d="M0 -34 q-26 -30 -6 -66 q16 32 6 66z" fill="#3FB98B" />
        <path className={styles.leaf} d="M-2 -34 q-30 -14 -40 -42 q34 4 40 42z" fill="#2E9A72" />
      </g>

      {/* Framed artwork whose design slowly turns. */}
      <g transform="translate(470 150)">
        <rect width={104} height={104} rx={4} strokeWidth={3} style={{ fill: "var(--card)", stroke: "var(--fg-2)" }} />
        <rect x={10} y={10} width={84} height={84} style={{ fill: "var(--bg)" }} />
        <g className={styles.art}>
          <circle cx={52} cy={52} r={26} fill="#8A7CFF" />
          <path d="M26 52 a26 26 0 0 1 52 0" fill={LIME} />
        </g>
        <circle cx={70} cy={34} r={7} fill="#F2EEFF" />
      </g>

      {/* Gate: WELCOME sign, glowing doorway, sliding glass doors, light sweep.
          Sign and door edges use --lime-text so they stay visible on the light theme's pale wall. */}
      <text
        x={282}
        y={124}
        textAnchor="middle"
        fontSize={16}
        letterSpacing={3}
        style={{ fill: "var(--lime-text)", fontFamily: "var(--display)", fontWeight: 800 }}
      >
        {copy.signs.gate}
      </text>
      <rect data-lobby="glow" x={226} y={150} width={112} height={230} fill={LIME} opacity={0} />
      {[
        { door: "door-left", x: 232, handle: 274 },
        { door: "door-right", x: 282, handle: 290 },
      ].map(({ door, x, handle }) => (
        <g key={door} data-lobby={door}>
          <rect
            x={x}
            y={154}
            width={50}
            height={226}
            rx={3}
            fill="rgb(198 242 78 / 0.12)"
            strokeWidth={2}
            style={{ stroke: "color-mix(in srgb, var(--lime-text) 70%, transparent)" }}
          />
          <line x1={handle} y1={250} x2={handle} y2={290} strokeWidth={3} strokeLinecap="round" style={{ stroke: "var(--lime-text)" }} />
        </g>
      ))}
      <g clipPath={`url(#${id("doorway")})`}>
        <polygon className={styles.sweep} points="200,154 232,154 200,380 168,380" fill="rgb(255 255 255 / 0.28)" />
      </g>

      {/* Floor reflections of the guard and the visitor. */}
      <g mask={`url(#${id("reflection")})`} opacity={0.22}>
        <g transform="translate(0 760) scale(1 -1)">
          <use href={`#${id("guard")}`} />
          <use href={`#${id("customer")}`} />
        </g>
      </g>

      <rect x={220} y={140} width={10} height={240} rx={3} style={{ fill: "var(--fg-2)" }} />
      <rect x={334} y={140} width={10} height={240} rx={3} style={{ fill: "var(--fg-2)" }} />
      <rect x={220} y={138} width={124} height={14} rx={4} fill={LIME} />

      <g id={id("guard")} transform="translate(378 380) scale(-1 1)">
        <Guard greeting={guardGreeting} />
      </g>
      <g transform="translate(790 360) scale(-1 1)">
        <Receptionist greeting={receptionistGreeting} />
      </g>

      {/* Reception desk: glass top, front panel with a lime strip, small monitor. */}
      <rect x={650} y={292} width={270} height={12} rx={4} fill="rgb(255 255 255 / 0.22)" style={{ stroke: "var(--glass-border)" }} />
      <rect x={660} y={304} width={250} height={76} rx={10} strokeWidth={1.5} style={{ fill: "var(--card)", stroke: "var(--line)" }} />
      <rect x={660} y={304} width={250} height={4} fill={LIME} />
      <text
        x={785}
        y={352}
        textAnchor="middle"
        fontSize={17}
        letterSpacing={2}
        style={{ fill: "var(--fg)", fontFamily: "var(--display)", fontWeight: 800 }}
      >
        {copy.signs.desk}
      </text>
      <rect x={842} y={254} width={50} height={32} rx={4} fill="#141029" stroke={LIME} strokeWidth={1.5} />
      <rect x={863} y={286} width={8} height={7} style={{ fill: "var(--fg-2)" }} />

      <g id={id("customer")} data-lobby="customer" transform="translate(590 380)">
        <Customer walking={customerWalking} />
      </g>
    </svg>
  );
}
