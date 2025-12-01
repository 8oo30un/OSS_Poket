import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, ContactShadows } from '@react-three/drei';

// === 1. 포켓몬 카드 컴포넌트 ===
function PokemonCard({ id, position }) {
  const meshRef = useRef();
  
  // 고화질 공식 일러스트 (배경 투명함)
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  // 텍스처 로드
  const texture = useTexture(imageUrl);

  // 애니메이션: 매 프레임마다 y축으로 천천히 회전
  useFrame((state, delta) => {
    // delta를 곱해주면 컴퓨터 성능과 상관없이 일정한 속도로 돕니다.
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef} position={position}>
      {/* 카드 모양: 가로 2.4, 세로 2.4, 두께 0.05 (얇은 판) */}
      <boxGeometry args={[2.4, 2.4, 0.05]} />
      
      {/* 핵심 설정: meshBasicMaterial 
         - 조명(그림자)의 영향을 받지 않고 이미지 원본 색상을 그대로 보여줍니다.
         - toneMapped={false}: 색상이 물빠진 것처럼 변하는 것을 막아줍니다.
      */}
      <meshBasicMaterial 
        map={texture} 
        transparent={true} 
        toneMapped={false} 
      />
    </mesh>
  );
}

// === 2. 메인 App 컴포넌트 ===
export default function App() {
  // 1번부터 9번까지 포켓몬 ID 배열 생성
  const pokemonIds = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    // 배경색 흰색 설정
    <div style={{ height: '100vh', width: '100vw', background: '#ffffff' }}>
      
      {/* 3D 캔버스 설정: 카메라는 z축 12만큼 뒤로 물러남 */}
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        
        {/* meshBasicMaterial을 쓰면 조명이 필요 없지만, 다른 요소를 위해 기본 조명은 둡니다. */}
        <ambientLight intensity={1} />

        {/* 바닥 그림자 효과: 물체가 붕 떠보이지 않게 잡아주는 역할 */}
        <ContactShadows 
          position={[0, -5, 0]} // 그리드 아래쪽에 배치
          opacity={0.4}         // 그림자 투명도
          scale={20}            // 그림자 범위
          blur={2.5}            // 그림자 흐림 정도
          far={10}              // 그림자 깊이
          color="black"
        />

        {/* 포켓몬 카드 9개 배치 */}
        {pokemonIds.map((id, index) => {
          // 3x3 그리드 좌표 계산
          const row = Math.floor(index / 3); // 0, 1, 2
          const col = index % 3;             // 0, 1, 2
          
          // 간격(Spacing)은 3.5로 설정
          const x = (col - 1) * 3.5;  // -3.5, 0, 3.5
          const y = (1 - row) * 3.5;  // 3.5, 0, -3.5

          return <PokemonCard key={id} id={id} position={[x, y, 0]} />;
        })}
        
      </Canvas>
    </div>
  );
}