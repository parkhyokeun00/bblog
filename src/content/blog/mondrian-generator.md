---
title: 'Mondrian Generator - 생성형 추상 아트 웹앱'
description: '몬드리안 스타일의 추상 미술을 실시간으로 생성하는 인터랙티브 웹 애플리케이션'
pubDate: '2026-01-25'
heroImage: '../../assets/mondrian_hero.png'
category: 'creative-tools'
---

## 🎨 Mondrian Generator란?

**Mondrian Generator**는 네덜란드 화가 **피트 몬드리안(Piet Mondrian)**의 추상 미술 스타일에서 영감을 받은 생성형 아트 웹 애플리케이션입니다. 

실시간으로 성장하는 사각형들이 캔버스를 채우며, 매번 다른 독특한 패턴을 만들어냅니다. 단순히 보기만 하는 것이 아니라, 다양한 파라미터를 조정하여 자신만의 추상 작품을 만들 수 있습니다.

### 🔗 웹앱 실행하기

<div style="text-align: center; margin: 2rem 0;">
  <a href="/apps/mondrian/index.html" target="_blank" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
    🚀 Mondrian Generator 열기
  </a>
</div>

---

## ✨ 주요 기능

### 1. **실시간 생성 알고리즘**

- **성장 시뮬레이션**: 작은 점에서 시작한 사각형들이 실시간으로 성장하며 서로 충돌하지 않도록 공간을 채웁니다
- **재귀적 세분화**: 큰 사각형 안에 작은 사각형들이 생성되어 복잡한 패턴을 만듭니다
- **충돌 감지**: 2D 그리드 기반 Occupancy Grid 시스템으로 효율적인 공간 관리

### 2. **다양한 색상 팔레트**

5가지 프리셋 테마와 커스텀 테마를 제공합니다:

- **Bauhaus** 🎨: 몬드리안의 원작에 가까운 빨강, 파랑, 노랑, 흰색, 검정
- **Neon** ⚡: 마젠타, 시안, 노랑의 생동감 넘치는 네온 컬러
- **Pastel** 🌸: 부드러운 핑크, 라이트 블루, 라이트 그린
- **Earth** 🌍: 브라운 계열의 자연스러운 색상
- **Forest** 🌲: 다양한 그린 톤의 숲 테마
- **Custom** 🎨: 이미지에서 색상을 추출하거나 직접 편집 가능

### 3. **이미지 색상 추출**

- 원하는 이미지를 업로드하면 자동으로 주요 색상 5개를 추출합니다
- **OKLCH 색상 공간** 사용으로 지각적으로 균일한 색상 표현
- 추출된 색상으로 즉시 새로운 작품 생성

### 4. **세밀한 커스터마이징**

#### 성장 파라미터
- **Growth Speed** (1-10): 사각형이 성장하는 속도
- **Max Active Items** (1-20): 동시에 성장하는 사각형 개수
- **Recursion Depth** (0-3): 사각형 내부에 생성되는 레벨 깊이

#### 시각적 옵션
- **Virtual Lines**: 캔버스에 가상의 벽(장애물) 추가 (0-20개)
- **Rounded Corners**: 모서리를 둥글게 또는 날카롭게
- **Border**: 경계선 표시 여부, 두께, 색상 설정
- **Random Border Color**: 각 사각형마다 다른 경계선 색상
- **Background Color**: 배경색 자유 설정

### 5. **4K 고해상도 다운로드**

- **비율 유지 4K**: 현재 화면 비율을 유지하며 3840px 해상도로 저장
- **정사각형 4K**: 3840x3840px 정사각형 포맷으로 저장
- PNG 형식으로 고품질 이미지 다운로드
- 타임스탬프가 포함된 자동 파일명 생성

---

## 🎯 사용 방법

### 기본 사용법

1. **웹앱 실행**: 위의 링크를 클릭하여 Mondrian Generator를 엽니다
2. **자동 생성**: 페이지가 로드되면 자동으로 작품 생성이 시작됩니다
3. **관찰**: 사각형들이 실시간으로 성장하며 캔버스를 채우는 것을 감상합니다

### 커스터마이징

1. **팔레트 선택**: 오른쪽 사이드바에서 원하는 색상 테마를 클릭합니다
2. **파라미터 조정**: 슬라이더를 움직여 성장 속도, 개수, 깊이 등을 조절합니다
3. **리셋**: 🔄 버튼을 클릭하여 새로운 패턴으로 다시 시작합니다
4. **일시정지**: ⏸️ 버튼으로 애니메이션을 멈추고 결과를 확인합니다

### 이미지에서 색상 추출

1. **Extract from Img** 버튼 클릭
2. 원하는 이미지 파일 선택 (JPG, PNG 등)
3. 자동으로 주요 색상 5개가 추출되어 Custom 팔레트에 적용됩니다
4. 추출된 색상은 개별적으로 수정 가능합니다

### 작품 저장

1. **📷 버튼**: 현재 화면 비율을 유지한 4K 이미지 다운로드
2. **◻️ 버튼**: 정사각형 4K 이미지 다운로드 (Instagram 등에 최적)
3. 파일명 형식: `mondrian-4k-[타임스탬프].png`

---

## 💡 활용 아이디어

