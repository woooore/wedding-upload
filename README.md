# 결혼식 사진 공유 웹 서비스 (Wedding Photo Sharing)

결혼식에 참석한 하객들이 테이블의 QR 코드를 스캔하여 별도의 앱 설치나 복잡한 가입 없이 현장 사진을 손쉽게 업로드하고 공유할 수 있는 웹 애플리케이션입니다.

---

## 1. 프로젝트 개요

- **목적**: 결혼식 당일 하객들이 직접 촬영한 사진을 실시간으로 취합하고 관리하기 위한 전용 플랫폼 구축
- **주요 특징**:
  - QR 코드를 통한 빠르고 직관적인 모바일 접속 환경 제공
  - 모바일 웹 기반 대용량 이미지 다중 업로드 지원
  - 실시간 스토리지 연동 및 데이터 관리

---

## 2. 주요 기능

- **QR 코드 스캔 접속**: 별도 회원가입/로그인 과정 없이 테이블 안내 QR을 통해 즉시 접속
- **사진 업로드**: 모바일 갤러리 또는 카메라와 연동하여 여러 장의 사진 동시 업로드
- **업로드 상태 피드백**: 업로드 진행률 및 완료 여부 안내
- **관리자 사진 열람 및 취합**: 관리자가 업로드된 사진 목록을 확인하고 일괄 다운로드/관리

---

## 3. 기술 스택

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend / Database**: Supabase (Database, Storage)
- **Deployment**: Vercel

---

## 4. 환경 변수 설정

프로젝트 루트 경로에 `.env.local` 파일을 생성하고 다음 설정을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
