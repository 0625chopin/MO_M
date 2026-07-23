# 캘린더 12색 팔레트 — 대비·CVD 검토 근거

**Task 002** (DESIGN, 1주차) 산출물. 참조: **CON-04**, **D-026**, **D-006**, NFR-018·019·022, **R-013**, R-005, **FR-062**.

이 문서는 `src/app/globals.css`의 `--crew-1`..`--crew-12`와 `src/lib/crew-palette.ts`의
`CREW_PALETTE` 배열이 **왜 이 값·이 순서인지**를 재현 가능하게 기록한다. `docs/prioritization-and-risks.md`
D-026은 "실제 색값은 `globals.css` 작업 시 ΔE를 측정해 확정한다"고 못박아 두었다 — 이 문서가 그 확정 작업이다.
D-026 본문의 예시 수치(4.45:1 고정, 66쌍 중 6쌍 ΔE<10, 최소 2.0)는 **사전 검증 단계의 예시**이며, 아래 수치가
**이 저장소의 실제 `--background` 토큰을 기준으로 재계산한 최종 값**이다. 크기(자릿수) 는 같은 현상을 가리키지만
정확한 숫자는 다르다 — 이 문서가 우선한다.

## 0. 전제: 지금 이 코드베이스의 배경 토큰

작업 시작 시점에 `globals.css`가 이미 shadcn 초기화로 `oklch(1 0 0)`(라이트) / `oklch(0.145 0 0)`(다크,
`.dark` 클래스)를 쓰고 있었다(다른 팀원 작업, 이 Task의 담당 범위 밖이라 되돌리지 않았다). 두 값 모두
무채색(`C=0`)이므로 sRGB로 정확히 환산된다.

| 배경 | 값 | sRGB 환산 | WCAG 상대휘도 Y |
| --- | --- | --- | --- |
| 라이트 | `oklch(1 0 0)` | `#ffffff` | 1.000000 |
| 다크 | `oklch(0.145 0 0)` | ≈`#0a0a0a` | 0.003035 |

## 1. 대비 3:1을 만드는 휘도 창

WCAG 대비식 `(밝은쪽Y+0.05)/(어두운쪽Y+0.05) ≥ 3`을 각 배경에 대해 풀면:

- 다크 배경 대비 ≥3:1 → `Y_color ≥ 3×(0.003035+0.05) − 0.05 = 0.1091`
- 라이트 배경 대비 ≥3:1 → `Y_color ≤ (1.0+0.05)/3 − 0.05 = 0.3000`

**윈도우: `Y ∈ [0.1091, 0.3000]`.** 이 구간에 상대휘도가 들어가는 색은 라이트·다크 두 배경 모두에서
비텍스트 대비 3:1(NFR-018)을 만족한다 — **단일 팔레트 한 벌로 라이트·다크를 모두 커버**한다는 D-026의 결론이
이 저장소의 실제 배경 토큰에서도 성립함을 확인했다(NFR-022).

## 2. 12색 후보 생성과 명도 분산

D-026은 "휘도 창 안에서 명도를 의도적으로 분산시킨다"고 결정했다 — 색각 이상은 색상(hue)을 잃고 휘도(luminance)는
남기므로, 12색을 전부 같은 Y에 고정하면(등휘도) 색각 이상 사용자에게는 구분 축이 하나 사라진다. 그래서:

1. **HSL 색상환을 30°씩 12등분**한다(H=0,30,...,330), 채도는 최대(S=100%)로 시작한다.
2. 각 색상에 **저/중/고 3개 밴드**(윈도우 내부, `[0.15, 0.50, 0.85]` 비율 지점) 중 하나를 `index % 3`로
   배정해 인접한 색상끼리 같은 밴드를 쓰지 않도록 한다.
3. 목표 Y에 도달하는 HSL 명도(L)를 이분 탐색으로 구한 뒤 실제 sRGB로 환산한다.

결과 12색(사전 순서, 아직 CVD 정렬 전):

