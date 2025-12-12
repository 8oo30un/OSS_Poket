# Google OAuth redirect_uri_mismatch 오류 해결 가이드

## 문제 설명

`redirect_uri_mismatch` 오류는 Google OAuth 설정에서 **승인된 리디렉션 URI**에 현재 사용 중인 URI가 등록되어 있지 않을 때 발생합니다.

## 해결 방법

### 1. Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **API 및 서비스** → **사용자 인증 정보** 메뉴로 이동

### 2. OAuth 2.0 클라이언트 ID 찾기

1. **사용자 인증 정보** 페이지에서 OAuth 2.0 클라이언트 ID 목록 확인
2. 웹 애플리케이션 타입의 클라이언트 ID를 클릭하여 편집

### 3. 승인된 리디렉션 URI 추가

**승인된 리디렉션 URI** 섹션에 다음 URI들을 추가하세요:

#### 로컬 개발 환경

```
http://localhost:5173
http://localhost:3000
```

#### Vercel 배포 환경

```
https://your-app.vercel.app
https://your-app.vercel.app/
```

**참고**:

- Vercel 배포 URL은 실제 배포된 도메인으로 변경하세요
- 슬래시(`/`) 포함/미포함 버전 모두 추가하는 것을 권장합니다
- 커스텀 도메인을 사용하는 경우 해당 도메인도 추가하세요

### 4. 저장 및 확인

1. **저장** 버튼 클릭
2. 변경사항이 적용되는데 몇 분 정도 걸릴 수 있습니다
3. 브라우저 캐시를 지우고 다시 로그인 시도

## 현재 사용 중인 URI 확인 방법

### 로컬 개발

브라우저 주소창에 표시된 URL을 확인하세요:

- `http://localhost:5173` (Vite 개발 서버)
- `http://localhost:3000` (Vercel dev)

### Vercel 배포

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings** → **Domains**에서 배포된 도메인 확인
4. 또는 배포된 URL을 브라우저 주소창에서 확인

## 주의사항

1. **정확한 URI 입력**: URI는 정확히 일치해야 합니다 (대소문자, 슬래시 포함)
2. **프로토콜 확인**: `http://`와 `https://`는 다른 URI로 인식됩니다
3. **포트 번호**: 포트 번호가 포함된 URI도 정확히 입력해야 합니다
4. **변경사항 적용 시간**: Google Cloud Console에서 변경한 후 몇 분 정도 걸릴 수 있습니다

## 추가 문제 해결

### 여전히 오류가 발생하는 경우

1. **브라우저 캐시 지우기**: 브라우저의 캐시와 쿠키를 삭제하세요
2. **시크릿 모드 테스트**: 시크릿/프라이빗 모드에서 테스트해보세요
3. **환경 변수 확인**: `.env.local` 파일에 `VITE_GOOGLE_CLIENT_ID`가 올바르게 설정되어 있는지 확인하세요
4. **클라이언트 ID 확인**: Google Cloud Console의 클라이언트 ID와 `.env.local`의 클라이언트 ID가 일치하는지 확인하세요

### 개발자 도구에서 확인

브라우저 개발자 도구(F12) → Network 탭에서:

1. Google 로그인 버튼 클릭
2. `accounts.google.com`으로 요청이 가는지 확인
3. 요청 URL에서 `redirect_uri` 파라미터 확인
4. 이 URI가 Google Cloud Console에 등록되어 있는지 확인

## 예시: 승인된 리디렉션 URI 목록

```
http://localhost:5173
http://localhost:5173/
http://localhost:3000
http://localhost:3000/
https://oss-poket.vercel.app
https://oss-poket.vercel.app/
https://oss-poket-git-develop-your-username.vercel.app
https://oss-poket-git-develop-your-username.vercel.app/
```

**참고**: Vercel은 각 브랜치마다 프리뷰 URL을 생성하므로, 필요한 경우 해당 URL도 추가하세요.
