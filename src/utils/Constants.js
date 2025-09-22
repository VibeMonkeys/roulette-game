/**
 * 게임 상수 정의
 */
export const SYMBOLS = ['7', '🍒', '🍋', '⭐', '💎', '🔔', '❌'];

export const PRIZE_CONFIG = {
    '💎': { 
        rate: 0.01, 
        name: 'DIAMOND JACKPOT!', 
        message: '💎 다이아몬드 당첨! 💎',
        class: 'diamond'
    },
    '⭐': { 
        rate: 0.02, 
        name: 'STAR PRIZE!', 
        message: '⭐ 별 당첨! ⭐',
        class: 'star'
    },
    '🔔': { 
        rate: 0.03, 
        name: 'BELL PRIZE!', 
        message: '🔔 벨 당첨! 🔔',
        class: 'bell'
    },
    '7': { 
        rate: 0.04, 
        name: 'LUCKY SEVEN!', 
        message: '🍀 럭키 세븐! 🍀',
        class: 'seven'
    }
};

export const GAME_CONFIG = {
    REEL_COUNT: 3,
    SYMBOL_HEIGHT: 50,
    SPIN_DURATION_BASE: 30,        // 더 많은 회전
    SPIN_DURATION_INCREMENT: 15,   // 릴별 차이 증가
    ANIMATION_DELAY_MIN: 20,       // 더 빠른 시작
    ANIMATION_DELAY_MAX: 120,      // 더 부드러운 감속
    ANIMATION_EASE_FACTOR: 0.15,   // 감속 계수
    RESULT_DISPLAY_DELAY: 3000,
    STORAGE_KEY: 'retroSlotGame'
};

export const MESSAGES = {
    INITIAL: '🎯 한 번의 기회로 행운을 잡아보세요!',
    SPINNING: '🎰 릴이 돌아가고 있습니다...',
    WIN_CELEBRATION: '🎉 축하합니다! 당첨되셨습니다! 🎉',
    LOSE: '😢 아쉽지만 다음 기회를 기다려주세요!',
    GAME_COMPLETE: '🎮 게임이 완료되었습니다. 참여해주셔서 감사합니다!',
    ALREADY_PLAYED: '🚫 이미 게임에 참여하셨습니다.',
    LOSE_RESULT: '아쉽네요! 다음 기회에~',
    LOSE_INFO: '꽝! 하지만 참여해주셔서 감사합니다!'
};

export const CSS_CLASSES = {
    WIN_LINE_ACTIVE: 'active',
    BUTTON_SPINNING: 'spinning',
    RESULT_WIN: 'win',
    RESULT_LOSE: 'lose',
    MODAL_VISIBLE: 'visible'
};

export const EVENTS = {
    SPIN_BUTTON_CLICK: 'spin',
    KEYBOARD_SPACE: 'Space',
    GAME_STATE_CHANGE: 'gameStateChange',
    ANIMATION_COMPLETE: 'animationComplete'
};