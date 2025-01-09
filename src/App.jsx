import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { io } from "socket.io-client";
import { useSpring, animated } from "@react-spring/three";
const socket = io("http://localhost:3000"); // Connect to backend

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

function Scene() {
  console.log("inside the scene");
  const [targetPosition, setTargetPosition] = useState([0, 0.5, 0]);

  const { position } = useSpring({
    position: targetPosition,
    config: { tension: 170, friction: 26 },
  });

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ socket:----------");
    socket.on("move", (direction) => {
      console.log("🚀 ~ socket.on ~ direction:", direction);
      setTargetPosition((prev) => {
        if (direction === "up") return [prev[0], prev[1], prev[2] + 1];
        if (direction === "down") return [prev[0], prev[1], prev[2] - 1];
        return prev;
      });
    });

    return () => {
      socket.off("move");
    };
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
        <MarsRover position={targetPosition} />
      </animated.group>
      <OrbitControls />
    </Canvas>
  );
}

function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Scene />
    </div>
  );
}

export default App;