| H | HEX | Y | vs 라이트 | vs 다크 |
| ---: | --- | ---: | ---: | ---: |
| 0 | `#d20000` | 0.1370 | 5.61 | 3.53 |
| 30 | `#c36200` | 0.2034 | 4.14 | 4.78 |
| 60 | `#939300` | 0.2707 | 3.27 | 6.05 |
| 90 | `#3b7500` | 0.1365 | 5.63 | 3.52 |
| 120 | `#009200` | 0.2056 | 4.11 | 4.82 |
| 150 | `#00a352` | 0.2680 | 3.30 | 6.00 |
| 180 | `#007475` | 0.1378 | 5.59 | 3.54 |
| 210 | `#007af5` | 0.2051 | 4.12 | 4.81 |
| 240 | `#8080ff` | 0.2725 | 3.26 | 6.08 |
| 270 | `#8d1cff` | 0.1371 | 5.61 | 3.53 |
| 300 | `#dc00dc` | 0.2038 | 4.14 | 4.79 |
| 330 | `#ff3e9e` | 0.2717 | 3.26 | 6.07 |

**AC2 (FR-062) 확인**: 12색 전부 라이트·다크 양쪽 대비가 3.26 이상 — **3:1을 여유 있게 만족**한다.

## 3. 2형 색각(deuteranopia) 시뮬레이션과 ΔE

- 시뮬레이션: Machado, Oliveira, Fitzgibbon(2009)의 2형 색각(100% severity) 선형 sRGB 행렬을 각 색에 적용.
- 거리: 시뮬레이션된 색을 CIE Lab(D65)으로 변환 후 **CIEDE2000** ΔE를 12색 전 쌍(66쌍)에 대해 계산.

**최악 13쌍(ΔE<10, "구분이 어려워지는" 구간)**:

| 색 A | 색 B | ΔE(2형) |
| --- | --- | ---: |
| `#d20000`(H0) | `#009200`(H120) | 2.40 |
| `#c36200`(H30) | `#939300`(H60) | 3.84 |
| `#8080ff`(H240) | `#dc00dc`(H300) | 4.79 |
| `#c36200`(H30) | `#009200`(H120) | 5.31 |
| `#007af5`(H210) | `#8d1cff`(H270) | 5.58 |
| `#d20000`(H0) | `#c36200`(H30) | 5.88 |
| `#007af5`(H210) | `#dc00dc`(H300) | 6.84 |
| `#d20000`(H0) | `#3b7500`(H90) | 7.21 |
| `#007af5`(H210) | `#8080ff`(H240) | 7.50 |
| `#3b7500`(H90) | `#009200`(H120) | 7.97 |
| `#939300`(H60) | `#009200`(H120) | 8.57 |
| `#d20000`(H0) | `#939300`(H60) | 9.61 |
| `#009200`(H120) | `#00a352`(H150) | 9.74 |

66쌍 중 13쌍(약 20%)이 ΔE<10이다. 대부분 적-녹 축(H0/60/90/120/150 부근)에 몰려 있다 — 2형 색각이
정확히 그 축을 잃기 때문이며, **구조적으로 완전히 없앨 수 없다**(D-026이 이미 예견한 현상). 이것이
**NFR-019(색만으로 정보 전달 금지)를 "불가침"으로 취급**해야 하는 이유의 실측 근거다: 이 팔레트를 쓰는
어떤 화면이든 크루명 텍스트 라벨과 `aria-label`을 반드시 병기해야 하며, 이 파일은 그 규칙을 강제하지
않는다(컴포넌트가 강제한다 — Task 013/021A).

## 4. 팔레트 순서 — greedy farthest-point(maximin) 정렬

D-026: "같은 날짜 셀 충돌 회피는 인덱스 인접이 아니라 지각적 거리를 따른다." 이를 배열 자체의 순서로
구현했다 — **인덱스 순서 자체가 이미 지각적 거리 최대화 순서**이므로, FR-062 AC3의 충돌 처리(`index+1`로
진행)가 실제로 "다음으로 먼 색"을 고르게 된다.

