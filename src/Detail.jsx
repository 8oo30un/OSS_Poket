import React, { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import LaprasModel from './Lapras3D';

// === 메인 상세 페이지 컴포넌트 ===
export default function Detail() {
  const { id } = useParams();
  const numericId = Number(id);

  // Lapras3D.jsx 안에서 모든 모델의 크기/위치를 정규화해두었기 때문에
  // 카메라는 웬만하면 공통 값으로 통일해도 비슷한 크기로 보이도록 설정
  const getViewConfig = (pokeId) => {
    // 포켓몬 번호와 상관없이 거의 동일한 프레이밍을 사용
    return {
      cameraPos: [0, 3, 10],  // 살짝 위에서 아래로 내려다보는 정도의 거리
      target: [0, 0, 0],      // 모델 중심(0,0,0)을 바라보도록 타겟 고정
    };
  };

  const viewConfig = getViewConfig(numericId);

  // URL 번호 → public 폴더/파일 규칙으로 모델 경로 생성
  // 기본 규칙:
  //   - 폴더: public/{번호}/
  //   - 파일: pm{4자리_번호}_00_00.dae  (예: 1 → pm0001_00_00.dae)
  // 예외:
  //   - 131: /131/a131.dae
  //   - 143: /143/snorlax.obj
  //   - 5  : /5/lizardo.dae
  const getModelPath = (pokeId) => {
    // 번호별 예외 처리
    if (pokeId === 1) {
      // public/1/pm0001_00_00.dae
      return '/1/pm0001_00_00.dae';
    }
    if (pokeId === 4) {
      // public/4/hitokage.dae
      return '/4/hitokage.dae';
    }
    if (pokeId === 5) {
      // public/5/lizardo.dae
      return '/5/lizardo.dae';
    }
    if (pokeId === 6) {
      // public/6/lizardon.dae
      return '/6/lizardon.dae';
    }
    if (pokeId === 131) {
      return '/131/a131.dae';
    }
    if (pokeId === 143) {
      return '/143/snorlax.obj';
    }

    // 기본 규칙:
    //   - 폴더: public/{번호}/
    //   - 파일: pm{4자리_번호}_00_00.dae  (예: 2 → pm0002_00_00.dae)
    const paddedId = String(pokeId).padStart(4, '0');
    return `/${pokeId}/pm${paddedId}_00_00.dae`;
  };

  let modelPath = getModelPath(numericId);

  // 혹시 이상한 번호가 들어온 경우, 안전하게 131 라프라스로 폴백
  if (Number.isNaN(numericId)) {
    modelPath = '/131/a131.dae';
  }
  // 업로드해주신 보라색 배경 이미지 URL (실제 파일 경로로 맞춰주세요!)
  // public 폴더에 이미지를 넣고 '/image_3.png' 처럼 쓰는 것을 권장합니다.
  // 여기서는 예시로 외부 링크를 사용했지만, 꼭 로컬 파일로 교체하세요.
  const bgImageUrl = "/image_3.png"; // public 폴더의 이미지 사용

  return (
    // 전체 화면 컨테이너: 배경 이미지를 CSS로 설정
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundImage: `url(${bgImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative' // 뒤로가기 버튼 배치를 위해
    }}>
      
      {/* 좌측 상단 뒤로가기 버튼 (2D HTML) */}
      <Link to="/" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '30px',
        backdropFilter: 'blur(5px)',
        fontWeight: 'bold',
        zIndex: 10 // Canvas 위에 보이도록
      }}>
        ← 뒤로가기
      </Link>

      {/* 3D 캔버스 */}
      {/* 번호별로 카메라 위치를 살짝씩 바꿔서 프레이밍을 통일 */}
      <Canvas camera={{ position: viewConfig.cameraPos, fov: 45, near: 0.05, far: 50000 }}>
        {/* OrbitControls: 마우스 드래그로 360도 회전, 줌 가능하게 해주는 핵심 컴포넌트 */}
        <OrbitControls 
          makeDefault 
          // 너무 위/아래로 뒤집히지 않도록 각도 범위 제한
          minPolarAngle={Math.PI / 5} 
          maxPolarAngle={Math.PI - Math.PI / 5}
          // 번호별로 몸통 중심을 약간씩 다르게 맞춰줘서 시선 통일
          target={viewConfig.target}
        />

        {/* 분위기 연출용 조명 */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Suspense: 3D 모델이 로딩되는 동안 보여줄 대체 화면 (로딩중...) */}
        <Suspense fallback={<Html center><h2 style={{color: 'white'}}>로딩중...</h2></Html>}>
          {/* URL 번호에 맞는 3D 모델 경로를 전달 */}
          <LaprasModel modelPath={modelPath} />
        </Suspense>

      </Canvas>
      
      {/* 안내 메시지 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        zIndex: 10,
        textAlign: 'center'
      }}>
        🎨 3D 모델 보기
        <br />
        <small style={{ fontSize: '12px', opacity: 0.8 }}>
          Pokkén Tournament Lapras 3D 모델을 회전하면서 감상해 보세요
        </small>
      </div>
    </div>
  );
}

