/**
 * 게임 저장/로드 시스템
 */
import { GAME_CONFIG } from '../utils/Constants.js';

export class SaveSystem {
    constructor() {
        this.storageKey = GAME_CONFIG.STORAGE_KEY;
    }

    /**
     * 게임 데이터 저장
     */
    saveGame(gameData) {
        try {
            const dataToSave = {
                ...gameData,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('게임 저장 실패:', error);
            return false;
        }
    }

    /**
     * 게임 데이터 로드
     */
    loadGame() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('게임 로드 실패:', error);
            return null;
        }
    }

    /**
     * 저장된 게임 데이터 존재 여부 확인
     */
    hasSavedGame() {
        return this.loadGame() !== null;
    }

    /**
     * 게임 데이터 삭제
     */
    clearGame() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('게임 데이터 삭제 실패:', error);
            return false;
        }
    }

    /**
     * 플레이 상태 저장
     */
    savePlayStatus(hasPlayed, lastResult = null) {
        const gameData = {
            hasPlayed,
            lastResult,
            playedAt: hasPlayed ? new Date().toISOString() : null
        };
        
        return this.saveGame(gameData);
    }

    /**
     * 플레이 상태 확인
     */
    getPlayStatus() {
        const data = this.loadGame();
        return {
            hasPlayed: data?.hasPlayed || false,
            lastResult: data?.lastResult || null,
            playedAt: data?.playedAt || null
        };
    }

    /**
     * 게임 통계 저장
     */
    saveGameStats(stats) {
        const data = this.loadGame() || {};
        data.stats = {
            ...data.stats,
            ...stats,
            updatedAt: new Date().toISOString()
        };
        
        return this.saveGame(data);
    }

    /**
     * 게임 통계 로드
     */
    getGameStats() {
        const data = this.loadGame();
        return data?.stats || {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            winRate: 0
        };
    }
}