알고리즘(그리디 최원점 삽입):
1. 66쌍 중 ΔE(2형)가 가장 큰 쌍을 인덱스 0·1로 시작.
2. 남은 색 중, **이미 선택된 색 전체와의 최소 거리가 가장 큰** 색을 다음 인덱스로 추가.
3. 12개를 다 채울 때까지 반복.

**최종 순서(`--crew-1`..`--crew-12`, `CREW_PALETTE[0..11]`과 동일)**:

| index | HEX | 색 이름(참고용) | Y | vs 라이트 | vs 다크 |
| ---: | --- | --- | ---: | ---: | ---: |
| 0 | `#939300` | 올리브 | 0.2707 | 3.27 | 6.05 |
| 1 | `#8d1cff` | 바이올렛 | 0.1371 | 5.61 | 3.53 |
| 2 | `#ff3e9e` | 핑크 | 0.2717 | 3.26 | 6.07 |
| 3 | `#007475` | 틸 | 0.1378 | 5.59 | 3.54 |
| 4 | `#3b7500` | 그린 | 0.1365 | 5.63 | 3.52 |
| 5 | `#8080ff` | 페리윙클 | 0.2725 | 3.26 | 6.08 |
| 6 | `#00a352` | 에메랄드 | 0.2680 | 3.30 | 6.00 |
| 7 | `#009200` | 딥그린 | 0.2056 | 4.11 | 4.82 |
| 8 | `#007af5` | 블루 | 0.2051 | 4.12 | 4.81 |
| 9 | `#dc00dc` | 마젠타 | 0.2038 | 4.14 | 4.79 |
| 10 | `#c36200` | 브라운/오렌지 | 0.2034 | 4.14 | 4.78 |
| 11 | `#d20000` | 레드 | 0.1370 | 5.61 | 3.53 |

**인접 인덱스(`i → i+1 mod 12`, 실제 충돌 처리 경로)의 ΔE(2형)**:

| i→i+1 | ΔE | i→i+1 | ΔE | i→i+1 | ΔE |
| --- | ---: | --- | ---: | --- | ---: |
| 0→1 | 67.24 | 4→5 | 57.54 | 8→9 | 6.84 |
| 1→2 | 34.01 | 5→6 | 48.94 | 9→10 | 55.25 |
| 2→3 | 23.60 | 6→7 | 9.74 | 10→11 | 5.88 |
| 3→4 | 33.86 | 7→8 | 59.70 | 11→0 | 9.61 |

**인접 최소 ΔE = 5.88**, 전역 최소 ΔE(임의 쌍) = 2.40, 전역 최대 = 67.24.

