"use client";

import { Billboard } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  CanvasTexture,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { approach, scatter, useRenderWhile } from "./three-utils";

type Props = {
  active: boolean;
  /** Each new number makes the android raise its right arm and wave. */
  greet: number;
  reduced: boolean;
  /** The speech bubble, kept above the android's head. */
  bubble: RefObject<HTMLElement | null>;
};

const LIME = "#C6F24E";

/** The code on the three floating panels and the laptop screen. */
const PANELS = [
  { title: "Hero.tsx", lines: ["export function Hero() {", "  const [open, setOpen] =", "    useState(false);", "  return (", "    <Button onClick={go}>", "      Get started", "    </Button>", "  );", "}", ""] },
  { title: "OrderController.php", lines: ["class OrderController", "{", "  public function store(", "    Request $request", "  ) {", "    return Order::create(", "      $request->validated()", "    );", "  }", "}", ""] },
  { title: "agent.ts", lines: ["const res = await llm.chat({", "  model: 'your-model',", "  messages,", "  tools: [searchDocs],", "});", "for await (const t of res)", "  stream.write(t);", ""] },
];
const LAPTOP = { title: "app/page.tsx", lines: ["export default function Page() {", "  return <Dashboard />;", "}", "", "// shipped today", ""] };

/** A code panel drawn on a 2D canvas: window dots, file name and coloured lines from `offset`. */
function drawCode(context: CanvasRenderingContext2D, title: string, lines: string[], offset: number) {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgba(16,14,32,0.78)";
  context.strokeStyle = "rgba(198,242,78,0.55)";
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(4, 4, width - 8, height - 8, 22);
  context.fill();
  context.stroke();
  ["#ff6b6b", "#ffd166", LIME].forEach((color, i) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(30 + i * 22, 30, 7, 0, Math.PI * 2);
    context.fill();
  });
  context.fillStyle = "rgba(255,255,255,0.55)";
  context.font = "600 20px ui-monospace, Menlo, Consolas, monospace";
  context.fillText(title, 104, 37);
  context.font = "500 22px ui-monospace, Menlo, Consolas, monospace";
  const visible = Math.floor((height - 80) / 30);
  for (let i = 0; i < visible; i++) {
    const line = lines[(offset + i) % lines.length];
    context.fillStyle = /^\s*(function|class|const|return|public|for|export|await|import)/.test(line)
      ? "#A99FFF"
      : /['"]/.test(line)
        ? LIME
        : "#E8E6F5";
    context.fillText(line, 26, 84 + i * 30);
  }
}

function useCodeTexture(title: string, lines: string[]) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 330;
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    const context = canvas.getContext("2d");
    if (context) drawCode(context, title, lines, 0);
    return { map, context };
  }, [title, lines]);
  useEffect(() => () => texture.map.dispose(), [texture]);
  return texture;
}

