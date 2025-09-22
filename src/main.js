/**
 * 레트로 슬롯머신 게임 - 메인 엔트리 포인트
 * 
 * 모듈화된 구조로 게임을 초기화하고 실행합니다.
 */
import { SlotMachineEngine } from './core/SlotMachineEngine.js';

/**
 * 게임 애플리케이션 클래스
 */
class RetroSlotMachineApp {
    constructor() {
        this.engine = null;
        this.isInitialized = false;
    }

    /**
     * 애플리케이션 초기화 및 시작
     */
    async start() {
        try {
            console.log('🎰 Retro Slot Machine - Initializing...');
            
            // DOM이 준비될 때까지 대기
            await this.waitForDOM();
            
            // 게임 엔진 초기화
            this.engine = new SlotMachineEngine();
            await this.engine.initialize();
            
            // 개발자 도구용 전역 함수 등록
            this.registerDevTools();
            
            this.isInitialized = true;
            console.log('🎉 Game Ready! Enjoy playing!');
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * DOM 준비 대기
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * 개발자 도구 등록
     */
    registerDevTools() {
        if (typeof window !== 'undefined') {
            // 전역 접근 가능한 개발자 함수들
            window.slotMachine = {
                reset: () => {
                    if (this.engine) {
                        this.engine.resetGame();
                    }
                },
                debug: () => {
                    if (this.engine) {
                        this.engine.debug();
                    }
                },
                stats: () => {
                    return this.engine ? this.engine.getStats() : null;
                },
                simulate: (iterations = 1000) => {
                    return this.engine ? this.engine.runSimulation(iterations) : null;
                }
            };

            // 개발자 도구 안내
            console.log('🛠️ Developer tools: slotMachine.reset(), .debug(), .stats(), .simulate()');
        }
    }

    /**
     * 초기화 오류 처리
     */
    handleInitializationError(error) {
        // 사용자에게 친화적인 오류 메시지 표시
        const errorContainer = document.createElement('div');
        errorContainer.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #0a0a0a, #1a0033);
                color: #ff00ff;
                padding: 30px;
                border-radius: 20px;
                border: 2px solid #ff00ff;
                text-align: center;
                font-family: 'Orbitron', monospace;
                z-index: 9999;
                box-shadow: 0 0 30px #ff00ff;
            ">
                <h2>🎰 게임 로딩 오류</h2>
                <p>게임을 시작할 수 없습니다.</p>
                <p>페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
                <button onclick="window.location.reload()" style="
                    background: #00ffff;
                    color: #0a0a0a;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-family: 'Orbitron', monospace;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 15px;
                ">새로고침</button>
            </div>
        `;
        
        document.body.appendChild(errorContainer);
    }

    /**
     * 애플리케이션 종료
     */
    dispose() {
        if (this.engine) {
            this.engine.dispose();
            this.engine = null;
        }
        
        // 전역 개발자 도구 제거
        if (typeof window !== 'undefined' && window.slotMachine) {
            delete window.slotMachine;
        }
        
        this.isInitialized = false;
        console.log('🎰 Application disposed');
    }
}

/**
 * 애플리케이션 인스턴스 생성 및 시작
 */
const app = new RetroSlotMachineApp();

// 페이지 로드 시 자동 시작
app.start();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    app.dispose();
});

// 에러 발생 시 전역 핸들러
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});


export default app;