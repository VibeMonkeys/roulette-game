/**
 * 슬롯머신 게임 엔진 - 핵심 로직 담당
 */
import { GameState } from './GameState.js';
import { UIManager } from '../ui/UIManager.js';
import { AnimationSystem } from '../ui/AnimationSystem.js';
import { ProbabilitySystem } from '../systems/ProbabilitySystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { addEventListener } from '../utils/Helpers.js';
import { MESSAGES, EVENTS } from '../utils/Constants.js';

export class SlotMachineEngine {
    constructor() {
        this.gameState = new GameState();
        this.uiManager = new UIManager();
        this.animationSystem = new AnimationSystem(this.uiManager);
        this.probabilitySystem = new ProbabilitySystem();
        this.saveSystem = new SaveSystem();
        
        this.eventHandlers = [];
        this.isInitialized = false;
        
        this.setupEventListeners();
    }

    /**
     * 게임 초기화
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // 저장된 게임 데이터 로드
            const savedData = this.saveSystem.loadGame();
            
            // 게임 상태 초기화
            this.gameState.initialize(savedData);
            
            // 초기 UI 설정
            await this.setupInitialUI();
            
            // 테스트용: 1회 제한 비활성화
            // if (this.gameState.get('hasPlayed')) {
            //     this.handleAlreadyPlayed();
            // } else {
                this.setupNewGame();
            // }
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('게임 초기화 실패:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 스핀 버튼 클릭
        if (this.uiManager.elements.spinBtn) {
            console.log('🎰 Setting up spin button click listener');
            this.eventHandlers.push(
                addEventListener(this.uiManager.elements.spinBtn, 'click', () => {
                    console.log('🎰 Spin button clicked!');
                    this.handleSpin();
                })
            );
        } else {
            console.error('❌ Spin button not found!');
        }

        // 키보드 이벤트 (스페이스바)
        this.eventHandlers.push(
            addEventListener(document, 'keydown', (e) => {
                if (e.code === EVENTS.KEYBOARD_SPACE && this.gameState.canPlay()) {
                    e.preventDefault();
                    this.handleSpin();
                }
            })
        );

        // 모달 닫기 버튼
        if (this.uiManager.elements.modalClose) {
            this.eventHandlers.push(
                addEventListener(this.uiManager.elements.modalClose, 'click', () => {
                    this.uiManager.hideModal();
                })
            );
        }

        // 게임 상태 변경 이벤트
        this.gameState.addEventListener('spinStarted', (state) => {
            this.uiManager.updateGameStatus(MESSAGES.SPINNING);
        });

        this.gameState.addEventListener('spinCompleted', (data) => {
            this.handleSpinComplete(data.result);
        });
    }

    /**
     * 초기 UI 설정
     */
    async setupInitialUI() {
        // 초기 릴 심볼 설정
        const currentSymbols = this.gameState.get('currentSymbols');
        currentSymbols.forEach((symbol, index) => {
            this.uiManager.updateReelDisplay(index, symbol);
        });

        // 초기 상태 메시지
        this.uiManager.updateGameStatus(MESSAGES.INITIAL);
        
        // 스핀 버튼 초기화
        this.uiManager.updateSpinButton('ready');
    }

    /**
     * 새 게임 설정
     */
    setupNewGame() {
        // 초기 릴 위치를 고정값으로 설정 (7, 🍒, 🍋)
        const initialSymbols = ['7', '🍒', '🍋'];
        
        initialSymbols.forEach((symbol, index) => {
            this.uiManager.updateReelDisplay(index, symbol);
        });
        
        this.gameState.updateState({ currentSymbols: initialSymbols });
    }

    /**
     * 이미 플레이한 경우 처리
     */
    handleAlreadyPlayed() {
        this.uiManager.showModal();
        this.uiManager.updateSpinButton('played');
        this.uiManager.updateGameStatus(MESSAGES.ALREADY_PLAYED);
        
        // 이전 결과가 있다면 표시
        const lastResult = this.gameState.get('lastResult');
        if (lastResult) {
            this.uiManager.showPreviousResult(lastResult.prize?.message || 'Previous game result');
        }
    }

