/**
 * 휴넷 창립 26주년 기념 슬롯머신 게임
 */

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBM0jvvnSmQGwWAzSd5YSnsLMsQvsR20UI",
    authDomain: "roulette-game-bd714.firebaseapp.com",
    databaseURL: "https://roulette-game-bd714-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "roulette-game-bd714",
    storageBucket: "roulette-game-bd714.firebasestorage.app",
    messagingSenderId: "331298889269",
    appId: "1:331298889269:web:1c115708e1c7875edc5b7c"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 게임 로직
window.addEventListener('load', () => {
    const GAME_PLAYED_KEY = 'hunet26_game_played';

    // 게임 플레이 여부 확인
    function hasPlayedBefore() {
        return localStorage.getItem(GAME_PLAYED_KEY) === 'true';
    }

    // 게임 플레이 기록 저장
    function markAsPlayed() {
        localStorage.setItem(GAME_PLAYED_KEY, 'true');
        localStorage.setItem('hunet26_play_date', new Date().toISOString());
    }

    // 이미 플레이한 사용자 처리
    function showAlreadyPlayedMessage() {
        const spinBtn = document.getElementById('spinBtn');
        const resultMessage = document.getElementById('resultMessage');

        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.textContent = '❌ 이미 참여완료';
            spinBtn.style.opacity = '0.5';
            spinBtn.style.cursor = 'not-allowed';
        }

        if (resultMessage) {
            resultMessage.innerHTML = '이미 이벤트에 참여하셨습니다!<br>한 분당 1회만 참여 가능합니다 😊';
            resultMessage.className = 'result-message';
        }
    }

    const allSymbols = ['0', '1', '2', '3', '4', '5', '6'];  // 릴 표시용 (0~6 숫자)
    const MAX_WINNERS = 26;  // 26명 당첨 시 게임 종료
    let isWinner = false;  // 현재 사용자가 당첨자인지 확인하는 플래그

    // Firebase 데이터베이스 참조
    const winnersRef = database.ref('winners');
    const gameStatusRef = database.ref('gameStatus');

    // 게임 종료 상태 체크 및 UI 업데이트
    function checkGameStatus() {
        gameStatusRef.on('value', (snapshot) => {
            const status = snapshot.val();
            if (status && status.ended) {
                showGameEndedMessage();
                // 게임 종료 시 버튼도 비활성화
                const spinBtn = document.getElementById('spinBtn');
                if (spinBtn && !isWinner) {
                    spinBtn.disabled = true;
                    spinBtn.textContent = '🙏 이벤트 종료';
                    spinBtn.style.opacity = '0.5';
                    spinBtn.style.cursor = 'not-allowed';
                }
            }
        });
    }

    // 당첨자 수 실시간 모니터링
    function monitorWinnerCount() {
        winnersRef.on('value', (snapshot) => {
            const winners = snapshot.val();
            const winnerCount = winners ? Object.keys(winners).length : 0;

            if (winnerCount >= MAX_WINNERS) {
                endGame();
            }
        });
    }

    // 게임 종료 처리
    async function endGame() {
        try {
            // 게임 종료 상태 저장
            await gameStatusRef.set({
                ended: true,
                endTime: new Date().toISOString(),
                totalWinners: MAX_WINNERS
            });
            showGameEndedMessage();
        } catch (error) {
            console.error('게임 종료 처리 오류:', error);
        }
    }

    // 게임 종료 메시지 표시 (당첨자가 아닌 경우만)
    function showGameEndedMessage() {
        // 현재 사용자가 당첨자라면 축하 메시지 유지
        if (isWinner) {
            return;
        }

        const spinBtn = document.getElementById('spinBtn');
        const resultMessage = document.getElementById('resultMessage');
        const prizeInfo = document.getElementById('prizeInfo');

        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.textContent = '🙏 이벤트 종료';
            spinBtn.style.opacity = '0.5';
            spinBtn.style.cursor = 'not-allowed';
        }

        if (resultMessage) {
            resultMessage.innerHTML = '🙏🏻 이벤트 종료<br>휴넷 창립 26주년<br>★행운의 26명★이 모두 선정되었습니다!<br>함께 축하해 주셔서 감사합니다.';
            resultMessage.className = 'result-message';
        }

        if (prizeInfo) {
            prizeInfo.textContent = '';
        }
    }

    // 당첨자 정보 저장
    async function saveWinner() {
        try {
            const timestamp = new Date().toISOString();
            const winnerId = `winner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await winnersRef.child(winnerId).set({
                timestamp: timestamp,
                userAgent: navigator.userAgent,
                source: 'web'
            });

        } catch (error) {
            console.error('당첨자 저장 오류:', error);
        }
    }

    // 페이지 로드 시 게임 상태 체크 시작
    checkGameStatus();
    monitorWinnerCount();
    
    // 화면 크기에 따른 심볼 높이와 뷰포트 위치 계산
    function getViewportSettings() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 360) {
            return { symbolHeight: 35, viewportTop: 35 };
        } else if (screenWidth <= 400) {
            return { symbolHeight: 40, viewportTop: 40 };
        } else if (screenWidth <= 768) {
            return { symbolHeight: 40, viewportTop: 40 };
        } else {
            return { symbolHeight: 50, viewportTop: 50 };
        }
    }
    
    // 순환 구조를 동적으로 생성하는 함수
    function generateCircularSymbols(targetSymbol, totalVisible = 42) {
        const targetIndex = allSymbols.indexOf(targetSymbol);
        if (targetIndex === -1) {
            console.error(`generateCircularSymbols: 심볼 '${targetSymbol}'을 allSymbols에서 찾을 수 없음`);
            // 기본 심볼로 폴백
            return allSymbols.concat(allSymbols).concat(allSymbols).concat(allSymbols).concat(allSymbols).concat(allSymbols).slice(0, totalVisible);
        }

        const result = [];
        const centerPosition = 21; // HTML에 맞춰 42개 중 중앙 위치로 조정 (21번째 인덱스)

        // 중앙에 목표 심볼이 정확히 오도록 배치
        for (let i = 0; i < totalVisible; i++) {
            const offset = i - centerPosition;
            let symbolIndex = (targetIndex - offset + allSymbols.length * 10) % allSymbols.length;
            result.push(allSymbols[symbolIndex]);
        }

        return result;
    }
    
    // 릴의 심볼 스트림을 동적으로 업데이트하는 함수 - 원본 방식 복원
    function updateReelSymbols(reel, targetSymbol) {
        const symbolStream = reel.querySelector('.symbol-stream');
        if (!symbolStream) {
            return false;
        }

        
        // 42개 심볼 순환 배열 생성
        const circularSymbols = generateCircularSymbols(targetSymbol);
        if (circularSymbols.length === 0) {
            return false;
        }
        
        
        symbolStream.innerHTML = '';

        circularSymbols.forEach((symbol, index) => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.textContent = symbol;
            symbolStream.appendChild(symbolDiv);
        });
        
        
        // 릴이 제대로 표시되는지 확인
        const computedStyle = window.getComputedStyle(reel);
        const streamComputedStyle = window.getComputedStyle(symbolStream);
        
        return true;
    }
    const prizes = {
        '026': { message: '짠! 축하합니다!<br>당신이 바로 ★행운의 26명★입니다.<br>현장에서 특별한 선물을 받아가세요!' }
    };
    
    const spinBtn = document.getElementById('spinBtn');
    const reels = document.querySelectorAll('.reel');
    const resultMessage = document.getElementById('resultMessage');
    const prizeInfo = document.getElementById('prizeInfo');
    
    function updateReelPosition(reel, symbol) {
        const symbolStream = reel.querySelector('.symbol-stream');
        if (!symbolStream) {
            console.error(`updateReelPosition: symbol-stream을 찾을 수 없음 (릴: ${reel.id})`);
            return false;
        }
        
        const updateSuccess = updateReelSymbols(reel, symbol);
        if (!updateSuccess) {
            return false;
        }
        
        // HTML과 일치하는 42개 심볼 기준 위치 계산
        const { symbolHeight, viewportTop } = getViewportSettings();
        const centerIndex = 21; // 42개 심볼 중 중앙 위치
        const targetSymbolTop = centerIndex * symbolHeight;
        const offset = viewportTop - targetSymbolTop;
        
        
        symbolStream.style.transform = `translateZ(0) translateY(${offset}px)`;
        symbolStream.style.transition = 'none';
        
        
        // 변경 후 실제 적용됐는지 확인
        setTimeout(() => {
            const actualTransform = window.getComputedStyle(symbolStream).transform;
        }, 10);
        
        return true;
    }
    
    if (spinBtn && reels.length === 3) {
        // 테스트를 위해 1회 참여 제한 해제
        // if (hasPlayedBefore()) {
        //     showAlreadyPlayedMessage();
        // }

        const setupInitialPositions = () => {
            if (isGameRunning) return; // 게임 실행 중이면 초기화 중단

            const initialSymbols = ['0', '2', '6'];
            let successCount = 0;

            
            reels.forEach((reel, index) => {
                const symbolStream = reel.querySelector('.symbol-stream');
                if (symbolStream) {
                    const success = updateReelPosition(reel, initialSymbols[index]);
                    if (success) {
                        successCount++;
                    } else {
                    }
                } else {
                }
            });

            
            if (successCount < 3) {
                setTimeout(setupInitialPositions, 100);
            } else {
                // 초기 위치 설정 완료 후 화면 안정화
                setTimeout(() => {
                    reels.forEach((reel, index) => {
                        const success = updateReelPosition(reel, initialSymbols[index]);
                    });
                }, 200);
            }
        };

        let isGameRunning = false; // 게임 실행 중인지 추적

        // 페이지 로드 시 여러 번 초기화로 안정성 확보
        setupInitialPositions();
        setTimeout(() => {
            if (!isGameRunning) setupInitialPositions();
        }, 500);
        setTimeout(() => {
            if (!isGameRunning) setupInitialPositions();
        }, 1000);
        
        spinBtn.addEventListener('click', async () => {
            // 게임 종료 상태 체크
            const gameStatus = await gameStatusRef.once('value');
            if (gameStatus.val() && gameStatus.val().ended) {
                showGameEndedMessage();
                return;
            }

            // 테스트를 위해 1회 참여 제한 해제
            // if (hasPlayedBefore()) {
            //     showAlreadyPlayedMessage();
            //     return;
            // }

            isGameRunning = true; // 게임 실행 시작
            spinBtn.disabled = true;
            spinBtn.textContent = '🔄 뽑는 중...';

            reels.forEach(reel => reel.classList.add('spinning'));

            const result = determineResult();
            await animateReels(result.symbols);

            // 개별 릴에서 이미 제거되었지만 안전을 위해 한 번 더 확인
            reels.forEach(reel => reel.classList.remove('spinning'));
            showResult(result);

            if (result.isWin) {
                showWinLine();
            }

            // 테스트를 위해 1회 참여 제한 해제
            // markAsPlayed();

            isGameRunning = false; // 게임 실행 종료
            
            // 테스트를 위해 버튼 즉시 활성화
            if (spinBtn) {
                spinBtn.disabled = false;
                spinBtn.textContent = '🎁 행운 뽑기';
                spinBtn.style.opacity = '1';
                spinBtn.style.cursor = 'pointer';
            }
            
            setTimeout(() => {
                document.querySelectorAll('.symbol').forEach(symbol => {
                    symbol.classList.remove('winning-symbol', 'blinking');
                });
            }, 3000);
        });
    }
    
    function determineResult() {
        const random = Math.random();

        // 첫 번째, 두 번째 릴은 항상 0, 2로 고정
        // 세 번째 릴만 랜덤 (6.5% 확률로 6, 나머지는 다른 숫자)
        let thirdReel;
        if (random < 0.065) {
            // 당첨: 세 번째 릴이 6
            return {
                isWin: true,
                symbols: ['0', '2', '6'],
                prize: prizes['026']
            };
        } else {
            // 꽝: 세 번째 릴이 0,1,2,3,4,5 중 하나
            const loseNumbers = ['0', '1', '2', '3', '4', '5'];
            const thirdReel = loseNumbers[Math.floor(Math.random() * loseNumbers.length)];
            return {
                isWin: false,
                symbols: ['0', '2', thirdReel]
            };
        }
    }
    
    async function animateReels(finalSymbols) {
        const animateReel = (reel, finalSymbol, reelIndex) => {
            return new Promise(resolve => {
                const symbolStream = reel.querySelector('.symbol-stream');
                if (!symbolStream) {
                    resolve();
                    return;
                }
                
                // 릴별로 더 큰 차이를 두어 긴장감 조성
                const spinDuration = reelIndex === 0 ? 2000 :
                                   reelIndex === 1 ? 3200 :
                                   5500; // 마지막 릴은 훨씬 길게
                const startTime = Date.now();
                
                const { symbolHeight, viewportTop } = getViewportSettings();
                const totalSymbols = 42; // HTML과 일치하도록 변경
                const totalHeight = totalSymbols * symbolHeight;
                
                // 심볼 배열 미리 생성 (DOM 조작 최소화)
                const circularSymbols = generateCircularSymbols(finalSymbol);

                // 기존 DOM 구조를 유지하면서 텍스트만 업데이트
                const existingSymbols = symbolStream.querySelectorAll('.symbol');
                if (existingSymbols.length === circularSymbols.length) {
                    // 기존 엘리먼트들의 텍스트만 업데이트
                    existingSymbols.forEach((element, index) => {
                        element.textContent = circularSymbols[index];
                    });
                } else {
                    // 완전 재생성 (폴백)
                    updateReelSymbols(reel, finalSymbol);
                }

                // 중앙 인덱스는 항상 21번째로 고정 (42개 심볼 기준)
                const centerIndex = 21;
                const finalSymbolTop = centerIndex * symbolHeight;
                const finalOffset = viewportTop - finalSymbolTop;
                const initialOffset = finalOffset;
                let currentOffset = initialOffset;
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / spinDuration, 1);
                    
                    if (progress < 1) {
                        const speed = calculateSpinSpeed(progress);
                        currentOffset -= speed;
                        
                        while (currentOffset <= -totalHeight) {
                            currentOffset += totalHeight;
                        }
                        
                        while (currentOffset > totalHeight) {
                            currentOffset -= totalHeight;
                        }
                        
                        symbolStream.style.transform = `translateY(${currentOffset}px)`;
                        requestAnimationFrame(animate);
                    } else {
                        // 단순하게 정확한 최종 위치로 설정
                        let bestOffset = finalOffset;

                        // 현재 위치에서 가장 가까운 올바른 위치 찾기
                        while (Math.abs(bestOffset - currentOffset) > totalHeight / 2) {
                            if (bestOffset > currentOffset) {
                                bestOffset -= totalHeight;
                            } else {
                                bestOffset += totalHeight;
                            }
                        }
                        
                        const distance = Math.abs(bestOffset - currentOffset);
                        // 마지막 릴은 훨씬 더 길고 부드러운 정지 (아슬아슬하게)
                        const smoothStopDuration = reelIndex === 2 ?
                            Math.max(1200, Math.min(2500, distance * 5)) :
                            Math.max(250, Math.min(500, distance * 1.5));
                        const stopStartTime = Date.now();
                        const stopStartOffset = currentOffset;
                        
                        const smoothStop = () => {
                            const stopElapsed = Date.now() - stopStartTime;
                            const stopProgress = Math.min(stopElapsed / smoothStopDuration, 1);
                            
                            if (stopProgress < 1) {
                                // 마지막 릴은 더 부드러운 이징 함수 사용
                                let finalEase;
                                if (reelIndex === 2) {
                                    // 극도로 부드러운 감속 곡선 (숫자 하나씩 느끼게)
                                    const easeOut1 = 1 - Math.pow(2, -4 * stopProgress);
                                    const easeOut2 = 1 - Math.pow(1 - stopProgress, 8);
                                    const easeOut3 = Math.sin((stopProgress * Math.PI) / 2);
                                    finalEase = (easeOut1 * 0.2 + easeOut2 * 0.6 + easeOut3 * 0.2);
                                } else {
                                    // 기존 이징
                                    const easeOut1 = 1 - Math.pow(2, -8 * stopProgress);
                                    const easeOut2 = 1 - Math.pow(1 - stopProgress, 4);
                                    const easeOut3 = stopProgress * (2 - stopProgress);
                                    finalEase = (easeOut1 * 0.4 + easeOut2 * 0.4 + easeOut3 * 0.2);
                                }
                                
                                const interpolatedOffset = stopStartOffset + (bestOffset - stopStartOffset) * finalEase;
                                
                                symbolStream.style.transform = `translateY(${interpolatedOffset}px)`;
                                requestAnimationFrame(smoothStop);
                            } else {
                                symbolStream.style.transform = `translateY(${bestOffset}px)`;
                                reel.classList.remove('spinning');
                                highlightWinningSymbol(reel, finalSymbol);
                                resolve();
                            }
                        };
                        
                        requestAnimationFrame(smoothStop);
                    }
                };
                
                function calculateSpinSpeed(progress) {
                    // 3번째 릴(마지막)은 2번째 릴이 끝나는 시점부터 변화
                    if (reelIndex === 2) {
                        const secondReelEndPoint = 3200 / spinDuration; // 2번째 릴이 끝나는 비율

                        if (progress < secondReelEndPoint) {
                            // 2번째 릴이 끝날 때까지는 일반 속도
                            if (progress < 0.1) {
                                const easeProgress = progress / 0.1;
                                return Math.pow(easeProgress, 0.5) * 30;
                            } else {
                                return 30;
                            }
                        } else {
                            // 2번째 릴이 끝난 후부터 극적 변화!
                            const dramticProgress = (progress - secondReelEndPoint) / (1 - secondReelEndPoint);

                            if (dramticProgress < 0.3) {
                                // 갑자기 빨라짐!
                                const accelerationProgress = dramticProgress / 0.3;
                                return 30 + (accelerationProgress * 20); // 30 → 50
                            } else if (dramticProgress < 0.7) {
                                // 고속 유지
                                return 50;
                            } else if (dramticProgress < 0.8) {
                                // 1차 감속 (여전히 빠름)
                                const slowProgress = (dramticProgress - 0.7) / 0.1;
                                return 50 - (slowProgress * 25); // 50 → 25
                            } else if (dramticProgress < 0.95) {
                                // 2차 감속 (숫자가 보이기 시작)
                                const slowProgress = (dramticProgress - 0.8) / 0.15;
                                return 25 - (slowProgress * 18); // 25 → 7
                            } else {
                                // 극적인 마지막 구간 (숫자 하나씩 천천히)
                                const finalProgress = (dramticProgress - 0.95) / 0.05;
                                const easeOut = 1 - Math.pow(finalProgress, 6);
                                return Math.max(7 * easeOut, 0.2);
                            }
                        }
                    } else if (reelIndex === 1) {
                        // 2번째 릴도 더 드라마틱하게
                        if (progress < 0.1) {
                            const easeProgress = progress / 0.1;
                            return Math.pow(easeProgress, 0.5) * 35;
                        } else if (progress < 0.7) {
                            return 35;
                        } else {
                            const decelProgress = (progress - 0.7) / 0.3;
                            const easeOut = 1 - Math.pow(decelProgress, 3.2);
                            return Math.max(35 * easeOut, 0.6);
                        }
                    } else {
                        // 1번째 릴 (가장 빠르게 정지)
                        if (progress < 0.1) {
                            const easeProgress = progress / 0.1;
                            return Math.pow(easeProgress, 0.5) * 30;
                        } else if (progress < 0.75) {
                            return 30;
                        } else {
                            const decelProgress = (progress - 0.75) / 0.25;
                            const easeOut = 1 - Math.pow(decelProgress, 2.5);
                            return Math.max(30 * easeOut, 0.8);
                        }
                    }
                }
                
                animate();
            });
        };
        
        const promises = [];
        reels.forEach((reel, index) => {
            promises.push(animateReel(reel, finalSymbols[index], index));
        });
        
        await Promise.all(promises);
    }
    
    function highlightWinningSymbol(reel, winningSymbol) {
        const symbolStream = reel.querySelector('.symbol-stream');
        if (!symbolStream) return;

        const allSymbolElements = symbolStream.querySelectorAll('.symbol');
        allSymbolElements.forEach(symbol => {
            symbol.classList.remove('winning-symbol', 'blinking');
        });

        // 중앙에 표시된 심볼 찾기 (21번째 인덱스, 42개 심볼 기준)
        const centerSymbolElement = allSymbolElements[21];
        if (centerSymbolElement && centerSymbolElement.textContent === winningSymbol) {
            centerSymbolElement.classList.add('winning-symbol');
            setTimeout(() => {
                if (centerSymbolElement) {
                    centerSymbolElement.classList.add('blinking');
                }
            }, 500);
        }
    }
    
    function showWinLine() {
        const winLine = document.querySelector('.win-line');
        if (winLine) {
            winLine.classList.add('active');
            setTimeout(() => {
                winLine.classList.remove('active');
            }, 3000);
        }
    }
    
    function showResult(result) {
        if (result.isWin) {
            // 현재 사용자를 당첨자로 설정
            isWinner = true;

            // 당첨자에게는 계속 축하 메시지 표시
            if (resultMessage) {
                resultMessage.innerHTML = result.prize.message;
                resultMessage.className = 'result-message win';
            }
            if (prizeInfo) prizeInfo.textContent = '';
            setTimeout(() => triggerCelebrationAnimation(), 500);

            // 테스트를 위해 당첨 후 버튼 비활성화 해제
            // const spinBtn = document.getElementById('spinBtn');
            // if (spinBtn) {
            //     spinBtn.disabled = true;
            //     spinBtn.textContent = '🎉 당첨 완료';
            //     spinBtn.style.opacity = '0.5';
            //     spinBtn.style.cursor = 'not-allowed';
            // }

            // 즉시 Firebase에 저장하여 다른 사용자들에게 게임 종료 알림
            saveWinner();

        } else {
            if (resultMessage) {
                resultMessage.innerHTML = '이번엔 꽝😭<br>창립 26주년<br>함께해주셔서 감사합니다~';
                resultMessage.className = 'result-message lose';
            }
            if (prizeInfo) prizeInfo.textContent = '';
        }
    }
    
    function triggerCelebrationAnimation() {
        const slotMachine = document.getElementById('slotMachine');
        const slotSparkle = document.getElementById('slotSparkle');
        
        if (!slotMachine) return;
        
        slotMachine.classList.add('celebration');
        setTimeout(() => slotMachine.classList.remove('celebration'), 2000);
        
        if (slotSparkle) {
            slotSparkle.classList.add('active');
            setTimeout(() => slotSparkle.classList.remove('active'), 1500);
        }
        
        createFireworksInSlotArea(slotMachine);
        createLocalFloatingEmojis(slotMachine);
        createFireworkParticles(slotMachine);
    }
    
    function createFireworksInSlotArea(slotMachine) {
        const fireworkEmojis = ['🎆', '🎇', '✨', '🎉', '🎊'];
        const fireworkCount = 8;
        const rect = slotMachine.getBoundingClientRect();
        
        for (let i = 0; i < fireworkCount; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.textContent = fireworkEmojis[Math.floor(Math.random() * fireworkEmojis.length)];
                
                firework.style.left = (Math.random() * (rect.width - 50)) + 'px';
                firework.style.top = (Math.random() * (rect.height - 50)) + 'px';
                
                const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
                firework.style.color = colors[Math.floor(Math.random() * colors.length)];
                
                slotMachine.appendChild(firework);
                firework.classList.add('explode');
                
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 1500);
            }, i * 200);
        }
    }
    
    function createLocalFloatingEmojis(slotMachine) {
        const emojis = ['🎉', '🎊', '✨', '🌟', '🎈', '🎁'];
        const emojiCount = 10;
        const rect = slotMachine.getBoundingClientRect();
        
        for (let i = 0; i < emojiCount; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'celebration-emoji';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                
                emoji.style.left = (Math.random() * rect.width) + 'px';
                emoji.style.bottom = '0px';
                emoji.style.animationDelay = Math.random() * 0.3 + 's';
                emoji.style.animationDuration = (2 + Math.random() * 0.5) + 's';
                
                slotMachine.appendChild(emoji);
                
                setTimeout(() => {
                    if (emoji.parentNode) {
                        emoji.parentNode.removeChild(emoji);
                    }
                }, 2500);
            }, i * 150);
        }
    }
    
    function createFireworkParticles(slotMachine) {
        const particleCount = 20;
        const rect = slotMachine.getBoundingClientRect();
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'firework-particle';
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const angle = (i / particleCount) * 2 * Math.PI;
                const distance = 50 + Math.random() * 100;
                
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                
                const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                slotMachine.appendChild(particle);
                particle.classList.add('burst');
                
                const finalX = centerX + Math.cos(angle) * distance;
                const finalY = centerY + Math.sin(angle) * distance;
                
                particle.style.transform = `translate(${finalX - centerX}px, ${finalY - centerY}px) scale(0.2)`;
                particle.style.transition = 'transform 1.2s ease-out';
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1200);
            }, i * 50);
        }
    }
    
});