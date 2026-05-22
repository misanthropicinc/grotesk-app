"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState } from "react";
import * as THREE from "three";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function CameraUpdater({ cameraPosition }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    if (camera.isPerspectiveCamera) {
      camera.fov = cameraPosition.fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraPosition]);
  return null;
}

function ShoeModel({ containerRef = { current: null } }) {
  const groupRef = useRef();
  const pivotRef = useRef();
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const pointerActiveRef = useRef(false);
  const lastPointerRef = useRef([0, 0]);

  const { scene } = useGLTF(
    "/assets/rick-owens-geobasket/source/geobasket.glb",
  );

  useEffect(() => {
    const model = scene.clone(true);

    model.traverse((child) => {
      child.quaternion.identity();
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    model.scale.setScalar(2.3 / maxDim);

    const scaledBox = new THREE.Box3().setFromObject(model);
    model.position.y -= scaledBox.min.y;

    if (pivotRef.current) {
      pivotRef.current.clear();
      pivotRef.current.add(model);
    }
  }, [scene]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const onDown = (event) => {
      pointerActiveRef.current = true;
      lastPointerRef.current = [event.clientX, event.clientY];
      if (event.pointerId != null && el.setPointerCapture) {
        el.setPointerCapture(event.pointerId);
      }
    };

    const onMove = (event) => {
      if (!pointerActiveRef.current || !groupRef.current) return;
      const [lastX, lastY] = lastPointerRef.current;
      const dx = (event.clientX - lastX) * 0.005;
      const dy = (event.clientY - lastY) * 0.005;
      lastPointerRef.current = [event.clientX, event.clientY];
      groupRef.current.rotation.y += dx;
      groupRef.current.rotation.x = clamp(
        groupRef.current.rotation.x + dy,
        -Math.PI / 5,
        Math.PI / 4,
      );
    };

    const endDrag = (event) => {
      pointerActiveRef.current = false;
      if (event.pointerId != null && el.releasePointerCapture) {
        el.releasePointerCapture(event.pointerId);
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [containerRef]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if ("wasd".includes(key) && key.length === 1) {
        keysRef.current[key] = true;
        event.preventDefault();
      }
    };

    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if ("wasd".includes(key) && key.length === 1) {
        keysRef.current[key] = false;
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const speed = 0.04;
    const keys = keysRef.current;

    if (keys.a) group.rotation.y += speed;
    if (keys.d) group.rotation.y -= speed;
    if (keys.w) {
      group.rotation.x = clamp(
        group.rotation.x - speed,
        -Math.PI / 4,
        Math.PI / 4,
      );
    }
    if (keys.s) {
      group.rotation.x = clamp(
        group.rotation.x + speed,
        -Math.PI / 4,
        Math.PI / 4,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={pivotRef} />
    </group>
  );
}

export default function ShoeViewer() {
  const wrapperRef = useRef(null);
  const [cameraPosition, setCameraPosition] = useState({
    x: 0,
    y: 0.9,
    z: 2.6,
    fov: 38,
  });

  const updateCamera = (axis, value) => {
    setCameraPosition((prev) => ({ ...prev, [axis]: Number(value) }));
  };

  const axisLabel = (axis) => {
    if (axis === "y") return "Height";
    if (axis === "z") return "Distance";
    return "FOV";
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        cursor: "grab",
        touchAction: "none",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 10,
          background: "rgba(0, 0, 0, 0.65)",
          color: "#fff",
          padding: 12,
          borderRadius: 12,
          minWidth: 240,
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Camera debug</div>
        {["y", "z", "fov"].map((axis) => {
          const value = Number(cameraPosition[axis] ?? 0);
          return (
            <label key={axis} style={{ display: "block", marginBottom: 10 }}>
              <span
                style={{
                  display: "block",
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                {axisLabel(axis)}: {value.toFixed(axis === "fov" ? 0 : 2)}
              </span>
              <input
                type="range"
                min={axis === "y" ? 0 : axis === "z" ? 1 : 20}
                max={axis === "y" ? 3 : axis === "z" ? 6 : 80}
                step={axis === "fov" ? 1 : 0.05}
                value={value}
                onChange={(event) => updateCamera(axis, event.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          );
        })}
      </div>

      <Canvas
        camera={{
          position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
          fov: cameraPosition.fov,
          near: 0.1,
          far: 100,
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        shadows={{ type: THREE.PCFShadowMap }}
        events={null}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <CameraUpdater cameraPosition={cameraPosition} />
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} />

        <Suspense fallback={null}>
          <ShoeModel containerRef={wrapperRef} />
          <Environment preset="studio" environmentIntensity={0.6} />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.45}
            scale={8}
            blur={2.5}
            far={8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/assets/rick-owens-geobasket/source/geobasket.glb");
