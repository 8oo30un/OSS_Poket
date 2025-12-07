import React, { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Box3, Vector3, Color } from 'three';

// 모든 모델을 화면에 비슷한 크기로 보이도록
// 바운딩 박스를 기준으로 스케일/위치를 정규화하는 헬퍼 함수
function normalizeModel(root, {
  targetSize = 4,   // 장면에서 차지할 기준 크기(대략 높이/가로 중 큰 값)
  yOffset = 0,      // 모델 중심을 원점(0,0,0) 근처에 두기 위한 오프셋
} = {}) {
  if (!root) return;

  const box = new Box3().setFromObject(root);
  const size = new Vector3();
  const center = new Vector3();

  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;

  // 스케일 통일
  root.scale.setScalar(scale);

  // 중심을 원점 부근으로 옮기고, 살짝 아래로 내리기
  root.position.sub(center.multiplyScalar(scale));
  root.position.y += yOffset;
}

// 모든 머티리얼을 "무광"으로 맞춰주는 헬퍼 함수
function makeMaterialMatte(material) {
  if (!material) return;

  // PBR 계열(MaterialStandard 등)
  if ('metalness' in material) {
    material.metalness = 0;
  }
  if ('roughness' in material) {
    material.roughness = 1; // 최대 거칠기
  }

  // Phong 계열(MaterialPhong 등)
  if ('shininess' in material) {
    material.shininess = 0;
  }
  if ('specular' in material && material.specular) {
    // 반짝이는 하이라이트 색 제거
    if (material.specular instanceof Color) {
      material.specular.set(0x000000);
    } else {
      material.specular = new Color(0x000000);
    }
  }

  // 환경 반사 제거
  if ('envMap' in material) {
    material.envMap = null;
  }
  if ('reflectivity' in material) {
    material.reflectivity = 0;
  }
}

// FBX 모델을 로드하는 컴포넌트
function LoadedFBXModel({ modelPath }) {
  const fbx = useLoader(FBXLoader, modelPath);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    if (fbx) {
      // SkinnedMesh가 깨지지 않도록 SkeletonUtils.clone 사용
      const cloned = clone(fbx);

      // 모든 메시에 무광 머티리얼 파라미터 적용
      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach(makeMaterialMatte);
        }
      });
      // 크기/위치 정규화
      normalizeModel(cloned);
      setScene(cloned);
    }
  }, [fbx]);

  if (!scene) return null;

  return (
    <primitive 
      object={scene}
    />
  );
}

// DAE 모델을 로드하는 컴포넌트
function LoadedDAEModel({ modelPath }) {
  const collada = useLoader(ColladaLoader, modelPath);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    if (collada && collada.scene) {
      const cloned = clone(collada.scene);

      // 텍스처 경로 수정
      // DAE 파일이 위치한 폴더를 기준으로 텍스처를 찾도록 경로를 보정합니다.
      const baseDir = (() => {
        if (!modelPath) return '/';
        const lastSlash = modelPath.lastIndexOf('/');
        if (lastSlash === -1) return '/';
        return modelPath.substring(0, lastSlash + 1);
      })();

      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];

          materials.forEach((material) => {
            // 텍스처 맵들을 확인하고 경로 수정
            if (material.map) {
              const texturePath = material.map.image?.src || material.map.image;
              if (texturePath && typeof texturePath === 'string') {
                // 이미 http 또는 루트(/)로 시작하는 절대 경로는 건드리지 않음
                if (!texturePath.startsWith('http') && !texturePath.startsWith('/')) {
                  // 상대 경로만 보정
                  const fileName =
                    texturePath.split('/').pop() || texturePath.split('\\').pop();
                  material.map.image.src = `${baseDir}${fileName}`;
                }
              }
            }

            // 전체적으로 무광 느낌을 주기 위해 공통 헬퍼 사용
            makeMaterialMatte(material);
          });
        }
      });

      // 크기/위치 정규화
      normalizeModel(cloned);
      setScene(cloned);
    }
  }, [collada, modelPath]);

  if (!scene) return null;

  return (
    <primitive 
      object={scene}
    />
  );
}

// GLTF/GLB 모델을 로드하는 컴포넌트
function LoadedGLTFModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const [normalized, setNormalized] = useState(null);

  useEffect(() => {
    if (scene) {
      const cloned = clone(scene);

      // GLTF/GLB도 무광 재질 적용
      cloned.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach(makeMaterialMatte);
        }
      });

      normalizeModel(cloned);
      setNormalized(cloned);
    }
  }, [scene]);

  if (!normalized) return null;

  return (
    <primitive 
      object={normalized}
    />
  );
}

// 실제 모델을 로드하는 컴포넌트 (파일 확장자에 따라 자동 선택)
function LoadedModel({ modelPath }) {
  const [modelType, setModelType] = useState(null);
  
  useEffect(() => {
    if (modelPath) {
      const ext = modelPath.toLowerCase().split('.').pop();
      if (ext === 'fbx') {
        setModelType('fbx');
      } else if (ext === 'dae') {
        setModelType('dae');
      } else if (ext === 'glb' || ext === 'gltf') {
        setModelType('gltf');
      } else {
        setModelType('gltf'); // 기본값
      }
    }
  }, [modelPath]);

  if (!modelType) return null;

  if (modelType === 'fbx') {
    return <LoadedFBXModel modelPath={modelPath} />;
  } else if (modelType === 'dae') {
    return <LoadedDAEModel modelPath={modelPath} />;
  } else {
    return <LoadedGLTFModel modelPath={modelPath} />;
  }
}

// 폴백 모델 (모델 파일이 없을 때 표시)
function FallbackModel() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#4A90E2" metalness={0} roughness={1} />
      </mesh>
    </group>
  );
}

// Error Boundary 컴포넌트
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('모델 파일을 로드할 수 없습니다. 폴백 모델을 표시합니다.', error);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackModel />;
    }

    return this.props.children;
  }
}

// 범용 3D 모델 로더 컴포넌트 (에러 처리 포함)
function ModelLoader({ modelPath }) {
  return (
    <ModelErrorBoundary>
      <LoadedModel modelPath={modelPath} />
    </ModelErrorBoundary>
  );
}

export default ModelLoader;