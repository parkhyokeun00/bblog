const { useState, useEffect, useRef, useCallback } = React;

const randomRange = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomRange(min, max));

const MIN_SIZE_FOR_SPLIT = 40;
const MIN_CHILD_SIZE = 10;

// 2D 그리드 클래스
class OccupancyGrid {
    constructor(width, height) {
        this.width = Math.ceil(width);
        this.height = Math.ceil(height);
        this.data = new Uint8Array(this.width * this.height);
        this.freeCount = this.width * this.height;
    }

    isOccupied(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.data[y * this.width + x] === 1;
    }

    checkArea(x, y, w, h) {
        const startX = Math.floor(x);
        const startY = Math.floor(y);
        const endX = Math.ceil(x + w);
        const endY = Math.ceil(y + h);

        if (startX < 0 || startY < 0 || endX > this.width || endY > this.height) return false;

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                if (this.data[i * this.width + j] === 1) return false;
            }
        }
        return true;
    }

    markArea(x, y, w, h) {
        const startX = Math.floor(x);
        const startY = Math.floor(y);
        const endX = Math.ceil(x + w);
        const endY = Math.ceil(y + h);

        for (let i = startY; i < endY; i++) {
            for (let j = startX; j < endX; j++) {
                const idx = i * this.width + j;
                if (this.data[idx] === 0) {
                    this.data[idx] = 1;
                    this.freeCount--;
                }
            }
        }
    }

    findFreeSpot() {
        if (this.freeCount === 0) return null;

        for (let i = 0; i < 200; i++) {
            const rx = randomInt(0, this.width);
            const ry = randomInt(0, this.height);
            if (this.data[ry * this.width + rx] === 0) {
                return { x: rx, y: ry };
            }
        }

        const startIdx = randomInt(0, this.data.length);
        for (let i = 0; i < this.data.length; i++) {
            const idx = (startIdx + i) % this.data.length;
            if (this.data[idx] === 0) {
                return { x: idx % this.width, y: Math.floor(idx / this.width) };
            }
        }
        return null;
    }
}

// --- 사각형 클래스 ---
class Rect {
    constructor(x, y, w, h, color, depth, maxDepth, bounds, config) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.bounds = bounds;
        this.config = config;

        this.growing = true;
        this.finished = false;

        const baseSpeed = config.speed;
        this.vx = baseSpeed * randomRange(0.8, 1.2);
        this.vy = baseSpeed * randomRange(0.8, 1.2);

        this.children = [];
        this.subdivideTimer = 0;

