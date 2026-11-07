"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { IcosahedronGeometry, type Group, type Mesh, type Points } from "three";
import { ARM_REST, createRobotRig, Robot, setEyesOpen } from "./Robot";
import { approach, scatter, useRenderWhile, useWindowPointer } from "./three-utils";

type Props = {
  active: boolean;
  /** "wide": to the right of the headline; "narrow": centred in the space below the copy. */
  layout: "wide" | "narrow";
  /** How far the hero has scrolled away, 0 to 1 (written by the hero's ScrollTrigger). */
  scroll: RefObject<number>;
  reduced: boolean;
};

const CUBE_COLORS = ["#8A7CFF", "#C6F24E", "#F2EEFF", "#5440EE", "#C6F24E", "#F2EEFF"];
const cubes = CUBE_COLORS.map((color, i) => ({
  color,
  radius: 3.4 + (i % 2) * 0.6,
  angle: (i / CUBE_COLORS.length) * Math.PI * 2,
  speed: 0.22 + i * 0.03,
  height: (i - 2.5) * 0.35,
}));

/** Shell radius 2.6: the scene's widest part, used to fit it on small screens. */
const SHELL = 2.6;

function HeroScene({ active, layout, scroll, reduced }: Props) {
  useRenderWhile(active);
  const viewport = useThree((state) => state.viewport);
  const pointer = useWindowPointer();

  const group = useRef<Group>(null);
  const robot = useRef<Group>(null);
  const shell = useRef<Group>(null);
  const stars = useRef<Points>(null);
  const cubeMeshes = useRef<(Mesh | null)[]>([]);
  const rig = useRef(createRobotRig());
  const timers = useRef({ blinkAt: 2, waveFrom: 1.5 });

  const sphere = useMemo(() => new IcosahedronGeometry(SHELL, 1), []);
  useEffect(() => () => sphere.dispose(), [sphere]);
  const starPositions = useMemo(() => scatter(600, [34, 34, 34], 7), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { x: mx, y: my } = pointer.current;
    const parts = rig.current;

    // Placement: beside the headline, or fitted into the space below the copy.
    if (group.current) {
      if (layout === "wide") {
        group.current.position.set(Math.min(3.1, viewport.width / 2 - 2.6), 0, 0);
        group.current.scale.setScalar(1);
      } else {
        group.current.position.set(0, 0, 0);
        group.current.scale.setScalar(Math.min((viewport.height * 0.92) / (SHELL * 2), (viewport.width * 0.98) / (SHELL * 2)));
      }
      const away = reduced ? 0 : scroll.current;
      group.current.rotation.x = approach(group.current.rotation.x, away * 0.9, 0.12, delta);
      group.current.rotation.y = approach(group.current.rotation.y, away * 1.2, 0.12, delta);
    }

    // The robot floats, sways a little and turns toward the pointer.
    if (robot.current) {
      robot.current.position.y = -0.15 + Math.sin(t * 1.3) * 0.14;
      robot.current.rotation.z = Math.sin(t * 0.8) * 0.04;
      robot.current.rotation.y = approach(robot.current.rotation.y, mx * 0.5, 0.05, delta);
    }
    if (parts.head) {
      parts.head.rotation.y = approach(parts.head.rotation.y, mx * 0.9, 0.08, delta);
      parts.head.rotation.x = approach(parts.head.rotation.x, my * 0.45, 0.08, delta);
    }

    // Blink every 2 to 5 seconds.
    const timer = timers.current;
    if (t > timer.blinkAt) {
      const closed = t - timer.blinkAt < 0.14;
      setEyesOpen(parts, !closed);
      if (!closed) timer.blinkAt = t + 2 + Math.random() * 3;
    }

    // Wave the right arm for about 2s every 8s.
    if (parts.armRight) {
      const waving = t - timer.waveFrom;
      if (waving > 0 && waving < 2.2) {
        parts.armRight.rotation.z = approach(parts.armRight.rotation.z, 2.5 + Math.sin(waving * 11) * 0.35, 0.2, delta);
      } else {
        parts.armRight.rotation.z = approach(parts.armRight.rotation.z, ARM_REST, 0.1, delta);
        if (waving > 7) timer.waveFrom = t + 1;
      }
    }

    if (parts.heart) parts.heart.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.3;
    parts.jet?.scale.setScalar(1 + Math.sin(t * 6) * 0.06);

    // The AI sphere turns, the cubes orbit, the stars drift.
    if (shell.current) {
      shell.current.rotation.y = t * 0.13;
      shell.current.rotation.x = t * 0.07;
    }
    cubes.forEach((cube, i) => {
      const mesh = cubeMeshes.current[i];
      if (!mesh) return;
      const angle = cube.angle + t * cube.speed;
      mesh.position.set(Math.cos(angle) * cube.radius, cube.height + Math.sin(t + cube.angle) * 0.25, Math.sin(angle) * cube.radius);
      mesh.rotation.set(t * 0.9, t * 0.6, 0);
    });
    if (stars.current) stars.current.rotation.y = t * 0.012;

    // The camera drifts with the pointer (not with reduced motion).
    const camera = state.camera;
    camera.position.x = approach(camera.position.x, reduced ? 0 : mx * 1.4, 0.05, delta);
    camera.position.y = approach(camera.position.y, reduced ? 0 : -my, 0.05, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={group}>
        <group ref={shell}>
          <mesh geometry={sphere}>
            <meshBasicMaterial color="#8A7CFF" wireframe transparent opacity={0.32} />
          </mesh>
          <points geometry={sphere}>
            <pointsMaterial color="#D7D0FF" size={0.09} />
          </points>
        </group>
        {cubes.map((cube, i) => (
          <mesh
            key={i}
            ref={(mesh: Mesh | null) => {
              cubeMeshes.current[i] = mesh;
            }}
          >
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={cube.color} roughness={0.3} />
          </mesh>
        ))}
        <group ref={robot}>
          <Robot rig={rig} scale={0.78} />
        </group>
      </group>
      <points ref={stars}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#8F88B8" size={0.035} />
      </points>
    </>
  );
}

/**
 * The Shopify hero's 3D robot inside its rotating "AI sphere", lit violet and
 * white. Colours are kept true (no tone mapping) so the lime glows stay vivid.
 */
export default function HeroRobot3D(props: Props) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      resize={{ offsetSize: true }}
      camera={{ fov: 40, position: [0, 0, 10], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={() => setReady(true)}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease-out", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.55 * Math.PI} />
      <directionalLight position={[3, 5, 6]} intensity={1.1 * Math.PI} />
      <pointLight position={[-4, -2, 4]} color="#8A7CFF" intensity={2.4 * Math.PI} distance={25} decay={0} />
      <HeroScene {...props} />
    </Canvas>
  );
}
