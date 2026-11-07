"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Vector3, type Group } from "three";
import { ARM_REST, createRobotRig, Robot, setEyesOpen } from "./Robot";
import { approach, easeInCubic, easeOutCubic, useRenderWhile } from "./three-utils";

export type FooterRobotStage = "waiting" | "visiting" | "done";

type Props = {
  active: boolean;
  /** Each new number plays the visit once; 0 means not yet. */
  run: number;
  /** The last run that finished, so a remounted scene doesn't replay it. */
  finishedRun: number;
  reduced: boolean;
  /** The speech bubble, positioned over the robot's head while it waves. */
  bubble: RefObject<HTMLElement | null>;
  onStage: (stage: FooterRobotStage, run: number) => void;
};

/** Seconds: glide in, wave, glide out. */
const IN = 2.8;
const HELLO = 3;
const OUT = 2.4;
/** Reduced motion: grow in and out at the centre instead of travelling. */
const POP = 0.6;
const FLOOR = -0.35;

function FooterScene({ active, run, finishedRun, reduced, bubble, onStage }: Props) {
  useRenderWhile(active);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const robot = useRef<Group>(null);
  const rig = useRef(createRobotRig());
  const story = useRef({ run: 0, time: 0, playing: false });
  const head = useRef(new Vector3());

  // A new run starts the visit from the left edge.
  useEffect(() => {
    if (run === 0 || run <= finishedRun || story.current.run === run) return;
    story.current = { run, time: 0, playing: true };
    onStage("visiting", run);
  }, [run, finishedRun, onStage]);

  useFrame((state, delta) => {
    const body = robot.current;
    const parts = rig.current;
    const visit = story.current;
    const label = bubble.current;
    if (!body) return;
    body.visible = visit.playing;
    if (!visit.playing) return;

    visit.time += Math.min(delta, 0.1);
    const t = visit.time;
    const edge = viewport.width / 2 + 2.2;
    const total = reduced ? POP + HELLO + POP : IN + HELLO + OUT;
    let phase: "in" | "hello" | "out";
    let x = 0;
    let scale = 1;

    if (reduced) {
      phase = t < POP ? "in" : t < POP + HELLO ? "hello" : "out";
      scale = phase === "in" ? easeOutCubic(t / POP) : phase === "out" ? 1 - easeInCubic(Math.min(1, (t - POP - HELLO) / POP)) : 1;
    } else {
      phase = t < IN ? "in" : t < IN + HELLO ? "hello" : "out";
      x = phase === "in" ? -edge * (1 - easeOutCubic(t / IN)) : phase === "out" ? edge * easeInCubic(Math.min(1, (t - IN - HELLO) / OUT)) : 0;
    }

    if (t >= total) {
      visit.playing = false;
      body.visible = false;
      label?.removeAttribute("data-show");
      onStage("done", visit.run);
      return;
    }

    const moving = phase !== "hello" && !reduced;
    body.position.x = x;
    body.scale.setScalar(Math.max(scale, 0.001));
    // A bouncy hover-walk while gliding, a gentle float while waving.
    body.position.y = moving ? FLOOR + Math.abs(Math.sin(t * 5)) * 0.16 : FLOOR + Math.sin(t * 2) * 0.05;
    body.rotation.y = approach(body.rotation.y, moving ? 0.6 : 0, 0.08, delta);
    body.rotation.z = approach(body.rotation.z, moving ? -0.1 : 0, 0.08, delta);

    if (parts.head) {
      parts.head.rotation.y = approach(parts.head.rotation.y, moving ? -0.45 : Math.sin(t * 1.4) * 0.2, 0.1, delta);
    }
    if (parts.armRight) {
      parts.armRight.rotation.z =
        phase === "hello"
          ? approach(parts.armRight.rotation.z, 2.5 + Math.sin(t * 11) * 0.4, 0.25, delta)
          : approach(parts.armRight.rotation.z, ARM_REST + Math.sin(t * 6) * 0.18, 0.2, delta);
    }
    if (parts.armLeft) parts.armLeft.rotation.z = -ARM_REST - Math.sin(t * 6) * 0.18;
    setEyesOpen(parts, t % 3.3 > 0.13);
    if (parts.heart) parts.heart.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.3;
    parts.jet?.scale.setScalar(1 + Math.sin(t * 8) * 0.08);

    // The bubble rides above the head while it waves.
    if (label) {
      if (phase === "hello" && parts.head) {
        parts.head.getWorldPosition(head.current);
        head.current.y += 1.55;
        head.current.project(state.camera);
        label.style.left = `${((head.current.x + 1) / 2) * size.width}px`;
        label.style.top = `${((1 - head.current.y) / 2) * size.height}px`;
        label.setAttribute("data-show", "");
      } else {
        label.removeAttribute("data-show");
      }
    }
  });

  return (
    <group ref={robot} visible={false}>
      <Robot rig={rig} />
    </group>
  );
}

/** The robot that visits the contact section: glides in, waves and says thanks, glides off. */
export default function FooterRobot3D(props: Props) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      resize={{ offsetSize: true }}
      camera={{ fov: 30, position: [0, 0.3, 12], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.6 * Math.PI} />
      <directionalLight position={[3, 5, 6]} intensity={1.1 * Math.PI} />
      <pointLight position={[-3, -1, 4]} color="#C6F24E" intensity={1.6 * Math.PI} distance={20} decay={0} />
      <FooterScene {...props} />
    </Canvas>
  );
}
