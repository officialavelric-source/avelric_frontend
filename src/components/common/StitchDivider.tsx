import { motion, useReducedMotion } from "framer-motion";

export default function StitchDivider({ light = false }: { light?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-6xl px-6" aria-hidden="true">
      <svg viewBox="0 0 1000 2" className="w-full" height="2" preserveAspectRatio="none">
        <motion.line
          x1="0" y1="1" x2="1000" y2="1"
          stroke={light ? "#FAF9F6" : "#8A8578"}
          strokeWidth="1.5"
          strokeDasharray="10 8"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          opacity={light ? 0.5 : 0.45}
        />
      </svg>
    </div>
  );
}
