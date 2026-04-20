"use client";
import { useEffect, useRef } from "react";
import type * as THREE from "three"; // type-only — no runtime bundle cost

/**
 * Full-section Three.js background.
 * Features:
 *  - Four layered particle clouds (indigo / sky-blue / white / deep-blue)
 *  - Mouse-reactive camera parallax (smooth lag)
 *  - Six floating glowing orbs
 *  - Two slow-spinning transparent torus rings
 *  - Periodic shooting-star streak effects
 */

interface CloudRef { mesh: THREE.Points;  geo: THREE.BufferGeometry; mat: THREE.PointsMaterial }
interface OrbRef   { mesh: THREE.Mesh;    oy: number; speed: number; phase: number }
interface RingRef  { mesh: THREE.Mesh;    geo: THREE.TorusGeometry;  mat: THREE.MeshBasicMaterial }
interface StarRef  { line: THREE.Line;    life: number; maxLife: number; vx: number; vy: number }

export function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let animId = 0;
    let disposed = false;

    /* smooth mouse lag */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      mouse.ty = -((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    import("three").then((THREE) => {
      if (disposed || !el) return;

      const W = el.clientWidth  || window.innerWidth;
      const H = el.clientHeight || window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      Object.assign(renderer.domElement.style, { position: "absolute", inset: "0" });
      el.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 1000);
      camera.position.set(0, 0, 7);

      /* ── Particle clouds ── */
      const clouds: CloudRef[] = [];
      const makeCloud = (count: number, spread: number, color: number, size: number, opacity: number) => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * spread;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size, color, transparent: true, opacity, depthWrite: false, sizeAttenuation: true });
        const mesh = new THREE.Points(geo, mat);
        scene.add(mesh);
        clouds.push({ mesh, geo, mat });
      };
      makeCloud(1600, 24, 0x5260ce, 0.040, 0.52);
      makeCloud(800,  18, 0x75d3f7, 0.065, 0.28);
      makeCloud(350,  14, 0xffffff, 0.095, 0.22);
      makeCloud(250,   9, 0x3b5bdb, 0.055, 0.38);

      /* ── Floating orbs ── */
      const orbs: OrbRef[] = [];
      const orbDefs = [
        { p: [ 2.8,  1.8, -3.5], r: 0.18, c: 0x5260ce, o: 0.38 },
        { p: [-2.2, -1.2, -4.0], r: 0.13, c: 0x75d3f7, o: 0.32 },
        { p: [ 3.6, -2.2, -2.5], r: 0.11, c: 0x121c67, o: 0.42 },
        { p: [-3.2,  2.8, -3.0], r: 0.16, c: 0x5260ce, o: 0.28 },
        { p: [ 1.2, -3.0, -5.0], r: 0.09, c: 0x75d3f7, o: 0.45 },
        { p: [-1.5,  0.5, -2.0], r: 0.07, c: 0xffffff, o: 0.25 },
      ];
      orbDefs.forEach(({ p, r, c, o }, i) => {
        const geo  = new THREE.SphereGeometry(r, 10, 10);
        const mat  = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p[0], p[1], p[2]);
        scene.add(mesh);
        orbs.push({ mesh, oy: p[1], speed: 0.38 + i * 0.14, phase: i * 1.1 } as OrbRef);
      });

      /* ── Torus rings ── */
      const rings: RingRef[] = [];
      const makeRing = (radius: number, tube: number, rx: number, rz: number, color: number, opacity: number) => {
        const geo = new THREE.TorusGeometry(radius, tube, 6, 80);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = rx;
        mesh.rotation.z = rz;
        scene.add(mesh);
        rings.push({ mesh, geo, mat });
      };
      makeRing(4.2, 0.010,  Math.PI / 3.2, 0,            0x5260ce, 0.10);
      makeRing(2.6, 0.008, -Math.PI / 4,   Math.PI / 5,  0x75d3f7, 0.08);

      /* ── Shooting stars ── */
      const stars: StarRef[] = [];
      let nextStar = 140;

      const spawnStar = () => {
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * (0.06 + Math.random() * 0.07);
        const vy = Math.sin(angle) * (0.04 + Math.random() * 0.05);
        const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: 0x75d3f7, transparent: true, opacity: 0 });
        const line = new THREE.Line(geo, mat);
        line.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, -2);
        scene.add(line);
        stars.push({ line, life: 0, maxLife: 40 + Math.random() * 30, vx, vy } as StarRef);
      };

      let t = 0;

      const animate = () => {
        animId = requestAnimationFrame(animate);
        t++;

        /* smooth mouse */
        mouse.x += (mouse.tx - mouse.x) * 0.035;
        mouse.y += (mouse.ty - mouse.y) * 0.035;

        /* clouds */
        const [c0, c1, c2, c3] = clouds;
        c0.mesh.rotation.y += 0.00042 + mouse.x * 0.00014;
        c0.mesh.rotation.x += 0.00019 + mouse.y * 0.00010;
        c1.mesh.rotation.y -= 0.00030;
        c1.mesh.rotation.z += 0.00011 + mouse.x * 0.00008;
        c2.mesh.rotation.z += 0.00024;
        c3.mesh.rotation.y += 0.00036 - mouse.y * 0.00009;

        /* orbs */
        orbs.forEach(({ mesh, oy, speed, phase }) => {
          mesh.position.y = oy + Math.sin(t * speed * 0.008 + phase) * 0.28;
          mesh.rotation.y += 0.009;
        });

        /* rings */
        rings[0].mesh.rotation.z += 0.00055;
        rings[1].mesh.rotation.z -= 0.00070;

        /* camera parallax */
        camera.position.x += (mouse.x * 0.55 - camera.position.x) * 0.022;
        camera.position.y += (mouse.y * 0.38 - camera.position.y) * 0.022;
        camera.lookAt(scene.position);

        /* shooting stars */
        if (--nextStar <= 0) {
          spawnStar();
          nextStar = 180 + Math.floor(Math.random() * 200);
        }
        for (let i = stars.length - 1; i >= 0; i--) {
          const s = stars[i];
          s.life++;
          const prog = s.life / s.maxLife;
          const fade = prog < 0.2 ? prog / 0.2 : 1 - (prog - 0.2) / 0.8;
          (s.line.material as THREE.LineBasicMaterial).opacity = fade * 0.7;
          s.line.position.x += s.vx;
          s.line.position.y += s.vy;
          const geo  = s.line.geometry as THREE.BufferGeometry;
          const attr = geo.attributes.position as THREE.BufferAttribute;
          attr.setXYZ(0, s.line.position.x, s.line.position.y, s.line.position.z);
          attr.setXYZ(1, s.line.position.x - s.vx * 6, s.line.position.y - s.vy * 6, s.line.position.z);
          attr.needsUpdate = true;
          if (s.life >= s.maxLife) {
            scene.remove(s.line);
            geo.dispose();
            (s.line.material as THREE.Material).dispose();
            stars.splice(i, 1);
          }
        }

        renderer.render(scene, camera);
      };
      animate();

      /* resize */
      const onResize = () => {
        const nw = el.clientWidth, nh = el.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);

      /* cleanup */
      const cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        clouds.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
        orbs.forEach(({ mesh }) => {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        });
        rings.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
        stars.forEach(({ line }) => {
          (line.geometry as THREE.BufferGeometry).dispose();
          (line.material  as THREE.Material).dispose();
        });
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
      (el as HTMLDivElement & { _threeCleanup?: () => void })._threeCleanup = cleanup;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      const c = (el as HTMLDivElement & { _threeCleanup?: () => void })._threeCleanup;
      c?.();
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
