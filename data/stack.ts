/**
 * The tech stack on the software home: the four groups in "One engineer, the
 * whole stack" and the pills circling the orbit next to them.
 */

export const stackGroups = [
  { title: "Front end", items: "React, Next.js, TypeScript, Tailwind CSS" },
  { title: "Back end", items: "Laravel, PHP, Node.js, REST APIs" },
  { title: "Data", items: "MySQL, authentication, payments" },
  { title: "AI", items: "LLM APIs, AI agents, RAG search" },
];

/** Pills on the orbit's inner and outer ring, placed evenly from the top. */
export const orbitRings = {
  inner: ["React", "Next.js", "TypeScript", "Tailwind"],
  outer: ["Laravel", "PHP", "Node.js", "MySQL", "REST APIs", "AI agents", "LLM APIs", "RAG"],
};

/** The lime core in the middle of the orbit. */
export const orbitCore = { name: "Arslan", role: "full stack" };
