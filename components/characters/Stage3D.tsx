"use client";

import { Component, useEffect, useRef, useState, type ComponentType, type HTMLAttributes, type ReactNode } from "react";

/** Renders nothing if a scene throws, so a WebGL failure never breaks the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

let webgl: boolean | undefined;

/** Checked once per page load; the test context is released straight away. */
function supportsWebGL() {
  if (webgl === undefined) {
    try {
      const context = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
      webgl = context !== null;
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

type Props<P extends { active: boolean }> = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** A scene loaded with next/dynamic (ssr: false); it renders its own <Canvas>. */
  scene: ComponentType<P>;
  /** Everything the scene needs except `active`, which the stage provides. */
  sceneProps: NoInfer<Omit<P, "active">>;
  /** Load straight away instead of when the stage comes within 300px of the viewport. */
  eager?: boolean;
  /** DOM laid over the canvas, e.g. speech bubbles. */
  children?: ReactNode;
};

/**
 * A fixed-size box for a 3D character. Loads the scene when it nears the
 * viewport, tells it when to render (on screen and the tab visible), shows
 * nothing without WebGL, and mounts a fresh canvas each time the page is shown:
 * Next.js keeps visited pages mounted but hidden, and hiding tears down the
 * scene's renderer and WebGL context.
 */
export function Stage3D<P extends { active: boolean }>({ scene: Scene, sceneProps, eager = false, children, ...rest }: Props<P>) {
  const root = useRef<HTMLDivElement>(null);
  const [generation, setGeneration] = useState(0);
  const [near, setNear] = useState(eager);
  const [onScreen, setOnScreen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    if (!supportsWebGL()) return;
    const frame = requestAnimationFrame(() => setGeneration((current) => current + 1));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const approaching = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "300px 0px" });
    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    approaching.observe(element);
    visible.observe(element);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      approaching.disconnect();
      visible.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={root} {...rest}>
      {generation > 0 && near && (
        <SceneBoundary>
          <Scene key={generation} {...({ ...sceneProps, active: onScreen && pageVisible } as P)} />
        </SceneBoundary>
      )}
      {children}
    </div>
  );
}
