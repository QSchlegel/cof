"use client";
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "@tsparticles/engine";

export function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Particles
        id="tsparticles-bg"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: "#3b82f6" }, // Cardano blue
            links: {
              enable: true,
              color: "#3b82f6",
              opacity: 0.2,
              width: 1,
              distance: 120,
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: false,
              straight: false,
              outModes: { default: "out" },
            },
            opacity: { value: 0.3 },
            size: { value: 3, random: { enable: true, minimumValue: 1.5 } },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
} 