function CodePanel({ index, panel }: { index: number; panel: (typeof PANELS)[number] }) {
  const holder = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const { map, context } = useCodeTexture(panel.title, panel.lines);
  const scroll = useRef({ offset: 0, last: 0 });
  const start = (index / PANELS.length) * Math.PI * 2 + 0.6;
  const height = 0.55 + (index % 2) * 0.55;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const angle = start + t * 0.12;
    holder.current?.position.set(Math.cos(angle) * 2.35, height + Math.sin(t * 0.9 + index) * 0.08, Math.sin(angle) * 1.3 - 0.3);
    if (material.current) material.current.opacity = 0.55 + (Math.sin(angle) + 1) * 0.22;
    // The code scrolls one line a second.
    if (context && t - scroll.current.last > 0.9) {
      scroll.current.last = t;
      scroll.current.offset = (scroll.current.offset + 1) % panel.lines.length;
      drawCode(context, panel.title, panel.lines, scroll.current.offset);
      map.needsUpdate = true;
    }
  });

  return (
    <Billboard ref={holder}>
      <mesh>
        <planeGeometry args={[1.45, 0.94]} />
        <meshBasicMaterial ref={material} map={map} transparent side={DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

function AndroidScene({ active, greet, reduced, bubble }: Props) {
  useRenderWhile(active);
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const materials = useMemo(
    () => ({
      body: new MeshStandardMaterial({ color: "#17161F", roughness: 0.35, metalness: 0.55 }),
      trim: new MeshStandardMaterial({ color: "#E9E7F2", roughness: 0.25, metalness: 0.2 }),
      visor: new MeshStandardMaterial({ color: "#050508", roughness: 0.05, metalness: 0.9 }),
      led: new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 1.6 }),
      ring: new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 1.6 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);
  const laptop = useCodeTexture(LAPTOP.title, LAPTOP.lines);
  const dust = useMemo(() => scatter(160, [7, 5, 4], 11), []);

  const world = useRef<Group>(null);
  const character = useRef<Group>(null);
  const platform = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eye = useRef<Mesh>(null);
  const dustCloud = useRef<Group>(null);
  const arms = useRef<{ shoulder: Group | null; elbow: Group | null }[]>([
    { shoulder: null, elbow: null },
    { shoulder: null, elbow: null },
  ]);
  const pointer = useRef({ x: 0, y: 0 });
  const timers = useRef({ blinkAt: 1.5, waveUntil: 0 });
  const bubbleAnchor = useRef(new Vector3());

  // The pointer relative to the canvas centre, -1 to 1.
  const element = useThree((state) => state.gl.domElement);
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      pointer.current.x = Math.max(-1, Math.min(1, (event.clientX - (box.left + box.width / 2)) / (box.width / 2)));
      pointer.current.y = Math.max(-1, Math.min(1, (event.clientY - (box.top + box.height / 2)) / (box.height / 2)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [element]);

  // Pull back on tall, narrow stages so the whole scene fits.
  useEffect(() => {
    camera.position.z = size.width / size.height < 0.9 ? 8 : 6.4;
  }, [camera, size]);

  // A greeting raises the right arm for a 2.4s wave.
  const clock = useThree((state) => state.clock);
  useEffect(() => {
    if (greet > 0) timers.current.waveUntil = clock.elapsedTime + 2.4;
  }, [greet, clock]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const px = pointer.current.x;
    const py = pointer.current.y;
    const waving = t < timers.current.waveUntil;
    const glancing = t % 9 > 6.5 && t % 9 < 8;

    // Float on the platform; the LED ring pulses.
    if (character.current) character.current.position.y = Math.sin(t * 1.1) * 0.06;
    if (platform.current) platform.current.position.y = -1.22 + Math.sin(t * 1.1) * 0.06;
    materials.ring.emissiveIntensity = 1.2 + Math.sin(t * 2) * 0.4;

    // Head: watches the laptop, follows the pointer, and looks up at the viewer now and then.
    if (head.current) {
      const lookUp = waving || glancing;
      head.current.rotation.y = approach(head.current.rotation.y, px * (lookUp ? 0.25 : 0.45), 0.07, delta);
      head.current.rotation.x = approach(head.current.rotation.x, lookUp ? -0.05 + py * 0.1 : 0.28 + py * 0.12, 0.07, delta);
      head.current.rotation.z = waving ? Math.sin(t * 3) * 0.08 : 0;
    }

    // Blink every 2.5 to 5 seconds.
    if (eye.current && t > timers.current.blinkAt) {
      const closed = t - timers.current.blinkAt < 0.12;
      eye.current.scale.y = closed ? 0.005 : 0.035;
      if (!closed) timers.current.blinkAt = t + 2.5 + Math.random() * 2.5;
    }

    // Forearms take turns typing; the right arm waves when greeting.
    const [left, right] = arms.current;
    const typing = Math.sin(t * 14) * 0.07;
    if (left.shoulder && left.elbow) {
      left.shoulder.rotation.x = approach(left.shoulder.rotation.x, -0.5, 0.12, delta);
      left.elbow.rotation.x = approach(left.elbow.rotation.x, -1 + typing, 0.3, delta);
    }
    if (right.shoulder && right.elbow) {
      if (waving) {
        right.shoulder.rotation.x = approach(right.shoulder.rotation.x, -0.1, 0.15, delta);
        right.shoulder.rotation.z = approach(right.shoulder.rotation.z, 2.55, 0.15, delta);
        right.elbow.rotation.x = approach(right.elbow.rotation.x, -0.35, 0.15, delta);
        right.elbow.rotation.z = Math.sin(t * 11) * 0.45;
      } else {
        right.shoulder.rotation.x = approach(right.shoulder.rotation.x, -0.5, 0.12, delta);
        right.shoulder.rotation.z = approach(right.shoulder.rotation.z, -0.06, 0.12, delta);
        right.elbow.rotation.x = approach(right.elbow.rotation.x, -1 - typing, 0.3, delta);
        right.elbow.rotation.z = approach(right.elbow.rotation.z, 0, 0.2, delta);
      }
    }

    if (dustCloud.current) {
      dustCloud.current.rotation.y = t * 0.03;
      dustCloud.current.position.y = Math.sin(t * 0.3) * 0.1;
    }

    // The scene tilts with the pointer (not with reduced motion).
    if (world.current) world.current.rotation.y = approach(world.current.rotation.y, reduced ? 0 : px * 0.25, 0.04, delta);
    state.camera.position.y = approach(state.camera.position.y, reduced ? 0.7 : 0.7 - py * 0.3, 0.04, delta);
    state.camera.lookAt(0, -0.1, 0);

    // Keep the speech bubble above the head.
    const label = bubble.current;
    if (label && head.current) {
      head.current.localToWorld(bubbleAnchor.current.set(0, 0.62, 0));
      bubbleAnchor.current.project(state.camera);
      label.style.left = `${((bubbleAnchor.current.x + 1) / 2) * 100}%`;
      label.style.top = `${(1 - (bubbleAnchor.current.y + 1) / 2) * 100 - 14}%`;
    }
  });

  const { body, trim, visor, led, ring } = materials;

  const arm = (side: 1 | -1, index: 0 | 1) => (
    <group
      ref={(group: Group | null) => {
        arms.current[index].shoulder = group;
      }}
      position={[0.53 * side, -0.1, 0]}
      rotation={[-0.5, 0, -0.06 * side]}
    >
      <mesh material={trim}>
        <sphereGeometry args={[0.13, 20, 16]} />
      </mesh>
      <mesh material={body} position-y={-0.25}>
        <cylinderGeometry args={[0.09, 0.08, 0.48, 16]} />
      </mesh>
      <group
        ref={(group: Group | null) => {
          arms.current[index].elbow = group;
        }}
        position-y={-0.5}
        rotation-x={-1}
      >
        <mesh material={body} position-y={-0.22}>
          <cylinderGeometry args={[0.08, 0.07, 0.44, 16]} />
        </mesh>
        <mesh material={trim} position-y={-0.46}>
          <sphereGeometry args={[0.09, 16, 12]} />
        </mesh>
      </group>
    </group>
  );

  const leg = (side: 1 | -1) => (
    <group key={side} position={[0.24 * side, -0.95, 0.05]} rotation={[-1.45, 0, 0.55 * side]}>
      <mesh material={body} position-y={-0.3}>
        <cylinderGeometry args={[0.12, 0.1, 0.6, 16]} />
      </mesh>
      <group position-y={-0.6} rotation-z={-1.92 * side}>
        <mesh material={trim}>
          <sphereGeometry args={[0.11, 16, 12]} />
        </mesh>
        <mesh material={body} position-y={-0.25}>
          <cylinderGeometry args={[0.09, 0.08, 0.5, 16]} />
        </mesh>
      </group>
    </group>
  );

  return (
    <>
      <group ref={world}>
        {/* Floating glass platform with a lime LED ring and a thin violet ring. */}
        <group ref={platform} position-y={-1.22}>
          <mesh>
            <cylinderGeometry args={[1.55, 1.6, 0.1, 64]} />
            <meshStandardMaterial color="#221E3A" roughness={0.2} metalness={0.6} transparent opacity={0.85} />
          </mesh>
          <mesh material={ring} position-y={0.05} rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.58, 0.018, 8, 96]} />
          </mesh>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.9, 0.008, 8, 96]} />
            <meshBasicMaterial color="#8A7CFF" transparent opacity={0.5} />
          </mesh>
        </group>

        <group ref={character}>
          <mesh material={body} position-y={-0.92} scale={[1.1, 0.55, 0.9]}>
            <sphereGeometry args={[0.42, 32, 24]} />
          </mesh>
          <mesh material={body} position-y={-0.3} scale={[1, 1.22, 0.74]}>
            <sphereGeometry args={[0.5, 40, 30]} />
          </mesh>
          <mesh material={led} position={[0, -0.12, 0.37]}>
            <boxGeometry args={[0.26, 0.03, 0.02]} />
          </mesh>
          <mesh material={trim} position-y={0.3} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.2, 0.035, 10, 32]} />
          </mesh>
          <mesh material={body} position-y={0.4}>
            <cylinderGeometry args={[0.11, 0.13, 0.26, 20]} />
          </mesh>

          <group ref={head} position-y={0.86}>
            <mesh material={body} scale={[0.92, 1.05, 1]}>
              <sphereGeometry args={[0.42, 48, 36]} />
            </mesh>
            <mesh material={visor} scale={[0.92, 1.05, 1]}>
              <sphereGeometry args={[0.425, 48, 36, Math.PI / 2 - 0.9, 1.8, Math.PI * 0.28, Math.PI * 0.36]} />
            </mesh>
            <mesh ref={eye} material={led} position={[0, 0.04, 0.41]} scale={[0.22, 0.035, 0.03]}>
              <sphereGeometry args={[1, 24, 12]} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} material={trim} position-x={0.39 * side} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
              </mesh>
            ))}
          </group>

          {arm(-1, 0)}
          {arm(1, 1)}
          {leg(-1)}
          {leg(1)}

          {/* Holographic laptop: metal base, keys and a see-through glowing screen. */}
          <group position={[0, -0.7, 0.78]}>
            <mesh>
              <boxGeometry args={[1.08, 0.035, 0.66]} />
              <meshStandardMaterial color="#C9C7D6" roughness={0.25} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.019, -0.04]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.9, 0.36]} />
              <meshBasicMaterial color="#2A2840" />
            </mesh>
            <group position={[0, 0.02, 0.33]} rotation-x={-0.22}>
              <mesh position-y={0.34}>
                <planeGeometry args={[1.06, 0.68]} />
                <meshBasicMaterial map={laptop.map} transparent opacity={0.9} side={DoubleSide} depthWrite={false} toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>

        {PANELS.map((panel, index) => (
          <CodePanel key={panel.title} index={index} panel={panel} />
        ))}
      </group>

      <group ref={dustCloud}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dust, 3]} />
          </bufferGeometry>
          <pointsMaterial color={LIME} size={0.03} transparent opacity={0.6} />
        </points>
      </group>
    </>
  );
}

/**
 * The software home's developer android: classy, not cute. Lit with a violet
 * rim and a lime fill, ACES filmic tone mapping and sRGB output (the R3F defaults).
 */
export default function DevAndroid3D(props: Props) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      dpr={[1, 2]}
      resize={{ offsetSize: true }}
      camera={{ fov: 34, position: [0, 0.7, 6.4], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease-out", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.35 * Math.PI} />
      <directionalLight position={[3, 4, 5]} intensity={1.2 * Math.PI} />
      <pointLight position={[-2.5, 1.5, -2.5]} color="#8A7CFF" intensity={3 * Math.PI} distance={12} decay={0} />
      <pointLight position={[1.5, -1, 2.5]} color={LIME} intensity={1.4 * Math.PI} distance={8} decay={0} />
      <AndroidScene {...props} />
    </Canvas>
  );
}
