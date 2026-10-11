import clsx from "clsx";

const blob = "absolute size-[55vmax] rounded-full animate-drift will-change-transform";

/** Three huge, faint colour blobs fixed behind the page, drifting slowly. */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-1 overflow-hidden">
      <span
        className={clsx(
          blob,
          "top-[5vh] left-[-18vmax] bg-[radial-gradient(circle,var(--violet),transparent_62%)] opacity-33",
        )}
      />
      <span
        className={clsx(
          blob,
          "top-[40vh] right-[-22vmax] bg-[radial-gradient(circle,var(--lime),transparent_62%)] opacity-20 [animation-duration:30s]",
        )}
      />
      <span
        className={clsx(
          blob,
          "bottom-[-30vmax] left-[30vw] bg-[radial-gradient(circle,var(--pink),transparent_62%)] opacity-16 [animation-duration:36s]",
        )}
      />
    </div>
  );
}
