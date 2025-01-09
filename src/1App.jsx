// Import necessary libraries
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { io } from "socket.io-client";
import { useSpring, animated } from "@react-spring/three";

function MarsSurface() {
  const marsTexture = useLoader(
    THREE.TextureLoader,
    "/textures/mars_surface.jpg"
  );

  // Set texture wrapping and repeat
  marsTexture.wrapS = THREE.RepeatWrapping;
  marsTexture.wrapT = THREE.RepeatWrapping;
  marsTexture.repeat.set(1, 1); // Adjust to scale the texture appropriately

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.49, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial map={marsTexture} />
    </mesh>
  );
}

// Mars Rover Component
function MarsRover({ position, onDrill }) {
  const roverRef = useRef();
  const { nodes, materials } = useGLTF("/models/mars_rover.glb"); // Ensure you have this model

  useFrame(() => {
    // Add optional animations if needed
  });

  return (
    <group ref={roverRef} position={position}>
      {/* <primitive object={nodes.Body} material={materials.Material} />
      <primitive object={nodes.head} /> */}
      {Object.entries(nodes).map(([name, object]) => (
        <primitive
          key={name}
          object={object}
          // onClick={name === "Drill" ? onDrill : undefined}
        />
      ))}
      <mesh onClick={onDrill} position={[0, -0.1, 1]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
}

// Main Scene Component
function Scene() {
  const [roverPosition, setRoverPosition] = useState([0, 0.5, 0]);
  const [targetPosition, setTargetPosition] = useState([0, 0.2, 0]); // Target position for the rover

  const [isDrilling, setIsDrilling] = useState(false);

  const { position } = useSpring({
    position: targetPosition,
    config: { tension: 170, friction: 26 }, // Adjust for smoother animation
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      setTargetPosition((prev) => {
        if (event.key === "ArrowUp") return [prev[0], prev[1], prev[2] - 1];
        if (event.key === "ArrowDown") return [prev[0], prev[1], prev[2] + 1];
        return prev;
      });

      if (event.key === "d") {
        setIsDrilling(true);
        setTimeout(() => setIsDrilling(false), 2000); // Simulate drilling time
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Canvas shadows camera={{ position: [5, 5, 10], fov: 50 }}>
      <ambientLight intensity={2.5} />
      <directionalLight
        castShadow
        position={[10, 10, 10]}
        intensity={5}
        shadow-mapSize={{ width: 2024, height: 2024 }}
      />
      <MarsSurface />
      <animated.group position={position}>
        <MarsRover
          position={roverPosition}
          onDrill={() => {
            if (!isDrilling) {
              socket.emit("drill");
            }
          }}
        />
      </animated.group>
      <OrbitControls />
    </Canvas>
  );
}

// App Component
function NewApp() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Scene />
    </div>
  );
}

export default NewApp;

// Note: Ensure you have the mars surface texture, Mars rover model (GLTF format),
// and a running WebSocket server to test this application.