        // 경계선 색상 설정 (랜덤 모드일 경우 팔레트에서 선택)
        this.borderColor = config.randomBorderColor ? config.getThemeColor() : config.borderColor;
    }

    grow(grid) {
        if (!this.growing) return;

        // X축 성장
        const currentRight = this.x + this.w;
        const nextRight = currentRight + this.vx;
        const currentRightIdx = Math.floor(currentRight - 0.001);
        const nextRightIdx = Math.floor(nextRight - 0.001);

        let canGrowX = true;

        if (nextRight > this.bounds.x + this.bounds.w) {
            canGrowX = false;
        } else if (grid && nextRightIdx > currentRightIdx) {
            const checkW = nextRightIdx - currentRightIdx;
            if (!grid.checkArea(currentRightIdx + 1, this.y, checkW, this.h)) {
                canGrowX = false;
            }
        }

        if (canGrowX) {
            if (grid && nextRightIdx > currentRightIdx) {
                const markW = nextRightIdx - currentRightIdx;
                grid.markArea(currentRightIdx + 1, this.y, markW, this.h);
            }
            this.w += this.vx;
        } else {
            this.vx = 0;
        }

        // Y축 성장
        const currentBottom = this.y + this.h;
        const nextBottom = currentBottom + this.vy;
        const currentBottomIdx = Math.floor(currentBottom - 0.001);
        const nextBottomIdx = Math.floor(nextBottom - 0.001);

        let canGrowY = true;

        if (nextBottom > this.bounds.y + this.bounds.h) {
            canGrowY = false;
        } else if (grid && nextBottomIdx > currentBottomIdx) {
            const checkH = nextBottomIdx - currentBottomIdx;
            if (!grid.checkArea(this.x, currentBottomIdx + 1, this.w, checkH)) {
                canGrowY = false;
            }
        }

        if (canGrowY) {
            if (grid && nextBottomIdx > currentBottomIdx) {
                const markH = nextBottomIdx - currentBottomIdx;
                grid.markArea(this.x, currentBottomIdx + 1, this.w, markH);
            }
            this.h += this.vy;
        } else {
            this.vy = 0;
        }

        if (this.vx === 0 && this.vy === 0) {
            this.growing = false;
            this.finished = true;
        }
    }

    updateChildren(globalPhase) {
        if (!this.finished || this.depth >= this.maxDepth) return;
        if (this.w < MIN_SIZE_FOR_SPLIT || this.h < MIN_SIZE_FOR_SPLIT) return;
        if (this.depth === 0 && globalPhase !== 'subdividing') return;

        this.subdivideTimer++;
        if (this.subdivideTimer > 8) {
            this.subdivideTimer = 0;
            if (this.children.length < 20) {
                if (Math.random() < this.config.subdivisionChance) {
                    this.spawnChild();
                }
            }
        }

        for (let child of this.children) {
            child.grow(null);
            child.growSimple(this.children);
            child.updateChildren(globalPhase);
        }
    }

    growSimple(siblings) {
        if (!this.growing) return;

        const nextW = this.w + this.vx;
        const nextH = this.h + this.vy;

        if (this.x + nextW > this.bounds.x + this.bounds.w ||
            this.y + nextH > this.bounds.y + this.bounds.h) {
            this.growing = false;
        }

        if (this.growing) {
            const myNewRight = this.x + nextW;
            const myNewBottom = this.y + nextH;

            for (let sib of siblings) {
                if (sib === this) continue;
                if (
                    this.x < sib.x + sib.w && myNewRight > sib.x &&
                    this.y < sib.y + sib.h && myNewBottom > sib.y
                ) {
                    this.growing = false;
                    break;
                }
            }
        }

        if (this.growing) {
            this.w = nextW;
            this.h = nextH;
        } else {
            this.finished = true;
        }
    }

    spawnChild() {
        const pad = 2;
        const availableW = this.w - pad * 2;
        const availableH = this.h - pad * 2;
        if (availableW < MIN_CHILD_SIZE || availableH < MIN_CHILD_SIZE) return;

        const spawnX = Math.floor(randomRange(this.x + pad, this.x + this.w - pad));
        const spawnY = Math.floor(randomRange(this.y + pad, this.y + this.h - pad));
        const seedW = 2;
        const seedH = 2;
        const seed = { x: spawnX, y: spawnY, w: seedW, h: seedH };

        let safe = true;
        for (let child of this.children) {
            if (
                seed.x < child.x + child.w && seed.x + seed.w > child.x &&
                seed.y < child.y + child.h && seed.y + seed.h > child.y
            ) {
                safe = false;
                break;
            }
        }

        if (safe) {
            const newColor = this.config.getThemeColor();
            const child = new Rect(
                spawnX, spawnY, seedW, seedH,
                newColor,
                this.depth + 1,
                this.maxDepth,
                { x: this.x, y: this.y, w: this.w, h: this.h },
                this.config
            );
            this.children.push(child);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        const radius = Math.min(this.w, this.h) * 0.3;
        const clampedRadius = Math.max(0, Math.min(radius, 16));

        ctx.beginPath();
        if (this.config.roundedCorners && ctx.roundRect) {
            ctx.roundRect(this.x, this.y, this.w, this.h, clampedRadius);
        } else {
            ctx.rect(this.x, this.y, this.w, this.h);
        }
        ctx.fill();

        // 경계선 그리기
        if (this.config.showBorder) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.config.borderWidth;
            ctx.stroke();
        }

        for (let child of this.children) {
            child.draw(ctx);
        }
    }
}

