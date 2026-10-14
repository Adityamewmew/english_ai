"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type TutorPose = "idle" | "waving" | "talking" | "thumbsup";

interface ThreejsPixelTutorStageProps {
  pose?: TutorPose;
  isSpeaking?: boolean;
  className?: string;
}

const POSE_TEXTURES: Record<TutorPose, string> = {
  idle: "/illustrations/tutor/khoirul-idle.png",
  waving: "/illustrations/tutor/khoirul-waving.png",
  talking: "/illustrations/tutor/khoirul-talking.png",
  thumbsup: "/illustrations/tutor/khoirul-thumbsup.png",
};

export function ThreejsPixelTutorStage({
  pose = "idle",
  isSpeaking = false,
  className = "w-full h-72 sm:h-80 md:h-[340px]",
}: ThreejsPixelTutorStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<TutorPose>(pose);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    poseRef.current = pose;
  }, [pose]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    // Camera positioned with generous padding so head & hands are never clipped
    camera.position.set(0, 0.1, 4.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keySpot = new THREE.SpotLight(0xf4b41a, 2.2);
    keySpot.position.set(3, 5, 4);
    keySpot.penumbra = 0.5;
    scene.add(keySpot);

    const fillLight = new THREE.DirectionalLight(0x0d3b66, 1.0);
    fillLight.position.set(-3, 3, 2);
    scene.add(fillLight);

    // 3. Podium Platform (Navy with Gold Rim)
    const podiumGroup = new THREE.Group();
    const cylinderGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.35, 32);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x0d3b66,
      roughness: 0.4,
      metalness: 0.2,
    });
    const podiumMesh = new THREE.Mesh(cylinderGeo, podiumMat);
    podiumMesh.position.y = -1.33;
    podiumGroup.add(podiumMesh);

    const rimGeo = new THREE.TorusGeometry(1.66, 0.04, 16, 48);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf4b41a,
      roughness: 0.25,
      metalness: 0.85,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = -1.15;
    podiumGroup.add(rimMesh);
    scene.add(podiumGroup);

    // 4. Ambient Sparkle Dust Particles
    const particleCount = 24;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 3.6;
      particlePos[i * 3 + 1] = Math.random() * 3.2 - 1.2;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf4b41a,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Preload All 4 Transparent PNG Textures
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures: Partial<Record<TutorPose, THREE.Texture>> = {};
    const poses: TutorPose[] = ["idle", "waving", "talking", "thumbsup"];

    poses.forEach((p) => {
      textureLoader.load(POSE_TEXTURES[p], (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        loadedTextures[p] = tex;
        if (p === poseRef.current && charMat) {
          charMat.map = tex;
          charMat.needsUpdate = true;
        }
      });
    });

    // 6. Character Plane (Comfortably sized: 2.45 height x 2.08 width)
    const planeHeight = 2.45;
    const planeWidth = planeHeight * 0.85;

    const characterRoot = new THREE.Group();
    // Position character feet directly resting on the podium
    characterRoot.position.y = -1.15;

    const charGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const charMat = new THREE.MeshStandardMaterial({
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
      roughness: 0.5,
    });

    const charMesh = new THREE.Mesh(charGeo, charMat);
    charMesh.position.y = planeHeight / 2;
    characterRoot.add(charMesh);
    scene.add(characterRoot);

    // 7. Smooth, Calm Mouse Tracking
    let targetRotY = 0;
    let targetRotX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Subtle head turning toward cursor (no wild rotation)
      targetRotY = nx * 0.08;
      targetRotX = -ny * 0.04;
    };
    container.addEventListener("mousemove", handleMouseMove);

    // 8. Animation Loop (Stationary, calm, stay on podium with zero floating)
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let currentActivePose: TutorPose = poseRef.current;
    let speechFlapTimer = 0;
    let isFlapOpen = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Check for pose update or mouth flap during speaking
      let targetPose = poseRef.current;

      // If tutor is NOT speaking, force mouth closed (idle pose)
      if (targetPose === "talking" && !isSpeakingRef.current) {
        targetPose = "idle";
      } else if (isSpeakingRef.current && targetPose === "talking") {
        speechFlapTimer += dt;
        // Mouth flaps naturally every 0.22 seconds while speaking
        if (speechFlapTimer > 0.22) {
          speechFlapTimer = 0;
          isFlapOpen = !isFlapOpen;
        }
        targetPose = isFlapOpen ? "talking" : "idle";
      }

      // Smooth texture swap with zero UV jitter
      if (targetPose !== currentActivePose && loadedTextures[targetPose]) {
        currentActivePose = targetPose;
        charMat.map = loadedTextures[targetPose]!;
        charMat.needsUpdate = true;
      }

      // Calm Mouse Tracking Damping
      characterRoot.rotation.y += (targetRotY - characterRoot.rotation.y) * 0.05;
      characterRoot.rotation.x += (targetRotX - characterRoot.rotation.x) * 0.05;

      // Character stays firmly planted on the podium (ZERO floating)
      characterRoot.position.y = -1.15;
      characterRoot.rotation.z = 0;

      // Rotating podium accent
      rimMesh.rotation.z = elapsed * 0.35;

      // Floating dust particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += 0.0035;
        if (arr[i * 3 + 1] > 2.2) {
          arr[i * 3 + 1] = -1.2;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);

      renderer.dispose();
      cylinderGeo.dispose();
      podiumMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      charGeo.dispose();
      charMat.dispose();

      Object.values(loadedTextures).forEach((t) => t?.dispose());

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative select-none flex items-center justify-center overflow-hidden ${className}`}
    />
  );
}