이전 D-006 규칙("인접하지 않은 다음 인덱스")이 실패한 근거였던 사례(문서 원문: "인덱스 0↔2가 색각
이상에서 ΔE 3.4")와 비교하면, 이 정렬의 인접 최소값 **5.88은 그보다 낫다** — 완전히 없애지는 못해도
"바로 다음 색으로 넘어가면 대체로 잘 보인다"는 D-026의 의도를 충족한다. 8→9(6.84)가 이 순서에서 가장
약한 인접 구간이며, 3연속 충돌(같은 날짜 셀에 3개 이상 겹침) 시나리오에서 `#007af5`(8) 다음이
`#dc00dc`(9)로 넘어가는 지점을 접근성 QA(Task 024)에서 우선 확인할 가치가 있다.

## 5. 남은 리스크 / 다음 회차로 넘길 사항

- **텍스트 라벨의 전경색 대비는 이 팔레트 범위 밖이다.** 이 표는 "바 배경 vs 페이지 배경" 3:1(NFR-018
  비텍스트)만 보장한다. `MeetupBar`에 크루명 텍스트를 바 색 위에 직접 얹는다면(Task 021A) 텍스트
  4.5:1은 **별도로** 검증해야 한다 — 흰 텍스트 온 `#939300`(올리브, 밝은 축) 같은 조합은 위험할 수 있다.
- **13/66쌍이 ΔE<10** — 특히 적-녹 축에 몰려 있다. 크루 필터(FR-061)와 라벨/`aria-label` 병기가
  실사용에서 실제로 이 간극을 메우는지는 Task 021A/024의 수동 QA에서 확인해야 한다(자동화 없음, R-002).
- **`globals.css`가 `prefers-color-scheme` 미디어쿼리가 아니라 `.dark` 클래스 변형**(`@custom-variant
  dark (&:is(.dark *))`)으로 이미 설정돼 있었다 — 이 Task 시작 전에 다른 팀원(shadcn 초기화, 추정
  CORE/Task 001)이 만든 상태였다. D-026 요건(단일 팔레트로 양쪽 통과)에는 영향 없어 그대로 두었지만,
  CLAUDE.md의 "스택과 현재 상태" 절이 서술한 `prefers-color-scheme` 기반 설명과는 달라졌다 — CORE가
  리뷰 시 이 괴리를 문서에 반영할지 확인이 필요하다(내 담당 파일 경계 밖).
- **오너 수동 지정(D-006 AC4)** UI는 이 Task 범위 밖이다 — 팔레트 밖 색을 못 고르게 막는 검증은
  크루 설정 화면(SC-15) 구현 시 이 문서의 12색 목록을 참조해야 한다.

## 6. 재현 스크립트

아래 파이썬 스크립트가 위 표 전체(휘도 창 → 후보색 → CVD 시뮬레이션 → ΔE2000 → farthest-point 정렬)를
그대로 재현한다. 배경 토큰이 바뀌면(R-005 위험 — `globals.css` 변경) 이 스크립트를 다시 돌려 값을
갱신해야 한다.

```python
"""mo_im Task 002 — calendar 12-color palette derivation. Re-run whenever
--background tokens change (see docs/design/calendar-palette.md §0)."""
import math

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def linear_to_srgb(c):
    c = max(0.0, min(1.0, c))
    s = c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055
    return max(0, min(255, round(s * 255)))

def relative_luminance(rgb):
    r, g, b = (srgb_to_linear(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(rgb1, rgb2):
    l1, l2 = relative_luminance(rgb1), relative_luminance(rgb2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def hsl_to_rgb(h, s, l):
    h = h / 360.0
    def hue2rgb(p, q, t):
        if t < 0: t += 1
        if t > 1: t -= 1
        if t < 1/6: return p + (q - p) * 6 * t
        if t < 1/2: return q
        if t < 2/3: return p + (q - p) * (2/3 - t) * 6
        return p
    q = l * (1 + s) if l < 0.5 else l + s - l * s
    p = 2 * l - q
    return (round(hue2rgb(p, q, h + 1/3) * 255),
            round(hue2rgb(p, q, h) * 255),
            round(hue2rgb(p, q, h - 1/3) * 255))

LIGHT_BG, DARK_BG = (0xff, 0xff, 0xff), (0x0a, 0x0a, 0x0a)
Y_LOWER = 3 * (relative_luminance(DARK_BG) + 0.05) - 0.05
Y_UPPER = (relative_luminance(LIGHT_BG) + 0.05) / 3 - 0.05

def find_lightness_for_Y(hue, target_Y, s=1.0):
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        y = relative_luminance(hsl_to_rgb(hue, s, mid))
        lo, hi = (mid, hi) if y < target_Y else (lo, mid)
    return (lo + hi) / 2

HUES = [i * 30 for i in range(12)]
Y_BANDS = [Y_LOWER + (Y_UPPER - Y_LOWER) * r for r in (0.15, 0.50, 0.85)]
candidates = []
for idx, hue in enumerate(HUES):
    l = find_lightness_for_Y(hue, Y_BANDS[idx % 3])
    rgb = hsl_to_rgb(hue, 1.0, l)
    candidates.append(dict(hue=hue, rgb=rgb,
                            hex='#{:02x}{:02x}{:02x}'.format(*rgb),
                            Y=relative_luminance(rgb),
                            contrast_light=contrast_ratio(rgb, LIGHT_BG),
                            contrast_dark=contrast_ratio(rgb, DARK_BG)))

# Machado/Oliveira/Fitzgibbon 2009, deuteranopia, 100% severity, linear RGB
M_DEUTER = [[0.367322, 0.860646, -0.227968],
            [0.280085, 0.672501, 0.047413],
            [-0.011820, 0.042940, 0.968881]]

def simulate_deuteranopia(rgb):
    lin = [srgb_to_linear(c) for c in rgb]
    return tuple(linear_to_srgb(sum(row[k] * lin[k] for k in range(3))) for row in M_DEUTER)

XN, YN, ZN = 0.95047, 1.0, 1.08883

def rgb_to_lab(rgb):
    r, g, b = (srgb_to_linear(c) for c in rgb)
    x = 0.4124564*r + 0.3575761*g + 0.1804375*b
    y = 0.2126729*r + 0.7151522*g + 0.0721750*b
    z = 0.0193339*r + 0.1191920*g + 0.9503041*b
    def f(t):
        d = 6/29
        return t ** (1/3) if t > d**3 else t / (3*d**2) + 4/29
    fx, fy, fz = f(x/XN), f(y/YN), f(z/ZN)
    return (116*fy - 16, 500*(fx - fy), 200*(fy - fz))

def ciede2000(lab1, lab2):
    # standard CIEDE2000 implementation (kL=kC=kH=1)
    L1, a1, b1 = lab1; L2, a2, b2 = lab2
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2)
    Cbar = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cbar**7 / (Cbar**7 + 25**7)))
    a1p, a2p = (1+G)*a1, (1+G)*a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    def hp(ap, b):
        if ap == 0 and b == 0: return 0.0
        h = math.degrees(math.atan2(b, ap))
        return h + 360 if h < 0 else h
    h1p, h2p = hp(a1p, b1), hp(a2p, b2)
    dLp, dCp = L2 - L1, C2p - C1p
    if C1p * C2p == 0:
        dhp = 0.0
    else:
        diff = h2p - h1p
        dhp = diff - 360 if diff > 180 else (diff + 360 if diff < -180 else diff)
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp) / 2)
    Lbarp, Cbarp = (L1+L2)/2, (C1p+C2p)/2
    if C1p * C2p == 0:
        hbarp = h1p + h2p
    else:
        s, d = h1p + h2p, abs(h1p - h2p)
        hbarp = s/2 if d <= 180 else ((s+360)/2 if s < 360 else (s-360)/2)
    T = (1 - 0.17*math.cos(math.radians(hbarp-30)) + 0.24*math.cos(math.radians(2*hbarp))
         + 0.32*math.cos(math.radians(3*hbarp+6)) - 0.20*math.cos(math.radians(4*hbarp-63)))
    dtheta = 30 * math.exp(-(((hbarp-275)/25)**2))
    RC = 2 * math.sqrt(Cbarp**7 / (Cbarp**7 + 25**7))
    SL = 1 + (0.015*(Lbarp-50)**2) / math.sqrt(20+(Lbarp-50)**2)
    SC, SH = 1 + 0.045*Cbarp, 1 + 0.015*Cbarp*T
    RT = -math.sin(math.radians(2*dtheta)) * RC
    return math.sqrt((dLp/SL)**2 + (dCp/SC)**2 + (dHp/SH)**2 + RT*(dCp/SC)*(dHp/SH))

for c in candidates:
    c['cvd_lab'] = rgb_to_lab(simulate_deuteranopia(c['rgb']))

n = len(candidates)
dist = [[ciede2000(candidates[i]['cvd_lab'], candidates[j]['cvd_lab']) if i != j else 0.0
         for j in range(n)] for i in range(n)]
pairs = sorted(((i, j, dist[i][j]) for i in range(n) for j in range(i+1, n)), key=lambda t: t[2])

# greedy farthest-point (maximin) ordering
remaining = set(range(n))
i0, j0, _ = max(pairs, key=lambda t: t[2])
order = [i0, j0]; remaining -= {i0, j0}
while remaining:
    best_idx, best_score = None, -1
    for k in remaining:
        score = min(dist[k][p] for p in order)
        if score > best_score: best_score, best_idx = score, k
    order.append(best_idx); remaining.remove(best_idx)

# `order` now gives the final index 0..11 assignment (candidates[order[i]])
```
