import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { HTMLAttributes, useCallback, useMemo } from "react";

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  perspective?: number;
  beamsPerSide?: number;
  beamSize?: number;
  beamDelayMax?: number;
  beamDelayMin?: number;
  beamDuration?: number;
  gridColor?: string;
}

const Beam = ({
  width,
  x,
  delay,
  duration,
}: {
  width: string | number;
  x: string | number;
  delay: number;
  duration: number;
}) => {
  const hue = Math.floor(Math.random() * 360);
  const ar = Math.floor(Math.random() * 10) + 1;

  return (
    <motion.div
      style={{
        "--x": `${x}%`,
        "--width": `${width}%`,
        "--aspect-ratio": ar,
        "--background": `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
      } as React.CSSProperties}
      className="absolute left-[var(--x)] top-0 [aspect-ratio:1/var(--aspect-ratio)] w-[var(--width)] bg-[var(--background)]"
      initial={{ y: "0%", opacity: 0 }}
      animate={{ y: "100%", opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "hsl(var(--border))",
  ...props
}) => {
  const generateBeams = useCallback(() => {
    const beams = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay =
        Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      beams.push({ x, delay });
    }
    return beams;
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

  const topBeams = useMemo(() => generateBeams(), [generateBeams]);
  const rightBeams = useMemo(() => generateBeams(), [generateBeams]);
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
  const leftBeams = useMemo(() => generateBeams(), [generateBeams]);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden rounded-lg border bg-background",
        className
      )}
      {...props}
    >
      <div
        style={{
          "--perspective": `${perspective}px`,
          "--grid-color": gridColor,
          "--beam-size": `${beamSize}%`,
        } as React.CSSProperties}
        className="pointer-events-none absolute left-0 top-0 size-full overflow-hidden [perspective:var(--perspective)]"
      >
        <div className="absolute left-0 top-0 size-full [transform-style:preserve-3d] [transform:rotateX(85deg)]">
          {/* Grid background */}
          <div
            className="absolute left-[-50%] top-[-50%] size-[200%]"
            style={{
              backgroundImage: `
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)
              `,
              backgroundSize: "var(--beam-size) var(--beam-size)",
            }}
          />

          {/* top side */}
          <div className="absolute left-0 top-0 size-full overflow-hidden [transform:translateZ(0px)]">
            {topBeams.map((beam, index) => (
              <Beam
                key={`top-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* bottom side */}
          <div className="absolute left-0 top-0 size-full overflow-hidden [transform:rotateX(180deg)_translateZ(0px)]">
            {bottomBeams.map((beam, index) => (
              <Beam
                key={`bottom-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* left side */}
          <div className="absolute left-0 top-0 size-full overflow-hidden [transform:rotateY(90deg)_translateZ(0px)]">
            {leftBeams.map((beam, index) => (
              <Beam
                key={`left-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* right side */}
          <div className="absolute left-0 top-0 size-full overflow-hidden [transform:rotateY(-90deg)_translateZ(0px)]">
            {rightBeams.map((beam, index) => (
              <Beam
                key={`right-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex size-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};
