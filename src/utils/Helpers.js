/**
 * 유틸리티 헬퍼 함수들
 */

/**
 * 배열에서 랜덤 요소 선택
 */
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 지연 함수 (Promise 기반)
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * DOM 요소 안전 선택
 */
export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

/**
 * 요소들 안전 선택
 */
export function getElements(selector) {
    return document.querySelectorAll(selector);
}

/**
 * CSS 클래스 토글
 */
export function toggleClass(element, className, force = null) {
    if (!element) return;
    
    if (force !== null) {
        element.classList.toggle(className, force);
    } else {
        element.classList.toggle(className);
    }
}

/**
 * CSS 클래스 추가
 */
export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

/**
 * CSS 클래스 제거
 */
export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

/**
 * 요소의 텍스트 안전 설정
 */
export function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * 요소의 HTML 안전 설정
 */
export function setHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * 이벤트 리스너 안전 추가
 */
export function addEventListener(element, event, handler, options = {}) {
    if (element && event && handler) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    }
    return () => {};
}

/**
 * 확률 계산 (0~1 범위)
 */
export function calculateProbability(rate) {
    return Math.random() < rate;
}

/**
 * 범위 내 랜덤 정수
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 배열 셔플 (Fisher-Yates 알고리즘)
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 객체 깊은 복사
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }
}

/**
 * 디바운스 함수
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 쓰로틀 함수
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}