"use client";
import { useEffect, useRef } from "react";

export function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let animId: number;
    let disposed = false;

    import("three").then((THREE) => {
      if (disposed || !el) return;

      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
      camera.position.z = 6;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      el.appendChild(renderer.domElement);

      // Primary particle cloud (indigo)
      const makeParticles = (count: number, spread: number, color: number, size: number, opacity: number) => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
          pos[i] = (Math.random() - 0.5) * spread;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size, color, transparent: true, opacity, depthWrite: false });
        return { mesh: new THREE.Points(geo, mat), geo, mat };
      };

      const p1 = makeParticles(1400, 18, 0x5260ce, 0.04, 0.55);
      const p2 = makeParticles(600, 14, 0x75d3f7, 0.07, 0.30);
      const p3 = makeParticles(300, 10, 0xffffff, 0.09, 0.20);

      scene.add(p1.mesh, p2.mesh, p3.mesh);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        p1.mesh.rotation.y += 0.00040;
        p1.mesh.rotation.x += 0.00018;
        p2.mesh.rotation.y -= 0.00030;
        p2.mesh.rotation.x += 0.00012;
        p3.mesh.rotation.z += 0.00025;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!el) return;
        const nw = el.clientWidth;
        const nh = el.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);

      // Cleanup stored on closure
      const cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        [p1, p2, p3].forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };

      // Store cleanup on the element ref for the outer return
      (el as HTMLDivElement & { _threeCleanup?: () => void })._threeCleanup = cleanup;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      const cleanup = (el as HTMLDivElement & { _threeCleanup?: () => void })._threeCleanup;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
