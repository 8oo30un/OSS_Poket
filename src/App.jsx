import React, { Suspense, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import * as THREE from "three";

// === 1. Meowth 3D 모델 컴포넌트 ===
function MeowthModel() {
  // 간단한 경로로 변경 (공백과 특수문자 문제 해결)
  const modelPath = "/Meowth/Nyarth.dae";

  console.log("Loading model from:", modelPath);

  const collada = useLoader(ColladaLoader, modelPath);

  console.log("Model loaded:", collada);

  // 모델 로드 후 재질 조정하여 원래 색상이 나오도록 설정
  useEffect(() => {
    if (!collada || !collada.scene) {
      console.error("Collada 모델이 로드되지 않았습니다!");
      return;
    }

    console.log("=== Meowth 모델 로드 완료 ===");
    console.log("Collada object:", collada);
    console.log("Scene:", collada.scene);
    console.log("Scene children count:", collada.scene.children.length);

    let meshCount = 0;
    collada.scene.traverse((child) => {
      console.log("Traversing:", child.type, child.name);

      if (child.isMesh && child.material) {
        meshCount++;
        console.log(`Found mesh #${meshCount}:`, child.name);
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material, index) => {
          if (!material) return;

          console.log(`\n--- Material ${index} ---`);
          console.log("Material type:", material.type);
          console.log("Has map:", !!material.map);

          // 텍스처 정보 확인
          const texture = material.map;
          if (texture) {
            console.log("Texture found!");
            console.log("Texture image:", texture.image);
            if (texture.image) {
              console.log(
                "Image src:",
                texture.image.src || texture.image.currentSrc || "N/A"
              );
              console.log("Image complete:", texture.image.complete);
              console.log("Image width:", texture.image.width);
              console.log("Image height:", texture.image.height);
            } else {
              console.warn("Texture has no image!");
            }
          } else {
            console.warn("No texture found in material!");
            // 다른 텍스처 속성 확인
            console.log("Available properties:", Object.keys(material));
            if (material.diffuseMap)
              console.log("Has diffuseMap:", material.diffuseMap);
            if (material.emissiveMap)
              console.log("Has emissiveMap:", material.emissiveMap);
          }

          // 기존 재질을 MeshBasicMaterial로 완전히 교체
          // 텍스처를 그대로 유지하면서 조명 영향 제거
          if (texture && texture.image) {
            // 텍스처가 있는 경우
            const newMaterial = new THREE.MeshBasicMaterial({
              map: texture,
              transparent:
                material.transparent !== undefined
                  ? material.transparent
                  : true,
              opacity: material.opacity !== undefined ? material.opacity : 1,
              alphaTest: material.alphaTest,
              side: material.side || THREE.FrontSide,
              toneMapped: false,
              color: new THREE.Color(1, 1, 1), // 흰색으로 설정하여 텍스처 색상 그대로 표시
            });

            console.log("Created MeshBasicMaterial with texture");

            // 재질 교체
            if (Array.isArray(child.material)) {
              const idx = materials.indexOf(material);
              const mats = [...child.material];
              mats[idx] = newMaterial;
              child.material = mats;
            } else {
              child.material = newMaterial;
            }
          } else {
            // 텍스처가 없는 경우
            console.warn("Creating material without texture!");
            const newMaterial = new THREE.MeshBasicMaterial({
              color: material.color
                ? material.color.clone()
                : new THREE.Color(1, 1, 1),
              transparent:
                material.transparent !== undefined
                  ? material.transparent
                  : false,
              opacity: material.opacity !== undefined ? material.opacity : 1,
              toneMapped: false,
            });

            if (Array.isArray(child.material)) {
              const idx = materials.indexOf(material);
              const mats = [...child.material];
              mats[idx] = newMaterial;
              child.material = mats;
            } else {
              child.material = newMaterial;
            }
          }
        });
      }
    });

    console.log(`=== 재질 처리 완료 (총 ${meshCount}개 메시 처리) ===`);
  }, [collada]);

  if (!collada || !collada.scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <primitive
      object={collada.scene}
      scale={[0.5, 0.5, 0.5]}
      position={[0, -1, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// === 2. 로딩 컴포넌트 ===
function Loading() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

// === 3. 메인 App 컴포넌트 ===
export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
      }}
    >
      {/* 안내 텍스트 */}
      <div
        style={{
          position: "absolute",
          top: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "28px",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        <div>Meowth 360° VR 뷰어</div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "normal",
            marginTop: "8px",
            opacity: 0.9,
            lineHeight: "1.6",
          }}
        >
          Wii - PokePark Wii: Pikachu's Adventure - Pokemon (1st Generation) -
          #0052 Meowth
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "normal",
            marginTop: "12px",
            opacity: 0.9,
          }}
        >
          마우스로 드래그하여 360도 회전하세요
        </div>
      </div>

      {/* 3D 캔버스 설정 */}
      <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
        {/* MeshBasicMaterial은 조명이 필요 없지만, 다른 요소를 위해 최소한의 조명 유지 */}
        <ambientLight intensity={1} />

        {/* OrbitControls: 마우스로 360도 회전 가능 */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
        />

        {/* 바닥 그림자 효과 */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={10}
          blur={2.5}
          far={10}
          color="black"
        />

        {/* Meowth 3D 모델 로드 */}
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          }
        >
          <MeowthModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
