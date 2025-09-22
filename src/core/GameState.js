/**
 * 게임 상태 관리 시스템
 */
import { MESSAGES } from '../utils/Constants.js';

export class GameState {
    constructor() {
        this.state = {
            // 게임 진행 상태
            hasPlayed: false,
            isSpinning: false,
            isInitialized: false,
            
            // 게임 결과
            lastResult: null,
            currentSymbols: ['7', '🍒', '🍋'], // 초기 심볼
            
            // 세션 정보
            sessionId: this.generateSessionId(),
            startTime: new Date(),
            
            // 통계
            stats: {
                gamesPlayed: 0,
                wins: 0,
                losses: 0
            }
        };
        
        this.listeners = new Map();
    }

    /**
     * 세션 ID 생성
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 상태 변경 이벤트 리스너 등록
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        // 제거 함수 반환
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }

    /**
     * 이벤트 발생
     */
    emit(event, data) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 상태 업데이트 (내부 메서드)
     */
    updateState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // 상태 변경 이벤트 발생
        this.emit('stateChange', {
            oldState,
            newState: this.state,
            changes: updates
        });
    }

    /**
     * 게임 초기화
     */
    initialize(savedData = null) {
        if (savedData) {
            this.updateState({
                hasPlayed: savedData.hasPlayed || false,
                lastResult: savedData.lastResult || null,
                stats: { ...this.state.stats, ...savedData.stats }
            });
        }
        
        this.updateState({ isInitialized: true });
        this.emit('gameInitialized', this.state);
    }

    /**
     * 스핀 시작
     */
    startSpin() {
        if (this.state.hasPlayed || this.state.isSpinning) {
            return false;
        }
        
        this.updateState({ isSpinning: true });
        this.emit('spinStarted', this.state);
        return true;
    }

    /**
     * 스핀 완료 및 결과 설정
     */
    completeSpin(result) {
        const newStats = { ...this.state.stats };
        newStats.gamesPlayed++;
        
        if (result.isWin) {
            newStats.wins++;
        } else {
            newStats.losses++;
        }

        this.updateState({
            isSpinning: false,
            hasPlayed: true,
            lastResult: result,
            currentSymbols: result.symbols,
            stats: newStats
        });
        
        this.emit('spinCompleted', {
            result,
            state: this.state
        });
    }

    /**
     * 게임 리셋 (개발자용)
     */
    reset() {
        this.updateState({
            hasPlayed: false,
            isSpinning: false,
            lastResult: null,
            currentSymbols: ['7', '🍒', '🍋'],
            stats: {
                gamesPlayed: 0,
                wins: 0,
                losses: 0
            }
        });
        
        this.emit('gameReset', this.state);
    }

    /**
     * 현재 상태 가져오기
     */
    getState() {
        return { ...this.state };
    }

    /**
     * 특정 상태 값 가져오기
     */
    get(key) {
        return this.state[key];
    }

    /**
     * 게임 플레이 가능 여부 확인 (테스트용: hasPlayed 체크 비활성화)
     */
    canPlay() {
        return !this.state.isSpinning && this.state.isInitialized;
        // return !this.state.hasPlayed && !this.state.isSpinning && this.state.isInitialized;
    }

    /**
     * 게임 완료 여부 확인
     */
    isGameComplete() {
        return this.state.hasPlayed;
    }

    /**
     * 스핀 진행 중 여부 확인
     */
    isSpinning() {
        return this.state.isSpinning;
    }

    /**
     * 게임 통계 가져오기
     */
    getStats() {
        const stats = { ...this.state.stats };
        
        // 승률 계산
        if (stats.gamesPlayed > 0) {
            stats.winRate = (stats.wins / stats.gamesPlayed * 100).toFixed(1);
            stats.lossRate = (stats.losses / stats.gamesPlayed * 100).toFixed(1);
        } else {
            stats.winRate = '0.0';
            stats.lossRate = '0.0';
        }
        
        return stats;
    }

    /**
     * 세션 정보 가져오기
     */
    getSessionInfo() {
        return {
            sessionId: this.state.sessionId,
            startTime: this.state.startTime,
            duration: Date.now() - this.state.startTime.getTime(),
            playTime: this.state.hasPlayed ? this.state.startTime : null
        };
    }

    /**
     * 상태를 저장 가능한 형태로 직렬화
     */
    serialize() {
        return {
            hasPlayed: this.state.hasPlayed,
            lastResult: this.state.lastResult,
            stats: this.state.stats,
            sessionInfo: this.getSessionInfo(),
            savedAt: new Date().toISOString()
        };
    }

    /**
     * 직렬화된 데이터에서 상태 복원
     */
    deserialize(data) {
        if (data && typeof data === 'object') {
            this.updateState({
                hasPlayed: data.hasPlayed || false,
                lastResult: data.lastResult || null,
                stats: { ...this.state.stats, ...data.stats }
            });
        }
    }

    /**
     * 상태 검증
     */
    validateState() {
        const issues = [];
        
        if (typeof this.state.hasPlayed !== 'boolean') {
            issues.push('hasPlayed must be boolean');
        }
        
        if (typeof this.state.isSpinning !== 'boolean') {
            issues.push('isSpinning must be boolean');
        }
        
        if (!Array.isArray(this.state.currentSymbols) || this.state.currentSymbols.length !== 3) {
            issues.push('currentSymbols must be array of length 3');
        }
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * 디버그 정보 출력
     */
    debug() {
        console.group('🎰 GameState Debug Info');
        console.log('Current State:', this.state);
        console.log('Session Info:', this.getSessionInfo());
        console.log('Stats:', this.getStats());
        console.log('Can Play:', this.canPlay());
        console.log('Validation:', this.validateState());
        console.groupEnd();
    }
}