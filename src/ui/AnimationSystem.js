/**
 * 애니메이션 시스템
 */
import { delay } from '../utils/Helpers.js';
import { GAME_CONFIG, SYMBOLS } from '../utils/Constants.js';

export class AnimationSystem {
    constructor(uiManager) {
        this.ui = uiManager;
        this.isAnimating = false;
    }

    /**
     * 릴 애니메이션 메인 로직
     */
    async animateReels(result) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const animationPromises = [];

        // 각 릴을 순차적으로 애니메이션
        this.ui.elements.reels.forEach((reel, index) => {
            if (reel) {
                animationPromises.push(
                    this.animateReel(reel, result.symbols[index], index)
                );
            }
        });

        // 모든 릴 애니메이션 완료까지 대기
        await Promise.all(animationPromises);
        
        this.isAnimating = false;
    }

    /**
     * 개별 릴 애니메이션
     */
    async animateReel(reel, finalSymbol, reelIndex) {
        const spins = GAME_CONFIG.SPIN_DURATION_BASE + reelIndex * GAME_CONFIG.SPIN_DURATION_INCREMENT;
        let currentSpin = 0;
        
        return new Promise((resolve) => {
            const animate = async () => {
                if (currentSpin < spins) {
                    // 랜덤 심볼로 빠르게 회전
                    const randomSymbol = this.getRandomSymbol();
                    this.updateReelPosition(reel, randomSymbol);
                    currentSpin++;
                    
                    // 부드러운 감속 곡선 (easeOut)
                    const progress = currentSpin / spins;
                    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                    
                    const animationDelay = GAME_CONFIG.ANIMATION_DELAY_MIN + 
                        (GAME_CONFIG.ANIMATION_DELAY_MAX - GAME_CONFIG.ANIMATION_DELAY_MIN) * easeOutProgress;
                    
                    setTimeout(animate, animationDelay);
                } else {
                    // 최종 심볼로 부드럽게 정지
                    await this.smoothStopReel(reel, finalSymbol);
                    
                    // 마지막 릴이면 정지 효과 추가
                    if (reelIndex === GAME_CONFIG.REEL_COUNT - 1) {
                        await delay(200);
                        this.ui.playStopEffect();
                        await delay(100);
                    }
                    
                    resolve();
                }
            };
            
            animate();
        });
    }

    /**
     * 릴 위치 업데이트
     */
    updateReelPosition(reel, symbol) {
        const symbolIndex = SYMBOLS.indexOf(symbol);
        if (symbolIndex !== -1) {
            const offset = -symbolIndex * GAME_CONFIG.SYMBOL_HEIGHT;
            reel.style.transform = `translateY(${offset}px)`;
        }
    }

    /**
     * 부드러운 릴 정지 애니메이션
     */
    async smoothStopReel(reel, finalSymbol) {
        // 몇 개의 심볼을 더 돌린 후 최종 심볼에 정착
        const extraSpins = 3;
        const symbols = [...SYMBOLS];
        const finalIndex = symbols.indexOf(finalSymbol);
        
        for (let i = 0; i < extraSpins; i++) {
            const tempSymbol = symbols[(finalIndex + symbols.length - extraSpins + i) % symbols.length];
            this.updateReelPosition(reel, tempSymbol);
            await delay(80 + i * 20); // 점진적으로 느려짐
        }
        
        // 최종 위치로 부드럽게 이동
        this.updateReelPosition(reel, finalSymbol);
        await delay(50);
    }

    /**
     * 랜덤 심볼 선택
     */
    getRandomSymbol() {
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    /**
     * 스핀 시작 애니메이션
     */
    async startSpinAnimation() {
        // 결과 영역 초기화
        this.ui.clearResult();
        
        // 당첨 라인 숨기기
        this.ui.showWinLine(false);
        
        // 스핀 버튼 상태 변경
        this.ui.updateSpinButton('spinning');
        
        // 짧은 딜레이 후 애니메이션 시작 표시
        await delay(100);
    }

    /**
     * 결과 표시 애니메이션
     */
    async showResultAnimation(result) {
        // 결과 표시
        this.ui.updateResult(result);
        
        if (result.isWin) {
            // 당첨 시 효과
            await this.playWinAnimation();
        }
        
        // 상태 업데이트를 위한 딜레이
        await delay(GAME_CONFIG.RESULT_DISPLAY_DELAY);
    }

    /**
     * 당첨 애니메이션
     */
    async playWinAnimation() {
        // 당첨 라인 표시
        this.ui.showWinLine(true);
        
        // 당첨 효과 재생
        this.ui.playWinEffect();
        
        // 릴 하이라이트 효과
        await this.highlightWinningReels();
    }

    /**
     * 당첨 릴 하이라이트 효과
     */
    async highlightWinningReels() {
        const reels = this.ui.elements.reels;
        
        // 모든 릴에 하이라이트 효과
        const highlightPromises = Array.from(reels).map((reel, index) => {
            if (!reel) return Promise.resolve();
            
            return this.addHighlightEffect(reel, index * 100);
        });
        
        await Promise.all(highlightPromises);
    }

    /**
     * 개별 릴 하이라이트 효과
     */
    async addHighlightEffect(reel, delayMs = 0) {
        await delay(delayMs);
        
        return new Promise((resolve) => {
            reel.style.transition = 'all 0.3s ease';
            reel.style.boxShadow = '0 0 20px #00ff00, inset 0 0 20px rgba(0, 255, 0, 0.2)';
            reel.style.borderColor = '#00ff00';
            
            setTimeout(() => {
                reel.style.boxShadow = '';
                reel.style.borderColor = '';
                reel.style.transition = '';
                resolve();
            }, 1000);
        });
    }

    /**
     * 펄스 효과
     */
    async addPulseEffect(element, duration = 1000, intensity = 1.1) {
        if (!element) return;
        
        return new Promise((resolve) => {
            const originalTransform = element.style.transform || '';
            element.style.transition = `transform ${duration / 4}ms ease-in-out`;
            
            let pulseCount = 0;
            const maxPulses = 3;
            
            const pulse = () => {
                if (pulseCount >= maxPulses) {
                    element.style.transform = originalTransform;
                    element.style.transition = '';
                    resolve();
                    return;
                }
                
                element.style.transform = `${originalTransform} scale(${intensity})`;
                
                setTimeout(() => {
                    element.style.transform = originalTransform;
                    pulseCount++;
                    
                    setTimeout(pulse, duration / 4);
                }, duration / 4);
            };
            
            pulse();
        });
    }

    /**
     * 글로우 효과
     */
    async addGlowEffect(element, color = '#00ff00', duration = 2000) {
        if (!element) return;
        
        return new Promise((resolve) => {
            const originalBoxShadow = element.style.boxShadow;
            element.style.transition = `box-shadow ${duration / 4}ms ease-in-out`;
            element.style.boxShadow = `0 0 30px ${color}, inset 0 0 20px rgba(0, 255, 0, 0.1)`;
            
            setTimeout(() => {
                element.style.boxShadow = originalBoxShadow;
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * 흔들기 효과
     */
    async addShakeEffect(element, intensity = 5, duration = 500) {
        if (!element) return;
        
        return new Promise((resolve) => {
            const originalTransform = element.style.transform || '';
            let startTime = null;
            
            const shake = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                
                if (elapsed < duration) {
                    const offsetX = (Math.random() - 0.5) * intensity * 2;
                    const offsetY = (Math.random() - 0.5) * intensity * 2;
                    element.style.transform = `${originalTransform} translate(${offsetX}px, ${offsetY}px)`;
                    
                    requestAnimationFrame(shake);
                } else {
                    element.style.transform = originalTransform;
                    resolve();
                }
            };
            
            requestAnimationFrame(shake);
        });
    }

    /**
     * 애니메이션 상태 확인
     */
    isPlaying() {
        return this.isAnimating;
    }

    /**
     * 모든 애니메이션 중지
     */
    stopAll() {
        this.isAnimating = false;
        
        // 모든 릴의 애니메이션 중지
        this.ui.elements.reels.forEach(reel => {
            if (reel) {
                reel.style.transition = '';
                reel.style.animation = '';
                reel.style.boxShadow = '';
                reel.style.borderColor = '';
            }
        });
    }
}