    /**
     * 스핀 처리
     */
    async handleSpin() {
        console.log('🎰 handleSpin called!');
        
        if (!this.gameState.canPlay()) {
            console.warn('Cannot play: Game state does not allow playing');
            return;
        }

        try {
            // 스핀 시작
            const spinStarted = this.gameState.startSpin();
            if (!spinStarted) {
                console.warn('Failed to start spin');
                return;
            }

            // 결과 미리 결정
            const result = this.probabilitySystem.determineResult();
            
            // 스핀 애니메이션 시작
            await this.animationSystem.startSpinAnimation();
            
            // 릴 애니메이션 실행
            await this.animationSystem.animateReels(result);
            
            // 게임 상태 업데이트 (스핀 완료)
            this.gameState.completeSpin(result);
            
        } catch (error) {
            console.error('스핀 처리 중 오류:', error);
            this.handleSpinError(error);
        }
    }

    /**
     * 스핀 완료 처리
     */
    async handleSpinComplete(result) {
        try {
            // 결과 애니메이션 표시
            await this.animationSystem.showResultAnimation(result);
            
            // 게임 데이터 저장
            this.saveGameData(result);
            
            // 게임 완료 처리
            this.completeGame();
            
        } catch (error) {
            console.error('스핀 완료 처리 중 오류:', error);
        }
    }

    /**
     * 게임 데이터 저장
     */
    saveGameData(result) {
        const gameData = this.gameState.serialize();
        const saved = this.saveSystem.saveGame(gameData);
        
        if (!saved) {
            console.warn('게임 데이터 저장 실패');
        }
    }

    /**
     * 게임 완료 처리 (테스트용: 버튼 재활성화)
     */
    completeGame() {
        // 테스트용: 버튼을 다시 활성화
        setTimeout(() => {
            this.uiManager.updateSpinButton('ready');
            this.uiManager.updateGameStatus(MESSAGES.INITIAL);
        }, 3000);
        
        // // 원래 코드 (1회 제한용)
        // this.uiManager.updateSpinButton('played');
        // setTimeout(() => {
        //     this.uiManager.updateGameStatus(MESSAGES.GAME_COMPLETE);
        // }, 3000);
    }

    /**
     * 게임 리셋 (개발자용)
     */
    resetGame() {
        try {
            // 저장된 데이터 삭제
            this.saveSystem.clearGame();
            
            // 게임 상태 리셋
            this.gameState.reset();
            
            // 페이지 새로고침
            window.location.reload();
            
        } catch (error) {
            console.error('게임 리셋 실패:', error);
        }
    }

    /**
     * 초기화 오류 처리
     */
    handleInitializationError(error) {
        console.error('Initialization failed:', error);
        
        // 사용자에게 오류 알림
        this.uiManager.updateGameStatus('⚠️ 게임 로딩 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        
        // 스핀 버튼 비활성화
        this.uiManager.updateSpinButton('played');
    }

    /**
     * 스핀 오류 처리
     */
    handleSpinError(error) {
        console.error('Spin failed:', error);
        
        // 게임 상태 복구
        this.gameState.updateState({ isSpinning: false });
        this.uiManager.updateSpinButton('ready');
        this.uiManager.updateGameStatus('⚠️ 오류가 발생했습니다. 다시 시도해주세요.');
        
        // 애니메이션 중지
        this.animationSystem.stopAll();
    }

    /**
     * 게임 통계 가져오기
     */
    getStats() {
        return {
            gameState: this.gameState.getStats(),
            probability: this.probabilitySystem.getProbabilityInfo(),
            session: this.gameState.getSessionInfo()
        };
    }

    /**
     * 시뮬레이션 실행 (개발자용)
     */
    runSimulation(iterations = 10000) {
        return this.probabilitySystem.simulate(iterations);
    }

    /**
     * 리소스 정리
     */
    dispose() {
        // 이벤트 핸들러 제거
        this.eventHandlers.forEach(removeHandler => removeHandler());
        this.eventHandlers = [];
        
        // 애니메이션 중지
        this.animationSystem.stopAll();
        
        this.isInitialized = false;
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        console.group('🎰 SlotMachine Engine Debug');
        this.gameState.debug();
        console.log('Stats:', this.getStats());
        console.log('UI Elements:', this.uiManager.elements);
        console.groupEnd();
    }
}