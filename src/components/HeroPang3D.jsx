import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import './HeroPang3D.css';

gsap.registerPlugin(ScrollTrigger);

const damp = (current, target, lambda, delta) =>
  THREE.MathUtils.damp(current, target, lambda, delta);

function HeroPang3D({ modelUrl, onReady, onProgress, onError, playEntrance }) {
  const mountRef = useRef(null);
  const introTimelineRef = useRef(null);

  useEffect(() => {
    if (playEntrance) introTimelineRef.current?.play();
  }, [playEntrance]);

  useEffect(() => {
    const mount = mountRef.current;
    const hero = mount?.closest('.figmaHero');
    if (!mount || !hero) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 100);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !coarsePointer,
        powerPreference: 'high-performance',
      });
    } catch {
      mount.classList.add('is-error');
      onError?.();
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    mount.appendChild(renderer.domElement);

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(environment, 0.03).texture;
    scene.environment = environmentTexture;

    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x080627, 2.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 5);
    keyLight.position.set(0, 2.31, 5);
    scene.add(keyLight);

    const blueLight = new THREE.PointLight(0x4754ff, 4, 14, 2);
    blueLight.position.set(-4, -1.4, 2);
    scene.add(blueLight);

    const rimLight = new THREE.DirectionalLight(0xbcb8ff, 1.2);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    const pivot = new THREE.Group();
    pivot.scale.setScalar(0.95);
    scene.add(pivot);

    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    const entrance = {
      rotateX: reduceMotion ? 0 : 0.16,
      rotateY: reduceMotion ? 0 : -0.55,
      y: reduceMotion ? 0 : 0.06,
      z: reduceMotion ? 0 : -0.35,
      scale: reduceMotion ? 1 : 0.88,
      highlight: reduceMotion ? 1 : 0.72,
    };
    const fittedSize = new THREE.Vector3(1, 1, 1);
    let model;
    let frameId = 0;
    let elapsed = 0;
    let previousFrameTime = 0;
    let introTimeline;
    let visible = true;
    let disposed = false;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const updateOpacity = (progress) => {
      mount.style.opacity = String(1 - THREE.MathUtils.smoothstep(progress, 0.35, 0.95));
    };

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.25 : 1.6));
      renderer.setSize(width, height, false);

      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const distanceForHeight = fittedSize.y / (2 * Math.tan(halfFov));
      const distanceForWidth = fittedSize.x / (2 * Math.tan(halfFov) * camera.aspect);
      camera.position.set(0, 0, Math.max(distanceForHeight, distanceForWidth) * 1.08 + fittedSize.z * 0.5);
      camera.lookAt(0, 0, 0);

      if (reduceMotion) renderer.render(scene, camera);
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      previousFrameTime = 0;
    };

    const render = (time) => {
      if (disposed || !visible || !model) {
        frameId = 0;
        return;
      }

      const delta = Math.min((time - previousFrameTime) / 1000, 0.05);
      previousFrameTime = time;
      elapsed += delta;
      pointer.x = damp(pointer.x, targetPointer.x, 6.5, delta);
      pointer.y = damp(pointer.y, targetPointer.y, 6.5, delta);
      scrollProgress = damp(scrollProgress, targetScrollProgress, 7, delta);

      const idleX = Math.sin(elapsed * 0.42) * (coarsePointer ? 0.025 : 0.009);
      const idleY = Math.cos(elapsed * 0.34) * (coarsePointer ? 0.045 : 0.012);
      const pointerWeight = 1 - scrollProgress;
      pivot.rotation.x = (pointer.y * -0.075 + idleX) * pointerWeight - scrollProgress * 0.12 + entrance.rotateX;
      pivot.rotation.y = (pointer.x * 0.12 + idleY) * pointerWeight + scrollProgress * Math.PI * 0.72 + entrance.rotateY;
      pivot.rotation.z = pointer.x * -0.012 * pointerWeight;
      pivot.position.x = pointer.x * 0.1 * pointerWeight;
      pivot.position.y = pointer.y * -0.06 * pointerWeight + Math.sin(elapsed * 0.5) * 0.018 - scrollProgress * 0.16 + entrance.y;
      pivot.position.z = (Math.abs(pointer.x) + Math.abs(pointer.y)) * 0.075 * pointerWeight - scrollProgress * 0.65 + entrance.z;
      pivot.scale.setScalar(0.95 * (1 - scrollProgress * 0.2) * entrance.scale);

      keyLight.position.x = pointer.x * 2.1;
      keyLight.position.y = 2.31 - pointer.y * 1.4;
      blueLight.position.x = -4 + pointer.x * 2.4;
      renderer.toneMappingExposure = (0.85 + (pointer.x - pointer.y) * 0.04) * entrance.highlight;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (reduceMotion || frameId || !visible || !model) return;
      previousFrameTime = performance.now();
      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event) => {
      if (coarsePointer || reduceMotion) return;
      const bounds = hero.getBoundingClientRect();
      targetPointer.set(
        THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1)
      );
    };

    const resetPointer = () => targetPointer.set(0, 0);

    new GLTFLoader().load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        model.updateMatrixWorld(true);

        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        bounds.getSize(fittedSize);
        model.position.sub(center);

        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          vertexColors: true,
          metalness: 0.28,
          roughness: 0,
          transmission: 0.92,
          thickness: 0.3,
          ior: 2.01,
          attenuationColor: 0x4754ff,
          attenuationDistance: 1.3,
          dispersion: 0.12,
          iridescence: 0.4,
          iridescenceIOR: 2.12,
          iridescenceThicknessRange: [363, 456],
          clearcoat: 0.55,
          clearcoatRoughness: 0,
          side: THREE.DoubleSide,
          envMapIntensity: 3.1,
        });

        model.traverse((child) => {
          if (!child.isMesh) return;
          const normals = child.geometry.getAttribute('normal');
          const colors = new Uint8Array(normals.count * 3);
          const faceColor = new THREE.Color('#7688ff');
          const edgeColor = new THREE.Color('#ada8e9');
          for (let index = 0; index < normals.count; index += 1) {
            const faceAmount = THREE.MathUtils.smoothstep(Math.abs(normals.getZ(index)), 0.4, 0.95);
            colors[index * 3] = Math.round(THREE.MathUtils.lerp(edgeColor.r, faceColor.r, faceAmount) * 255);
            colors[index * 3 + 1] = Math.round(THREE.MathUtils.lerp(edgeColor.g, faceColor.g, faceAmount) * 255);
            colors[index * 3 + 2] = Math.round(THREE.MathUtils.lerp(edgeColor.b, faceColor.b, faceAmount) * 255);
          }
          child.geometry.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 3, true));
          const originalMaterials = Array.isArray(child.material) ? child.material : [child.material];
          originalMaterials.forEach((material) => material.dispose());
          child.material = glassMaterial;
        });

        pivot.add(model);
        resize();
        if (!reduceMotion && scrollProgress < 0.15) {
          introTimeline = gsap.timeline({ paused: !playEntrance })
            .to(entrance, {
              rotateX: -0.015,
              rotateY: 0.04,
              y: -0.01,
              z: 0.04,
              scale: 1.01,
              highlight: 1.08,
              duration: 1.25,
              ease: 'power3.out',
            })
            .to(entrance, {
              rotateX: 0,
              rotateY: 0,
              y: 0,
              z: 0,
              scale: 1,
              highlight: 1,
              duration: 0.5,
              ease: 'power2.out',
            }, '-=0.08');
          introTimelineRef.current = introTimeline;
        } else {
          Object.assign(entrance, { rotateX: 0, rotateY: 0, y: 0, z: 0, scale: 1, highlight: 1 });
        }
        mount.classList.add('is-ready');
        renderer.render(scene, camera);
        onReady?.();
        if (!reduceMotion) start();
      },
      (event) => {
        if (!disposed && event.lengthComputable && event.total > 0) {
          onProgress?.(Math.min(95, Math.round((event.loaded / event.total) * 95)));
        }
      },
      () => {
        if (disposed) return;
        mount.classList.add('is-error');
        onError?.();
      }
    );

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0.02 });
    intersectionObserver.observe(mount);

    hero.addEventListener('pointermove', handlePointerMove, { passive: true });
    hero.addEventListener('pointerleave', resetPointer);

    const scrollTrigger = reduceMotion ? null : ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: () => `+=${Math.max(hero.offsetHeight * 0.6, 360)}`,
      onUpdate: ({ progress }) => {
        targetScrollProgress = progress;
        updateOpacity(progress);
      },
    });
    if (scrollTrigger) {
      scrollProgress = scrollTrigger.progress;
      targetScrollProgress = scrollTrigger.progress;
      updateOpacity(scrollTrigger.progress);
    }

    return () => {
      disposed = true;
      stop();
      introTimeline?.kill();
      introTimelineRef.current = null;
      scrollTrigger?.kill();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerleave', resetPointer);
      model?.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      });
      environment.dispose();
      environmentTexture.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelUrl, onReady, onProgress, onError]);

  return (
    <div className="heroPang3D" ref={mountRef} aria-hidden="true" />
  );
}

export default HeroPang3D;