const App = () => {
    const [config, setConfig] = useState({
        speed: 4.0,
        maxDepth: 2,
        subdivisionChance: 0.1,
        maxActiveRects: 5,
        colorTheme: 'bauhaus',
        bgColor: 'oklch(0.18 0.02 250)', // Dark blue-gray
        lineCount: 0, // 가상 선 개수 (0 = 끔)
        roundedCorners: true, // 모서리 둥글게
        showBorder: false, // 경계선 표시
        borderWidth: 2, // 경계선 두께
        borderColor: 'oklch(0.00 0 0)', // Black
        randomBorderColor: false, // 경계선 색상 랜덤
        isRunning: true
    });

    // 색상 테마 상태 (OKLCH 색상 공간 사용)
    const [themes, setThemes] = useState({
        bauhaus: [
            'oklch(0.55 0.22 25)',    // Red
            'oklch(0.50 0.17 250)',   // Blue
            'oklch(0.90 0.15 95)',    // Yellow
            'oklch(0.95 0.01 0)',     // White
            'oklch(0.25 0.01 0)'      // Black
        ],
        neon: [
            'oklch(0.70 0.32 330)',   // Magenta
            'oklch(0.85 0.20 195)',   // Cyan
            'oklch(0.95 0.21 105)',   // Yellow
            'oklch(0.30 0.02 0)',     // Dark Gray
            'oklch(0.15 0.01 0)'      // Very Dark
        ],
        pastel: [
            'oklch(0.85 0.12 340)',   // Pink
            'oklch(0.85 0.10 230)',   // Light Blue
            'oklch(0.92 0.12 120)',   // Light Green
            'oklch(0.95 0.10 90)',    // Light Yellow
            'oklch(0.88 0.08 10)'     // Light Peach
        ],
        earth: [
            'oklch(0.55 0.06 40)',    // Brown
            'oklch(0.80 0.03 40)',    // Light Brown
            'oklch(0.40 0.05 35)',    // Dark Brown
            'oklch(0.65 0.04 38)',    // Medium Brown
            'oklch(0.30 0.04 30)'     // Very Dark Brown
        ],
        forest: [
            'oklch(0.50 0.12 160)',   // Dark Green
            'oklch(0.60 0.12 155)',   // Medium Green
            'oklch(0.70 0.13 150)',   // Light Green
            'oklch(0.92 0.08 145)',   // Very Light Green
            'oklch(0.35 0.10 165)'    // Very Dark Green
        ],
        custom: [
            'oklch(1.00 0 0)',        // White
            'oklch(0.85 0 0)',        // Light Gray
            'oklch(0.65 0 0)',        // Medium Gray
            'oklch(0.45 0 0)',        // Dark Gray
            'oklch(0.25 0 0)'         // Very Dark Gray
        ]
    });

    const [phase, setPhase] = useState('filling');
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const rectsRef = useRef([]);
    const gridRef = useRef(null);
    const virtualLinesRef = useRef([]); // 가상의 선 저장
    const configRef = useRef(config);
    const phaseRef = useRef('filling');
    const themesRef = useRef(themes);

    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { themesRef.current = themes; }, [themes]);

    // 현재 테마의 색상 가져오기
    const getThemeColor = useCallback(() => {
        const currentTheme = themesRef.current[configRef.current.colorTheme];
        if (!currentTheme) return 'oklch(1.00 0 0)'; // White
        return currentTheme[Math.floor(Math.random() * currentTheme.length)];
    }, []);

    // Hex to OKLCH 변환 함수
    const hexToOklch = (hex) => {
        // Hex to RGB
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        // RGB to Linear RGB
        const toLinear = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        const rL = toLinear(r);
        const gL = toLinear(g);
        const bL = toLinear(b);

        // Linear RGB to XYZ (D65)
        const x = 0.4124564 * rL + 0.3575761 * gL + 0.1804375 * bL;
        const y = 0.2126729 * rL + 0.7151522 * gL + 0.0721750 * bL;
        const z = 0.0193339 * rL + 0.1191920 * gL + 0.9503041 * bL;

        // XYZ to OKLab
        const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
        const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
        const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

        const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
        const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
        const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

        // OKLab to OKLCH
        const C = Math.sqrt(a * a + b_ * b_);
        let H = Math.atan2(b_, a) * 180 / Math.PI;
        if (H < 0) H += 360;

        return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(0)})`;
    };

    // 색상 추출 로직
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // 리사이징하여 성능 최적화
                const size = 64;
                canvas.width = size;
                canvas.height = size;
                ctx.drawImage(img, 0, 0, size, size);

                const data = ctx.getImageData(0, 0, size, size).data;
                const colorCounts = {};

                // 픽셀 순회하며 색상 빈도 계산
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // 색상 단순화 (비슷한 색 그룹화)
                    const binSize = 20;
                    const rBin = Math.round(r / binSize) * binSize;
                    const gBin = Math.round(g / binSize) * binSize;
                    const bBin = Math.round(b / binSize) * binSize;

                    const hex = `#${((1 << 24) + (rBin << 16) + (gBin << 8) + bBin).toString(16).slice(1)}`;
                    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                }

                // 빈도순 정렬
                const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

                // 거리 기반 색상 필터링 (중복/유사 색상 제거)
                const distinctiveColors = [];
                const MIN_DISTANCE = 50; // 색상 거리 임계값 (조절 가능)

                const getColorDistance = (hex1, hex2) => {
                    const r1 = parseInt(hex1.slice(1, 3), 16);
                    const g1 = parseInt(hex1.slice(3, 5), 16);
                    const b1 = parseInt(hex1.slice(5, 7), 16);
                    const r2 = parseInt(hex2.slice(1, 3), 16);
                    const g2 = parseInt(hex2.slice(3, 5), 16);
                    const b2 = parseInt(hex2.slice(5, 7), 16);
                    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
                };

                for (const hex of sortedColors) {
                    if (distinctiveColors.length >= 5) break;

                    let isDistinct = true;
                    for (const existing of distinctiveColors) {
                        if (getColorDistance(hex, existing) < MIN_DISTANCE) {
                            isDistinct = false;
                            break;
                        }
                    }

                    if (isDistinct) {
                        distinctiveColors.push(hex);
                    }
                }

                // 5개 미만일 경우 보충 (기본 색상 사용하되 중복 피함)
                const defaults = ['#ffffff', '#000000', '#ff0000', '#0000ff', '#ffff00'];
                let defaultIndex = 0;
                while (distinctiveColors.length < 5) {
                    const defColor = defaults[defaultIndex % defaults.length];
                    // 중복 체크 후 추가
                    if (!distinctiveColors.includes(defColor)) {
                        distinctiveColors.push(defColor);
                    }
                    defaultIndex++;
                }

                // Hex를 OKLCH로 변환
                const top5Oklch = distinctiveColors.map(hex => hexToOklch(hex));

                setThemes(prev => ({ ...prev, custom: top5Oklch }));
                setConfig(prev => ({ ...prev, colorTheme: 'custom' }));

                // 시뮬레이션 리셋
                setTimeout(initSimulation, 100);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const initSimulation = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        rectsRef.current = [];
        const newGrid = new OccupancyGrid(canvas.width, canvas.height);
        virtualLinesRef.current = [];

        // 가상의 선 생성 (장애물)
        if (configRef.current.lineCount > 0) {
            const count = configRef.current.lineCount;
            const thickness = 2; // 선 두께

            for (let i = 0; i < count; i++) {
                const isVertical = Math.random() > 0.5;
                if (isVertical) {
                    const x = randomInt(20, canvas.width - 20);
                    newGrid.markArea(x, 0, thickness, canvas.height);
                    virtualLinesRef.current.push({ x, y: 0, w: thickness, h: canvas.height });
                } else {
                    const y = randomInt(20, canvas.height - 20);
                    newGrid.markArea(0, y, canvas.width, thickness);
                    virtualLinesRef.current.push({ x: 0, y, w: canvas.width, h: thickness });
                }
            }
        }

        gridRef.current = newGrid;
        phaseRef.current = 'filling';
        setPhase('filling');

        // Clear Canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = configRef.current.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            initSimulation();
        }
    }, []);

    const animate = () => {
        if (!configRef.current.isRunning) {
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const grid = gridRef.current;

        // --- Filling Phase ---
        if (phaseRef.current === 'filling') {
            const activeRects = rectsRef.current.filter(r => r.growing).length;

            if (activeRects < configRef.current.maxActiveRects) {
                let spawned = false;
                for (let i = 0; i < 5; i++) { // 시도 횟수 증가
                    const spot = grid.findFreeSpot();
                    if (spot) {
                        const newRect = new Rect(
                            spot.x, spot.y, 1, 1,
                            getThemeColor(),
                            0,
                            configRef.current.maxDepth,
                            { x: 0, y: 0, w: canvas.width, h: canvas.height },
                            { ...configRef.current, getThemeColor }
                        );
                        grid.markArea(spot.x, spot.y, 1, 1);
                        rectsRef.current.push(newRect);
                        spawned = true;
                    }
                }

                if (!spawned && activeRects === 0) {
                    if (grid.freeCount < canvas.width * canvas.height * 0.005) {
                        phaseRef.current = 'subdividing';
                        setPhase('subdividing');
                    }
                }
            }
        }

        // 배경 그리기
        ctx.fillStyle = configRef.current.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 가상의 선 그리기 (선택적: 보이게 할지 말지. 여기선 보이게 처리)
        if (configRef.current.lineCount > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let line of virtualLinesRef.current) {
                ctx.fillRect(line.x, line.y, line.w, line.h);
            }
        }

        for (let r of rectsRef.current) {
            r.grow(grid);
            r.updateChildren(phaseRef.current);
            r.draw(ctx);
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        if (key === 'lineCount') setTimeout(initSimulation, 50);
    };

    // 커스텀 테마 색상 수동 변경 핸들러
    const updateCustomThemeColor = (index, newColor) => {
        const newColors = [...themes.custom];
        newColors[index] = newColor;
        setThemes(prev => ({ ...prev, custom: newColors }));
        // 강제 리렌더링 효과를 위해 설정 업데이트
        if (config.colorTheme === 'custom') {
            setConfig(prev => ({ ...prev }));
        }
    };

    // 스크린샷 다운로드 기능 (4K 지원)
    const downloadScreenshot = () => {
        const sourceCanvas = canvasRef.current;
        if (!sourceCanvas) return;

        // 4K 해상도 설정 (현재 비율 유지)
        const sourceAspectRatio = sourceCanvas.width / sourceCanvas.height;
        let targetWidth, targetHeight;

        // 긴 쪽을 3840px로 설정하고 비율 유지
        if (sourceAspectRatio >= 1) {
            // 가로가 더 길거나 같음
            targetWidth = 3840;
            targetHeight = Math.round(3840 / sourceAspectRatio);
        } else {
            // 세로가 더 김
            targetHeight = 3840;
            targetWidth = Math.round(3840 * sourceAspectRatio);
        }

        // 오프스크린 캔버스 생성
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
        const ctx = offscreenCanvas.getContext('2d');

        // 스케일 계산 (동일한 비율로 스케일링)
        const scale = targetWidth / sourceCanvas.width;

        // 배경 그리기
        ctx.fillStyle = configRef.current.bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 가상의 선 그리기 (스케일 적용)
        if (configRef.current.lineCount > 0 && virtualLinesRef.current.length > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let line of virtualLinesRef.current) {
                ctx.fillRect(
                    line.x * scale,
                    line.y * scale,
                    line.w * scale,
                    line.h * scale
                );
            }
        }

        // 모든 사각형 그리기 (스케일 적용)
        const drawRectScaled = (rect) => {
            ctx.fillStyle = rect.color;
            const x = rect.x * scale;
            const y = rect.y * scale;
            const w = rect.w * scale;
            const h = rect.h * scale;

            const radius = Math.min(w, h) * 0.3;
            const clampedRadius = Math.max(0, Math.min(radius, 16 * scale));

            ctx.beginPath();
            if (rect.config.roundedCorners && ctx.roundRect) {
                ctx.roundRect(x, y, w, h, clampedRadius);
            } else {
                ctx.rect(x, y, w, h);
            }
            ctx.fill();

            // 경계선 그리기
            if (rect.config.showBorder) {
                ctx.strokeStyle = rect.borderColor;
                ctx.lineWidth = rect.config.borderWidth * scale;
                ctx.stroke();
            }

            // 자식 사각형들도 그리기
            for (let child of rect.children) {
                drawRectScaled(child);
            }
        };

        for (let r of rectsRef.current) {
            drawRectScaled(r);
        }

        // 현재 날짜/시간으로 파일명 생성
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `mondrian-4k-${timestamp}.png`;

        // Canvas를 Blob으로 변환하여 다운로드
        offscreenCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    // 정사각형 4K 스크린샷 다운로드 기능
    const downloadScreenshotSquare = () => {
        const sourceCanvas = canvasRef.current;
        if (!sourceCanvas) return;

        // 4K 정사각형 해상도
        const targetWidth = 3840;
        const targetHeight = 3840;

        // 오프스크린 캔버스 생성
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
        const ctx = offscreenCanvas.getContext('2d');

        // 스케일 계산
        const scaleX = targetWidth / sourceCanvas.width;
        const scaleY = targetHeight / sourceCanvas.height;

        // 배경 그리기
        ctx.fillStyle = configRef.current.bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 가상의 선 그리기 (스케일 적용)
        if (configRef.current.lineCount > 0 && virtualLinesRef.current.length > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let line of virtualLinesRef.current) {
                ctx.fillRect(
                    line.x * scaleX,
                    line.y * scaleY,
                    line.w * scaleX,
                    line.h * scaleY
                );
            }
        }

        // 모든 사각형 그리기 (스케일 적용)
        const drawRectScaled = (rect) => {
            ctx.fillStyle = rect.color;
            const x = rect.x * scaleX;
            const y = rect.y * scaleY;
            const w = rect.w * scaleX;
            const h = rect.h * scaleY;

            const radius = Math.min(w, h) * 0.3;
            const clampedRadius = Math.max(0, Math.min(radius, 16 * Math.max(scaleX, scaleY)));

            ctx.beginPath();
            if (rect.config.roundedCorners && ctx.roundRect) {
                ctx.roundRect(x, y, w, h, clampedRadius);
            } else {
                ctx.rect(x, y, w, h);
            }
            ctx.fill();

            // 경계선 그리기
            if (rect.config.showBorder) {
                ctx.strokeStyle = rect.borderColor;
                ctx.lineWidth = rect.config.borderWidth * Math.max(scaleX, scaleY);
                ctx.stroke();
            }

            // 자식 사각형들도 그리기
            for (let child of rect.children) {
                drawRectScaled(child);
            }
        };

        for (let r of rectsRef.current) {
            drawRectScaled(r);
        }

        // 현재 날짜/시간으로 파일명 생성
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `mondrian-4k-square-${timestamp}.png`;

        // Canvas를 Blob으로 변환하여 다운로드
        offscreenCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    };

    // Drawer state for mobile
    const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerExpanded(!isDrawerExpanded);
    };

    return (
        <>
            <div className="simulation-area">
                <div className="phone-frame">
                    <canvas ref={canvasRef} style={{ backgroundColor: config.bgColor }} />
                </div>
            </div>

            <div className={`controls-sidebar ${isDrawerExpanded ? 'expanded' : ''}`}>
                {/* Drawer Handle (mobile only) */}
                <div className="drawer-handle" onClick={toggleDrawer}></div>

                {/* Drawer Header */}
                <div className="drawer-header" onClick={toggleDrawer}>
                    <h1 className="drawer-title">
                        Rect Gen v2
                    </h1>
                    <div className="drawer-toggle">
                        ▼
                    </div>
                </div>

                {/* Controls Content */}
                <div className="controls-content">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => updateConfig('isRunning', !config.isRunning)}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${config.isRunning ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}
                        >
                            {config.isRunning ? <><lucide-pause size={18} /> Run</> : <><lucide-play size={18} /> Pause</>}
                        </button>

                        <button
                            onClick={initSimulation}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all bg-slate-700 hover:bg-slate-600 text-white hover:bg-red-500/20 hover:text-red-400"
                        >
                            <lucide-rotate-ccw size={18} /> Reset App
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Background Color */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-400">Background</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500">{config.bgColor}</span>
                                <input
                                    type="color"
                                    value={config.bgColor}
                                    onChange={(e) => updateConfig('bgColor', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Color Palette Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-slate-400">Palette</label>
                                <label className="cursor-pointer text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-blue-300">
                                    <lucide-image size={12} /> Extract form Img
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>

                            {/* Theme Buttons */}
                            <div className="grid grid-cols-6 gap-2 mb-3">
                                {Object.keys(themes).map(theme => (
                                    <button
                                        key={theme}
                                        onClick={() => {
                                            setConfig(prev => ({ ...prev, colorTheme: theme }));
                                            setTimeout(initSimulation, 50);
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${config.colorTheme === theme ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        style={{ background: themes[theme][0] }}
                                        title={theme}
                                    />
                                ))}
                            </div>

                            {/* Custom Palette Editor (Visible when Custom is selected) */}
                            {config.colorTheme === 'custom' && (
                                <div className="bg-slate-800/50 p-2 rounded-lg flex gap-2 justify-between">
                                    {themes.custom.map((col, idx) => (
                                        <input
                                            key={idx}
                                            type="color"
                                            value={col}
                                            onChange={(e) => updateCustomThemeColor(idx, e.target.value)}
                                            className="w-8 h-8 rounded-full cursor-pointer"
                                            title={`Change color ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Virtual Lines */}
                        <ControlSlider
                            label="Virtual Lines"
                            value={config.lineCount}
                            min={0} max={20} step={1}
                            onChange={(v) => updateConfig('lineCount', parseInt(v))}
                            subtext={config.lineCount === 0 ? "Disabled" : `${config.lineCount} lines (Walls)`}
                        />

                        {/* Standard Controls */}
                        <ControlSlider
                            label="Growth Speed"
                            value={config.speed}
                            min={1} max={10} step={0.5}
                            onChange={(v) => updateConfig('speed', parseFloat(v))}
                        />

                        <ControlSlider
                            label="Max Active Items"
                            value={config.maxActiveRects}
                            min={1} max={20} step={1}
                            onChange={(v) => updateConfig('maxActiveRects', parseInt(v))}
                        />

                        <ControlSlider
                            label="Recursion Depth"
                            value={config.maxDepth}
                            min={0} max={3} step={1}
                            onChange={(v) => updateConfig('maxDepth', parseInt(v))}
                        />

                        {/* Border Controls */}
                        <div className="pt-4 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-300">Border</span>
                                <button
                                    onClick={() => updateConfig('showBorder', !config.showBorder)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${config.showBorder ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                >
                                    {config.showBorder ? <>✓ ON</> : <>OFF</>}
                                </button>
                            </div>

                            {config.showBorder && (
                                <>
                                    <ControlSlider
                                        label="Border Width"
                                        value={config.borderWidth}
                                        min={1} max={10} step={0.5}
                                        onChange={(v) => updateConfig('borderWidth', parseFloat(v))}
                                    />

                                    <div className="flex items-center justify-between mt-3">
                                        <label className="text-sm text-slate-300 font-medium">Random Color</label>
                                        <button
                                            onClick={() => updateConfig('randomBorderColor', !config.randomBorderColor)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${config.randomBorderColor ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                        >
                                            {config.randomBorderColor ? <>✓ ON</> : <>OFF</>}
                                        </button>
                                    </div>

                                    {!config.randomBorderColor && (
                                        <div className="flex items-center justify-between mt-3">
                                            <label className="text-sm text-slate-300 font-medium">Border Color</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-500">{config.borderColor}</span>
                                                <input
                                                    type="color"
                                                    value={config.borderColor}
                                                    onChange={(e) => updateConfig('borderColor', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Rounded Corners Toggle */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                            <span className="text-sm font-medium text-slate-300">Rounded Corners</span>
                            <button
                                onClick={() => updateConfig('roundedCorners', !config.roundedCorners)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${config.roundedCorners ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                            >
                                {config.roundedCorners ? <>✓ Rounded</> : <>◻ Sharp</>}
                            </button>
                        </div>



                        {/* 4K Download & Reset Buttons */}
                        <div className="pt-4 border-t border-slate-700 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={downloadScreenshot}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                    <lucide-camera size={18} /> 4K Full download
                                </button>
                                <button
                                    onClick={downloadScreenshotSquare}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                    <lucide-square size={18} /> 4K Square download
                                </button>
                            </div>

                        </div>
                    </div>
                </div> {/* End controls-content */}
            </div> {/* End controls-sidebar */}
        </>
    );
};

const ControlSlider = ({ label, value, min, max, step, onChange, subtext }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-end">
            <label className="text-sm text-slate-300 font-medium">{label}</label>
            <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{value}</span>
        </div>
        <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {subtext && <p className="text-[10px] text-slate-500">{subtext}</p>}
    </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
