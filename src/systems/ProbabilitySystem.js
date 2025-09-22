/**
 * 확률 및 당첨 결과 계산 시스템
 */
import { SYMBOLS, PRIZE_CONFIG } from '../utils/Constants.js';
import { getRandomElement } from '../utils/Helpers.js';

export class ProbabilitySystem {
    constructor() {
        this.symbols = SYMBOLS;
        this.prizeConfig = PRIZE_CONFIG;
    }

    /**
     * 게임 결과 결정 (메인 로직)
     */
    determineResult() {
        const random = Math.random();
        let cumulativeRate = 0;

        // 당첨 확률에 따라 결과 결정
        for (const [symbol, config] of Object.entries(this.prizeConfig)) {
            cumulativeRate += config.rate;
            if (random < cumulativeRate) {
                return this.createWinResult(symbol, config);
            }
        }

        // 꽝인 경우
        return this.createLoseResult();
    }

    /**
     * 당첨 결과 생성
     */
    createWinResult(symbol, config) {
        return {
            isWin: true,
            symbols: [symbol, symbol, symbol],
            prize: {
                ...config,
                symbol: symbol
            },
            winType: 'match3',
            multiplier: this.getMultiplier(config.rate)
        };
    }

    /**
     * 꽝 결과 생성
     */
    createLoseResult() {
        return {
            isWin: false,
            symbols: this.generateLosingCombination(),
            prize: null,
            winType: null,
            multiplier: 0
        };
    }

    /**
     * 꽝 조합 생성 (3개가 모두 같지 않도록)
     */
    generateLosingCombination() {
        const symbols = [];
        
        // 첫 번째 심볼 선택
        symbols[0] = getRandomElement(this.symbols);
        
        // 두 번째 심볼 (50% 확률로 첫 번째와 같게)
        if (Math.random() < 0.5) {
            symbols[1] = symbols[0];
        } else {
            symbols[1] = getRandomElement(this.symbols);
        }
        
        // 세 번째 심볼 (3개가 모두 같지 않도록)
        do {
            symbols[2] = getRandomElement(this.symbols);
        } while (symbols[0] === symbols[1] && symbols[1] === symbols[2]);
        
        return symbols;
    }

    /**
     * 확률에 따른 배수 계산
     */
    getMultiplier(rate) {
        if (rate <= 0.01) return 100;      // 1% = 100배
        if (rate <= 0.02) return 50;       // 2% = 50배  
        if (rate <= 0.03) return 33;       // 3% = 33배
        if (rate <= 0.04) return 25;       // 4% = 25배
        return 1;
    }

    /**
     * 랜덤 심볼 선택
     */
    getRandomSymbol() {
        return getRandomElement(this.symbols);
    }

    /**
     * 심볼이 당첨 심볼인지 확인
     */
    isWinningSymbol(symbol) {
        return symbol in this.prizeConfig;
    }

    /**
     * 조합이 당첨인지 확인
     */
    isWinningCombination(symbols) {
        if (symbols.length !== 3) return false;
        
        // 모든 심볼이 같고, 당첨 심볼인 경우
        return symbols[0] === symbols[1] && 
               symbols[1] === symbols[2] && 
               this.isWinningSymbol(symbols[0]);
    }

    /**
     * 전체 당첨 확률 계산
     */
    getTotalWinRate() {
        return Object.values(this.prizeConfig)
            .reduce((total, config) => total + config.rate, 0);
    }

    /**
     * 확률 정보 반환
     */
    getProbabilityInfo() {
        const info = {};
        
        for (const [symbol, config] of Object.entries(this.prizeConfig)) {
            info[symbol] = {
                symbol,
                name: config.name,
                rate: config.rate,
                percentage: (config.rate * 100).toFixed(1) + '%',
                multiplier: this.getMultiplier(config.rate)
            };
        }
        
        info.totalWinRate = this.getTotalWinRate();
        info.loseRate = 1 - info.totalWinRate;
        info.losePercentage = (info.loseRate * 100).toFixed(1) + '%';
        
        return info;
    }

    /**
     * 테스트용 시뮬레이션 (개발자용)
     */
    simulate(iterations = 10000) {
        const results = {
            wins: 0,
            losses: 0,
            bySymbol: {}
        };
        
        // 각 당첨 심볼별 카운터 초기화
        for (const symbol of Object.keys(this.prizeConfig)) {
            results.bySymbol[symbol] = 0;
        }
        
        for (let i = 0; i < iterations; i++) {
            const result = this.determineResult();
            
            if (result.isWin) {
                results.wins++;
                results.bySymbol[result.symbols[0]]++;
            } else {
                results.losses++;
            }
        }
        
        // 결과 정리
        results.winRate = results.wins / iterations;
        results.loseRate = results.losses / iterations;
        
        return results;
    }
}