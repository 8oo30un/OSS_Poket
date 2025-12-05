import React, { Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import LaprasModel from "./Lapras3D";
import pokemonDetails from "./data/pokemonDetails";

export default function Detail() {
  const { id } = useParams();
  const numericId = Number(id);
  const paddedId = String(numericId).padStart(4, "0");

  const info = pokemonDetails[numericId] || {
    nameKo: `포켓몬 No.${paddedId}`,
    nameEn: "Unknown",
    badges: ["스칼렛", "바이올렛"],
    description: "아직 데이터가 등록되지 않았어요. 곧 업데이트될 예정입니다.",
    types: ["???"],
    height: "-",
    weight: "-",
    category: "??? 포켓몬",
    ability: "-",
    gender: "-",
    cta: "도감 업데이트 알림 받기",
  };

  const getViewConfig = (pokeId) => ({
    cameraPos: [0, 3, 10],
    target: [0, 0, 0],
  });
  const viewConfig = getViewConfig(numericId);

  const getModelPath = (pokeId) => {
    if (pokeId === 1) return "/pokemon/1/pm0001_00_00.dae";
    if (pokeId === 4) return "/pokemon/4/hitokage.dae";
    if (pokeId === 5) return "/pokemon/5/lizardo.dae";
    if (pokeId === 6) return "/pokemon/6/lizardon.dae";
    if (pokeId === 7) return "/pokemon/7/zenigame.dae";
    if (pokeId === 8) return "/pokemon/8/kameil.dae";
    if (pokeId === 9) return "/pokemon/9/kamex.dae";
    if (pokeId === 10) return "/pokemon/10/caterpie.dae";
    if (pokeId === 11) return "/pokemon/11/transel.dae";
    if (pokeId === 12) return "/pokemon/12/Male/butterfree.dae";
    if (pokeId === 13) return "/pokemon/13/beedle.dae";
    if (pokeId === 14) return "/pokemon/14/cocoon.dae";
    if (pokeId === 131) return "/pokemon/131/a131.dae";
    if (pokeId === 143) return "/pokemon/143/snorlax.obj";

    const fallbackPadded = String(pokeId).padStart(4, "0");
    return `/pokemon/${pokeId}/pm${fallbackPadded}_00_00.dae`;
  };

  let modelPath = getModelPath(numericId);
  if (Number.isNaN(numericId)) {
    modelPath = "/pokemon/131/a131.dae";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden", // 가로 스크롤로 인한 레이아웃 흔들림 방지
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "40px 20px 80px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <Link
          to="/"
          style={{
            alignSelf: "flex-start",
            padding: "10px 20px",
            backgroundColor: "rgba(15, 23, 42, 0.08)",
            color: "#0f172a",
            textDecoration: "none",
            borderRadius: "999px",
            fontWeight: 600,
            backdropFilter: "blur(8px)",
          }}
        >
          ← 도감으로 돌아가기
        </Link>

        <div
          style={{
            display: "flex",
            gap: "32px",
            flexWrap: "nowrap", // 컬럼이 한 줄에서만 배치되도록 고정
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: "1 1 460px",
              minWidth: "320px",
            }}
          >
            <div
              style={{
                borderRadius: "32px",
                background:
                  "radial-gradient(circle at top, rgba(99,102,241,0.45), rgba(15,23,42,0.9))",
                padding: "24px",
                boxShadow: "0 30px 60px rgba(15,23,42,0.35)",
              }}
            >
              <Canvas
                style={{ height: "70vh" }}
                camera={{
                  position: viewConfig.cameraPos,
                  fov: 45,
                  near: 0.05,
                  far: 50000,
                }}
              >
                <OrbitControls
                  makeDefault
                  minPolarAngle={Math.PI / 5}
                  maxPolarAngle={Math.PI - Math.PI / 5}
                  target={viewConfig.target}
                />
                <ambientLight intensity={0.9} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Suspense
                  fallback={
                    <Html center>
                      <h2 style={{ color: "white" }}>로딩중...</h2>
                    </Html>
                  }
                >
                  <LaprasModel modelPath={modelPath} />
                  <ContactShadows
                    position={[0, -1.2, 0]}
                    opacity={0.35}
                    scale={20}
                    blur={2.5}
                    far={2}
                  />
                </Suspense>
              </Canvas>
            </div>
          </div>

          <div
            style={{
              flex: "1 1 380px",
              minWidth: "320px",
              backgroundColor: "#ffffff",
              borderRadius: "32px",
              padding: "40px",
              boxShadow: "0 25px 40px rgba(15,23,42,0.12)",
            }}
          >
            <p style={{ color: "#94a3b8", fontWeight: 600, margin: 0 }}>
              No.{paddedId}
            </p>
            <h1
              style={{ margin: "8px 0 0", fontSize: "42px", color: "#0f172a" }}
            >
              {info.nameKo}
            </h1>
            <p
              style={{
                margin: "4px 0 18px",
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              {info.nameEn}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {info.badges.map((badge) => (
                <span
                  key={badge}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "999px",
                    backgroundColor: badge === "스칼렛" ? "#dc2626" : "#4c1d95",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>

            <p
              style={{
                lineHeight: 1.6,
                color: "#475569",
                marginBottom: "28px",
              }}
            >
              {info.description}
            </p>

            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              {info.types.map((type) => (
                <span
                  key={type}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "16px",
                    backgroundColor: "#eef2ff",
                    color: "#4338ca",
                    fontWeight: 600,
                  }}
                >
                  {type}
                </span>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
                marginBottom: "32px",
              }}
            >
              {[
                { label: "분류", value: info.category },
                { label: "키", value: info.height },
                { label: "몸무게", value: info.weight },
                { label: "특성", value: info.ability },
                { label: "성별", value: info.gender },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "14px",
                    borderRadius: "16px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                    {item.label}
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <button
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#dc2626",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 20px 35px rgba(220,38,38,0.25)",
              }}
              onClick={() =>
                window.open("https://www.pokemonkorea.co.kr/", "_blank")
              }
            >
              {info.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
