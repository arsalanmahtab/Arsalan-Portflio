import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, type RefObject } from "react";
import { MeshStandardMaterial, type Group, type Mesh } from "three";

const LIME = "#C6F24E";

/** The parts a scene animates: head turn, blinking eyes, arms, the heart light and the jet ring. */
export type RobotRig = {
  head: Group | null;
  eyes: Mesh[];
  armLeft: Group | null;
  armRight: Group | null;
  heart: MeshStandardMaterial | null;
  jet: Mesh | null;
};

export const createRobotRig = (): RobotRig => ({
  head: null,
  eyes: [],
  armLeft: null,
  armRight: null,
  heart: null,
  jet: null,
});

/** Arms rest angled out by this much (radians); the wave raises the right one to about 2.5. */
export const ARM_REST = 0.22;

function useRobotMaterials() {
  const materials = useMemo(
    () => ({
      white: new MeshStandardMaterial({ color: "#F3F3F8", roughness: 0.22, metalness: 0.08 }),
      dark: new MeshStandardMaterial({ color: "#0D0D14", roughness: 0.12, metalness: 0.5 }),
      glow: new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 1 }),
      heart: new MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 1 }),
    }),
    [],
  );
  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);
  return materials;
}

/**
 * The cute glossy robot from the hero and the footer, built from primitives:
 * white body, black visor, lime eyes and smile, ear discs with lime rings, an
 * antenna bulb, a chest plate with a lime heart, and a lime jet ring instead of legs.
 * About 4.2 units tall, centred near its chest.
 */
export function Robot({ rig, ...props }: ThreeElements["group"] & { rig: RefObject<RobotRig> }) {
  const m = useRobotMaterials();

  const arm = (side: 1 | -1) => (
    <group
      ref={(group: Group | null) => {
        rig.current[side === 1 ? "armRight" : "armLeft"] = group;
      }}
      position={[0.88 * side, -0.12, 0]}
      rotation-z={ARM_REST * side}
    >
      <mesh material={m.white} position-y={-0.38}>
        <cylinderGeometry args={[0.13, 0.11, 0.7, 16]} />
      </mesh>
      <mesh material={m.dark} position-y={-0.8}>
        <sphereGeometry args={[0.19, 20, 16]} />
      </mesh>
    </group>
  );

  return (
    <group {...props}>
      <group
        ref={(group: Group | null) => {
          rig.current.head = group;
        }}
        position-y={1.15}
      >
        <mesh material={m.white} scale={[1.15, 0.95, 1]}>
          <sphereGeometry args={[1, 48, 36]} />
        </mesh>
        <mesh material={m.dark} scale={[1.15, 0.95, 1]}>
          <sphereGeometry args={[1.012, 48, 36, Math.PI / 2 - 0.75, 1.5, Math.PI * 0.3, Math.PI * 0.42]} />
        </mesh>
        {[-0.34, 0.34].map((x, index) => (
          <mesh
            key={x}
            ref={(eye: Mesh | null) => {
              if (eye) rig.current.eyes[index] = eye;
            }}
            material={m.glow}
            position={[x, 0.06, 0.96]}
            scale={[0.12, 0.19, 0.05]}
          >
            <sphereGeometry args={[1, 20, 16]} />
          </mesh>
        ))}
        <mesh material={m.glow} position={[0, -0.2, 0.97]} rotation-z={Math.PI}>
          <torusGeometry args={[0.13, 0.03, 8, 24, Math.PI]} />
        </mesh>
        {[-1.17, 1.17].map((x) => (
          <group key={x}>
            <mesh material={m.dark} position-x={x} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.22, 0.22, 0.16, 28]} />
            </mesh>
            <mesh material={m.glow} position-x={x * 1.075} rotation-y={Math.PI / 2}>
              <torusGeometry args={[0.14, 0.035, 8, 24]} />
            </mesh>
          </group>
        ))}
        <mesh material={m.dark} position-y={1.1}>
          <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
        </mesh>
        <mesh material={m.glow} position-y={1.36}>
          <sphereGeometry args={[0.12, 20, 16]} />
        </mesh>
      </group>

      <mesh material={m.dark} position-y={0.3}>
        <cylinderGeometry args={[0.24, 0.3, 0.3, 24]} />
      </mesh>
      <mesh material={m.white} position-y={-0.5} scale={[1, 1.08, 0.85]}>
        <sphereGeometry args={[0.85, 48, 36]} />
      </mesh>
      <mesh material={m.dark} position={[0, -0.32, 0.7]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 32]} />
      </mesh>
      <mesh
        ref={(heart: Mesh | null) => {
          rig.current.heart = heart ? m.heart : null;
        }}
        material={m.heart}
        position={[0, -0.32, 0.74]}
      >
        <sphereGeometry args={[0.12, 20, 16]} />
      </mesh>
      {arm(-1)}
      {arm(1)}
      <mesh
        ref={(jet: Mesh | null) => {
          rig.current.jet = jet;
        }}
        material={m.glow}
        position-y={-1.55}
        rotation-x={Math.PI / 2}
      >
        <torusGeometry args={[0.42, 0.045, 10, 40]} />
      </mesh>
    </group>
  );
}

/** Blink: eyes squash shut for a moment. */
export function setEyesOpen(rig: RobotRig, open: boolean) {
  rig.eyes.forEach((eye) => (eye.scale.y = open ? 0.19 : 0.02));
}
