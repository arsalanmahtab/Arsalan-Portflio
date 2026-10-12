import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./LobbyPeople.module.css";

/*
 * The reception lobby's people, drawn in SVG from simple shapes. Each stands
 * with (0, 0) between the feet and faces right; flip with scale(-1 1).
 */

const INK = "#141029";

type Look = {
  skin: string;
  top: string;
  legs: string;
  shoe: string;
  hair: ReactNode;
  /** Extra shapes on the torso: collar, badge, belt. */
  torso?: ReactNode;
  /** Extra shapes on the head: cap, headset. */
  head?: ReactNode;
};

type Pose = {
  /** Legs and arms swing and the body bobs. */
  walking?: boolean;
  /** The right arm raises and waves. */
  greeting?: boolean;
};

function Person({ look, walking, greeting }: { look: Look } & Pose) {
  const { skin, top, legs, shoe } = look;
  return (
    <g className={styles.person} data-walking={walking || undefined} data-greeting={greeting || undefined}>
      <g className={styles.body}>
        <g className={clsx(styles.limb, styles.leftLeg)}>
          <rect x={-13} y={-74} width={11} height={70} rx={5} fill={legs} />
          <rect x={-15} y={-8} width={19} height={8} rx={4} fill={shoe} />
        </g>
        <g className={clsx(styles.limb, styles.rightLeg)}>
          <rect x={2} y={-74} width={11} height={70} rx={5} fill={legs} />
          <rect x={0} y={-8} width={19} height={8} rx={4} fill={shoe} />
        </g>
        <g className={clsx(styles.limb, styles.leftArm)}>
          <rect x={-22} y={-130} width={10} height={56} rx={5} fill={top} opacity={0.8} />
          <circle cx={-17} cy={-72} r={6} fill={skin} />
        </g>
        <rect x={-20} y={-136} width={40} height={68} rx={14} fill={top} />
        {look.torso}
        <g className={clsx(styles.limb, styles.rightArm)}>
          <rect x={12} y={-130} width={10} height={56} rx={5} fill={top} />
          <circle cx={17} cy={-72} r={6} fill={skin} />
        </g>
        <rect x={-6} y={-145} width={12} height={11} fill={skin} />
        <g className={styles.head}>
          <circle cx={0} cy={-161} r={18} fill={skin} />
          {look.hair}
          <circle cx={8} cy={-163} r={2.2} fill={INK} />
          <path d="M4 -152 q5 3 10 -1" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
          {look.head}
        </g>
      </g>
    </g>
  );
}

/** The visitor: violet jacket. */
export function Customer(pose: Pose) {
  return (
    <Person
      {...pose}
      look={{
        skin: "#E2A979",
        top: "#8A7CFF",
        legs: "#2A2350",
        shoe: INK,
        hair: <path d="M-18 -163 q2 -21 20 -20 q17 1 16 19 q-9 -10 -19 -9 q-11 1 -17 10z" fill="#2B1B12" />,
        torso: <rect x={-20} y={-112} width={40} height={5} fill="#5440EE" />,
      }}
    />
  );
}

/** The gate guard: navy uniform, cap with a lime badge, lime chest badge. */
export function Guard(pose: Pose) {
  return (
    <Person
      {...pose}
      look={{
        skin: "#C98B5E",
        top: "#33456E",
        legs: "#1E2742",
        shoe: "#0E1220",
        hair: <path d="M-18 -166 q18 -12 36 0" fill="#1A1A1A" />,
        head: (
          <>
            <rect x={-19} y={-184} width={38} height={13} rx={5} fill="#1E2742" />
            <rect x={4} y={-175} width={22} height={5} rx={2.5} fill="#1E2742" />
            <circle cx={0} cy={-178} r={3} fill="#C6F24E" />
          </>
        ),
        torso: (
          <>
            <circle cx={10} cy={-120} r={4.5} fill="#C6F24E" />
            <rect x={-20} y={-96} width={40} height={5} fill="#1E2742" />
          </>
        ),
      }}
    />
  );
}

/** The receptionist: white blouse, violet collar, hair bun, lime headset with a mic. */
export function Receptionist(pose: Pose) {
  return (
    <Person
      {...pose}
      look={{
        skin: "#E8B48A",
        top: "#F2EEFF",
        legs: "#2A2350",
        shoe: INK,
        hair: (
          <>
            <circle cx={-16} cy={-172} r={9} fill="#3A2416" />
            <path d="M-18 -160 q0 -22 19 -21 q18 1 17 19 q-8 -11 -36 2z" fill="#3A2416" />
          </>
        ),
        head: (
          <>
            <path d="M-18 -162 a18 18 0 0 1 36 0" stroke="#C6F24E" strokeWidth={3} fill="none" />
            <path d="M17 -158 q5 11 -7 13" stroke="#C6F24E" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          </>
        ),
        torso: <path d="M-6 -136 l6 10 6 -10" fill="#8A7CFF" />,
      }}
    />
  );
}
