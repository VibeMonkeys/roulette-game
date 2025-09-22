/**
 * UI 관리 시스템
 */
import { getElement, setText, setHTML, addClass, removeClass, toggleClass } from '../utils/Helpers.js';
import { CSS_CLASSES, MESSAGES } from '../utils/Constants.js';

export class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventHandlers();
    }

    /**
     * DOM 요소들 초기화
     */
    initializeElements() {
        return {
            // 게임 영역
            spinBtn: getElement('spinBtn'),
            spinText: null, // spinBtn 내부에서 찾음
            
            // 릴 관련
            reels: document.querySelectorAll('.reel'),
            winLine: document.querySelector('.win-line'),
            
            // 결과 표시
            resultArea: getElement('resultArea'),
            resultMessage: getElement('resultMessage'),
            prizeInfo: getElement('prizeInfo'),
            
            // 상태 표시
            gameStatus: getElement('gameStatus'),
            
            // 모달
            modal: getElement('gameOverModal'),
            modalClose: document.querySelector('.modal-close')
        };
    }

    /**
     * 이벤트 핸들러 설정
     */
    setupEventHandlers() {
        // 스핀 버튼 텍스트 요소 찾기
        if (this.elements.spinBtn) {
            this.elements.spinText = this.elements.spinBtn.querySelector('.spin-text');
        }

        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.modal) {
                this.hideModal();
            }
        });
    }

    /**
     * 스핀 버튼 상태 업데이트
     */
    updateSpinButton(state) {
        if (!this.elements.spinBtn || !this.elements.spinText) return;

        const { spinBtn, spinText } = this.elements;
        
        switch (state) {
            case 'ready':
                spinBtn.disabled = false;
                removeClass(spinBtn, CSS_CLASSES.BUTTON_SPINNING);
                setText(spinText, 'SPIN');
                break;
                
            case 'spinning':
                spinBtn.disabled = true;
                addClass(spinBtn, CSS_CLASSES.BUTTON_SPINNING);
                setText(spinText, 'SPINNING...');
                break;
                
            case 'played':
                spinBtn.disabled = true;
                removeClass(spinBtn, CSS_CLASSES.BUTTON_SPINNING);
                setText(spinText, 'PLAYED');
                break;
        }
    }

    /**
     * 릴 표시 업데이트
     */
    updateReelDisplay(reelIndex, symbol) {
        if (!this.elements.reels[reelIndex]) return;
        
        const reel = this.elements.reels[reelIndex];
        const symbols = ['7', '🍒', '🍋', '⭐', '💎', '🔔', '❌'];
        const targetIndex = symbols.indexOf(symbol);
        
        if (targetIndex !== -1) {
            const offset = -targetIndex * 50; // 각 심볼의 높이가 50px
            reel.style.transform = `translateY(${offset}px)`;
        }
    }

    /**
     * 결과 표시 업데이트
     */
    updateResult(result) {
        if (!this.elements.resultMessage || !this.elements.prizeInfo) return;

        const { resultMessage, prizeInfo } = this.elements;

        if (result.isWin) {
            setText(resultMessage, result.prize.message);
            addClass(resultMessage, CSS_CLASSES.RESULT_WIN);
            removeClass(resultMessage, CSS_CLASSES.RESULT_LOSE);
            setText(prizeInfo, `축하합니다! ${result.prize.name}`);
        } else {
            setText(resultMessage, MESSAGES.LOSE_RESULT);
            addClass(resultMessage, CSS_CLASSES.RESULT_LOSE);
            removeClass(resultMessage, CSS_CLASSES.RESULT_WIN);
            setText(prizeInfo, MESSAGES.LOSE_INFO);
        }
    }

    /**
     * 당첨 라인 표시
     */
    showWinLine(show = true) {
        if (!this.elements.winLine) return;
        
        toggleClass(this.elements.winLine, CSS_CLASSES.WIN_LINE_ACTIVE, show);
    }

    /**
     * 게임 상태 메시지 업데이트
     */
    updateGameStatus(message) {
        if (!this.elements.gameStatus) return;
        
        setHTML(this.elements.gameStatus, `<p>${message}</p>`);
    }

    /**
     * 결과 영역 초기화
     */
    clearResult() {
        if (!this.elements.resultArea) return;
        
        setHTML(this.elements.resultArea, '');
    }

    /**
     * 모달 표시
     */
    showModal() {
        if (!this.elements.modal) return;
        
        this.elements.modal.style.display = 'block';
    }

    /**
     * 모달 숨기기
     */
    hideModal() {
        if (!this.elements.modal) return;
        
        this.elements.modal.style.display = 'none';
    }

    /**
     * 당첨 효과 표시
     */
    playWinEffect() {
        const slotMachine = document.querySelector('.slot-machine');
        if (!slotMachine) return;
        
        slotMachine.style.animation = 'winCelebration 2s ease-in-out';
        
        setTimeout(() => {
            slotMachine.style.animation = '';
        }, 2000);
    }

    /**
     * 릴 정지 효과
     */
    playStopEffect() {
        this.elements.reels.forEach(reel => {
            if (!reel) return;
            
            const currentTransform = reel.style.transform || '';
            reel.style.transform = currentTransform + ' scale(1.05)';
            
            setTimeout(() => {
                reel.style.transform = currentTransform;
            }, 200);
        });
    }

    /**
     * 이전 결과 표시 (모달용)
     */
    showPreviousResult(lastResult) {
        if (!lastResult || !this.elements.resultMessage || !this.elements.prizeInfo) return;
        
        const { resultMessage, prizeInfo } = this.elements;
        
        setText(resultMessage, lastResult);
        setText(prizeInfo, '이전 게임 결과입니다.');
    }

    /**
     * 요소 존재 여부 확인
     */
    hasElement(elementName) {
        return this.elements[elementName] && this.elements[elementName] !== null;
    }

    /**
     * 애니메이션 효과 추가
     */
    addAnimation(element, animationClass, duration = 1000) {
        if (!element) return Promise.resolve();
        
        return new Promise((resolve) => {
            addClass(element, animationClass);
            
            setTimeout(() => {
                removeClass(element, animationClass);
                resolve();
            }, duration);
        });
    }

    /**
     * 페이드 인/아웃 효과
     */
    fadeToggle(element, show = true, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise((resolve) => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = show ? '1' : '0';
            
            setTimeout(resolve, duration);
        });
    }
}