/**
 * 휴넷 창립 26주년 기념 슬롯머신 게임
 */

// 게임 로직
window.addEventListener('load', () => {
    const symbols = ['❌', '7', '🍒', '🍋', '⭐', '💎', '🔔'];
    const prizes = {
        '💎': { rate: 0.01, message: '💎 다이아몬드 대박! 💎' },
        '⭐': { rate: 0.02, message: '⭐ 별 당첨! ⭐' },
        '🔔': { rate: 0.03, message: '🔔 벨 당첨! 🔔' },
        '7': { rate: 0.04, message: '🍀 럭키 세븐! 🍀' }
    };
    
    const spinBtn = document.getElementById('spinBtn');
    const reels = document.querySelectorAll('.reel');
    const resultMessage = document.getElementById('resultMessage');
    const prizeInfo = document.getElementById('prizeInfo');
    const gameStatus = document.getElementById('gameStatus');
    
    function updateReelPosition(reel, symbol) {
        const symbolStream = reel.querySelector('.symbol-stream');
        if (!symbolStream) return;
        
        const symbolIndex = symbols.indexOf(symbol);
        if (symbolIndex === -1) return;
        
        // 더 정확한 기종별 크기 계산
        const screenWidth = window.innerWidth;
        let symbolHeight, reelHeight;
        
        if (screenWidth <= 380) {
            // 아이폰 SE, 갤럭시 폴드 등 소형
            symbolHeight = 35;
            reelHeight = 105;
        } else if (screenWidth <= 480) {
            // 아이폰 12 mini, 갤럭시 S 시리즈 등 중간
            symbolHeight = 40;
            reelHeight = 120;
        } else if (screenWidth <= 768) {
            // 일반 모바일
            symbolHeight = 40;
            reelHeight = 120;
        } else {
            // 데스크톱
            symbolHeight = 50;
            reelHeight = 150;
        }
        
        const viewportCenter = reelHeight / 2;
        const symbolTop = symbolIndex * symbolHeight;
        const symbolCenter = symbolTop + (symbolHeight / 2);
        const offset = viewportCenter - symbolCenter;
        
        symbolStream.style.transform = `translateZ(0) translateY(${offset}px)`;
        symbolStream.style.transition = 'none';
    }
    
    if (spinBtn && reels.length === 3) {
        const setupInitialPositions = () => {
            const initialSymbols = ['7', '7', '7'];
            let successCount = 0;
            
            reels.forEach((reel, index) => {
                const symbolStream = reel.querySelector('.symbol-stream');
                if (symbolStream) {
                    updateReelPosition(reel, initialSymbols[index]);
                    successCount++;
                }
            });
            
            if (successCount < 3) {
                setTimeout(setupInitialPositions, 50);
            }
        };
        
        setupInitialPositions();
        
        spinBtn.addEventListener('click', async () => {
            spinBtn.disabled = true;
            spinBtn.textContent = 'SPINNING...';
            
            reels.forEach(reel => reel.classList.add('spinning'));
            
            const result = determineResult();
            await animateReels(result.symbols);
            
            reels.forEach(reel => reel.classList.remove('spinning'));
            showResult(result);
            
            if (result.isWin) {
                showWinLine();
            }
            
            spinBtn.disabled = false;
            spinBtn.textContent = 'SPIN';
            setTimeout(() => {
                document.querySelectorAll('.symbol').forEach(symbol => {
                    symbol.classList.remove('winning-symbol', 'blinking');
                });
            }, 3000);
        });
    }
    
    function determineResult() {
        const random = Math.random();
        let cumulativeRate = 0;
        
        for (const [symbol, config] of Object.entries(prizes)) {
            cumulativeRate += config.rate;
            if (random < cumulativeRate) {
                return {
                    isWin: true,
                    symbols: [symbol, symbol, symbol],
                    prize: config
                };
            }
        }
        
        return {
            isWin: false,
            symbols: [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ]
        };
    }
    
    async function animateReels(finalSymbols) {
        const animateReel = (reel, finalSymbol, reelIndex) => {
            return new Promise(resolve => {
                const symbolStream = reel.querySelector('.symbol-stream');
                if (!symbolStream) {
                    resolve();
                    return;
                }
                
                const spinDuration = 1800 + reelIndex * 600;
                const startTime = Date.now();
                
                // 정확한 기종별 크기 계산 (updateReelPosition과 동일)
                const screenWidth = window.innerWidth;
                let symbolHeight, reelHeight;
                
                if (screenWidth <= 380) {
                    symbolHeight = 35; reelHeight = 105;
                } else if (screenWidth <= 480) {
                    symbolHeight = 40; reelHeight = 120;
                } else if (screenWidth <= 768) {
                    symbolHeight = 40; reelHeight = 120;
                } else {
                    symbolHeight = 50; reelHeight = 150;
                }
                
                const viewportCenter = reelHeight / 2;
                const totalSymbols = symbols.length;
                const totalHeight = totalSymbols * symbolHeight;
                
                const finalIndex = symbols.indexOf(finalSymbol);
                const finalSymbolTop = finalIndex * symbolHeight;
                const finalSymbolCenter = finalSymbolTop + (symbolHeight / 2);
                const finalOffset = viewportCenter - finalSymbolCenter;
                
                const initial7Index = 1;
                const initial7Top = initial7Index * symbolHeight;
                const initial7Center = initial7Top + (symbolHeight / 2);
                const initialOffset = viewportCenter - initial7Center;
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
                        const currentCycle = Math.floor(-currentOffset / totalHeight);
                        let bestOffset = finalOffset;
                        let minDistance = Math.abs(finalOffset - currentOffset);
                        
                        for (let cycle = currentCycle - 1; cycle <= currentCycle + 1; cycle++) {
                            const candidateOffset = finalOffset + (cycle * totalHeight);
                            const distance = Math.abs(candidateOffset - currentOffset);
                            if (distance < minDistance) {
                                minDistance = distance;
                                bestOffset = candidateOffset;
                            }
                        }
                        
                        const distance = Math.abs(bestOffset - currentOffset);
                        const smoothStopDuration = Math.max(250, Math.min(500, distance * 1.5));
                        const stopStartTime = Date.now();
                        const stopStartOffset = currentOffset;
                        
                        let animationId;
                        const smoothStop = () => {
                            const stopElapsed = Date.now() - stopStartTime;
                            const stopProgress = Math.min(stopElapsed / smoothStopDuration, 1);
                            
                            if (stopProgress < 1) {
                                const easeOut1 = 1 - Math.pow(2, -8 * stopProgress);
                                const easeOut2 = 1 - Math.pow(1 - stopProgress, 4);
                                const easeOut3 = stopProgress * (2 - stopProgress);
                                const finalEase = (easeOut1 * 0.4 + easeOut2 * 0.4 + easeOut3 * 0.2);
                                
                                const interpolatedOffset = stopStartOffset + (bestOffset - stopStartOffset) * finalEase;
                                
                                symbolStream.style.transform = `translateY(${interpolatedOffset}px)`;
                                animationId = requestAnimationFrame(smoothStop);
                            } else {
                                symbolStream.style.transform = `translateY(${bestOffset}px)`;
                                highlightWinningSymbol(reel, finalSymbol);
                                resolve();
                            }
                        };
                        
                        animationId = requestAnimationFrame(smoothStop);
                    }
                };
                
                function calculateSpinSpeed(progress) {
                    if (progress < 0.1) {
                        const easeProgress = progress / 0.1;
                        return Math.pow(easeProgress, 0.5) * 28;
                    } else if (progress < 0.75) {
                        return 28;
                    } else {
                        const decelProgress = (progress - 0.75) / 0.25;
                        const easeOut = 1 - Math.pow(decelProgress, 2.8);
                        return Math.max(28 * easeOut, 0.8);
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
        
        const allSymbols = symbolStream.querySelectorAll('.symbol');
        allSymbols.forEach(symbol => {
            symbol.classList.remove('winning-symbol', 'blinking');
        });
        
        const winningIndex = symbols.indexOf(winningSymbol);
        if (winningIndex !== -1) {
            const targetSymbol = allSymbols[winningIndex];
            if (targetSymbol) {
                targetSymbol.classList.add('winning-symbol');
                setTimeout(() => {
                    if (targetSymbol) {
                        targetSymbol.classList.add('blinking');
                    }
                }, 500);
            }
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
            if (resultMessage) {
                resultMessage.textContent = result.prize.message;
                resultMessage.className = 'result-message win';
            }
            if (prizeInfo) prizeInfo.textContent = '축하합니다! 당첨되셨습니다!';
            if (gameStatus) gameStatus.innerHTML = '<p>🎉 축하합니다! 당첨되셨습니다! 🎉</p>';
            setTimeout(() => triggerCelebrationAnimation(), 500);
        } else {
            if (resultMessage) {
                resultMessage.textContent = '아쉽네요! 다음 기회에~';
                resultMessage.className = 'result-message lose';
            }
            if (prizeInfo) prizeInfo.textContent = '꽝! 하지만 참여해주셔서 감사합니다!';
            if (gameStatus) gameStatus.innerHTML = '<p>😢 아쉽네요! 참여해주셔서 감사합니다!</p>';
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

window.addEventListener('error', (event) => {
    console.error('오류 발생:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise 오류:', event.reason);
});