### 디자인 작업
- **배경 이미지**: 웹사이트, 프레젠테이션, SNS 배경으로 활용
- **패턴 디자인**: 텍스타일, 포스터, 명함 디자인에 응용
- **색상 영감**: 이미지 색상 추출 기능으로 색상 팔레트 연구

### 예술 작품
- **디지털 아트**: 매번 다른 독특한 추상 작품 생성
- **NFT 아트**: 생성형 아트 컬렉션 제작
- **인테리어**: 고해상도 출력하여 액자로 제작

### 교육 및 학습
- **알고리즘 학습**: 생성형 알고리즘과 충돌 감지 원리 이해
- **색상 이론**: OKLCH 색상 공간과 색상 조화 학습
- **미술사**: 몬드리안과 데 스틸(De Stijl) 운동 탐구

---

## 🔧 기술 스택

### 프론트엔드
- **React 18**: UI 컴포넌트 및 상태 관리
- **Canvas API**: 실시간 그래픽 렌더링
- **Tailwind CSS**: 모던한 UI 스타일링
- **Lucide Icons**: 깔끔한 아이콘 세트

### 핵심 알고리즘
- **Occupancy Grid**: Uint8Array 기반 2D 공간 관리
- **Growth Simulation**: 프레임 단위 실시간 성장 시뮬레이션
- **Recursive Subdivision**: 재귀적 사각형 생성
- **Collision Detection**: 효율적인 충돌 감지 및 회피

### 색상 처리
- **OKLCH 색상 공간**: 지각적으로 균일한 색상 표현
- **Hex to OKLCH 변환**: 이미지에서 추출한 RGB 색상을 OKLCH로 변환
- **K-means 색상 클러스터링**: 이미지에서 대표 색상 추출

---

## 🎨 몬드리안에 대하여

**피트 몬드리안(Piet Mondrian, 1872-1944)**은 네덜란드의 화가로, 추상 미술의 선구자 중 한 명입니다.

### 특징
- **신조형주의(Neoplasticism)**: 수평선과 수직선, 삼원색(빨강, 파랑, 노랑)과 무채색만을 사용
- **순수 추상**: 자연의 형태를 완전히 배제하고 기하학적 요소만으로 구성
- **균형과 조화**: 비대칭적이지만 완벽한 균형을 이루는 구성

### 대표작
- **Composition with Red, Blue and Yellow** (1930)
- **Broadway Boogie Woogie** (1942-43)
- **Victory Boogie Woogie** (1942-44, 미완성)

이 웹앱은 몬드리안의 철학을 현대적인 생성형 알고리즘으로 재해석한 것입니다.

---

## 🚀 성능 최적화

### 렌더링 최적화
- **RequestAnimationFrame**: 브라우저 리페인트 주기에 맞춘 부드러운 애니메이션
- **Uint8Array**: 메모리 효율적인 그리드 데이터 구조
- **Canvas 오프스크린 렌더링**: 4K 다운로드 시 별도 캔버스 사용

### 알고리즘 최적화
- **공간 분할**: 그리드 기반 충돌 감지로 O(n²) → O(1) 복잡도 감소
- **조기 종료**: 성장 불가능한 사각형은 즉시 finished 상태로 전환
- **랜덤 샘플링**: 빈 공간 탐색 시 랜덤 샘플링으로 빠른 발견

---

## 🎁 팁과 트릭

### 아름다운 작품 만들기
1. **느린 성장**: Speed를 2-3으로 낮추면 더 조밀한 패턴 생성
2. **높은 재귀**: Recursion Depth를 2-3으로 설정하면 복잡한 구조
3. **가상 벽**: Virtual Lines를 3-5개 추가하면 독특한 분할 효과
4. **경계선 활용**: Border를 켜고 Random Color를 활성화하면 스테인드글라스 효과

### 색상 팔레트 만들기
1. 좋아하는 사진이나 그림에서 색상 추출
2. Custom 팔레트에서 개별 색상을 미세 조정
3. 배경색을 어둡게 하면 색상이 더 돋보임
4. 파스텔 톤은 부드러운 느낌, 네온은 강렬한 느낌

### 최적 다운로드 타이밍
1. 애니메이션이 완전히 끝날 때까지 기다리기
2. 일시정지 후 마음에 드는 순간 캡처
3. 여러 번 리셋하여 다양한 버전 생성
4. 같은 설정이라도 매번 다른 결과가 나옴



## 💬 마치며

Mondrian Generator는 단순한 도구를 넘어, 누구나 예술가가 될 수 있다는 것을 보여주는 프로젝트입니다. 

복잡한 알고리즘과 수학적 원리가 숨어있지만, 사용자는 그저 슬라이더를 움직이고 버튼을 클릭하는 것만으로 아름다운 작품을 만들 수 있습니다.

여러분만의 독특한 몬드리안 작품을 만들어보세요! 🎨

---

<div style="text-align: center; margin: 3rem 0; padding: 2rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 12px;">
  <h3 style="margin-bottom: 1rem;">지금 바로 시작하기</h3>
  <a href="/apps/mondrian/index.html" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
    🎨 Mondrian Generator 열기
  </a>
  <p style="margin-top: 1rem; font-size: 0.9rem; color: #64748b;">
    매번 다른 독특한 추상 작품을 만들어보세요
  </p>
</div>

---

*이 웹앱은 순수 클라이언트 사이드에서 실행되며, 어떠한 데이터도 서버로 전송되지 않습니다.*
