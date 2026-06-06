/* birthday.js */
document.addEventListener('DOMContentLoaded', () => {
  const letters = document.querySelectorAll('.happy-text span, .birthday-text span');
  const datePillWrapper = document.querySelector('.date-pill-wrapper');
  const balloons = document.querySelectorAll('.balloon');
  const cap = document.querySelector('.birthday-cap');
  const frame = document.querySelector('.frame');
  const namePlateWrapper = document.querySelector('.name-plate-wrapper');
  const nextBtn = document.querySelector('.btn-next');

  // Background balloons
  createBgBalloons();

  // Background Music — start at silence and fade in slowly
  const birthdayBgMusic = document.getElementById('birthday-bg-music');
  if (birthdayBgMusic) {
    birthdayBgMusic.volume = 0;
    birthdayBgMusic.play().then(() => {
      // Smooth fade-in from 0 to 0.35 over ~4 seconds
      let currentVol = 0;
      const targetVol = 0.35;
      const fadeStep = 0.005;     // tiny increments for ultra-smooth rise
      const fadeInterval = setInterval(() => {
        currentVol += fadeStep;
        if (currentVol >= targetVol) {
          birthdayBgMusic.volume = targetVol;
          clearInterval(fadeInterval);
        } else {
          birthdayBgMusic.volume = currentVol;
        }
      }, 60); // 0.005 every 60ms ≈ 4.2s to reach 0.35
    }).catch((e) => {
      console.log('Birthday music autoplay blocked:', e);
      // Fallback: play on first user interaction
      const playOnInteraction = () => {
        birthdayBgMusic.volume = 0;
        birthdayBgMusic.play().then(() => {
          let currentVol = 0;
          const targetVol = 0.35;
          const fadeInterval = setInterval(() => {
            currentVol += 0.005;
            if (currentVol >= targetVol) {
              birthdayBgMusic.volume = targetVol;
              clearInterval(fadeInterval);
            } else {
              birthdayBgMusic.volume = currentVol;
            }
          }, 60);
        }).catch(() => {});
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction, { once: false });
      document.addEventListener('touchstart', playOnInteraction, { once: false });
    });
  }

  // Animation Timeline
  // 1. Background is visible
  // 2. Garlands drop immediately via CSS animation with 0.5s delay
  
  let delay = 1500; // Wait for garlands

  // 3. Text appears letter by letter
  letters.forEach((letter, i) => {
    setTimeout(() => {
      letter.style.opacity = '1';
      letter.style.transform = 'translateY(0) scale(1)';
      letter.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }, delay + (i * 100));
  });
  
  delay += letters.length * 100 + 400;

  // 4. Cap falls
  setTimeout(() => {
    cap.style.animation = 'dropCap 0.8s forwards cubic-bezier(0.5, 0, 0.3, 1.5)';
  }, delay);

  delay += 800;

  // 5. Bear and frame appears
  setTimeout(() => {
    frame.style.animation = 'popIn 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }, delay);

  // 6. Balloons rise up together with the bear
  setTimeout(() => {
    balloons.forEach(b => b.classList.add('show'));
  }, delay + 200);

  delay += 1000;

  // 7. Date, name plate, Next button appear smoothly
  setTimeout(() => {
    datePillWrapper.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    datePillWrapper.style.opacity = '1';
    datePillWrapper.style.transform = 'translateY(0)';
    
    namePlateWrapper.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    namePlateWrapper.style.opacity = '1';
    namePlateWrapper.style.transform = 'translateY(0)';
  }, delay);

  setTimeout(() => {
    nextBtn.classList.add('visible');
  }, delay + 500);

  // Next button click
  nextBtn.addEventListener('click', () => {
    // 1. Fade out scene 1
    const scene1 = document.getElementById('stage');
    scene1.style.transition = 'opacity 1s ease';
    scene1.style.opacity = '0';
    scene1.style.pointerEvents = 'none';
    
    setTimeout(() => {
      // 2. Show Scene 2
      const scene2 = document.getElementById('cake-scene');
      scene2.style.opacity = '1';
      scene2.style.pointerEvents = 'auto';
      
      // 3. Start Cake Sequence
      startCakeSequence();
    }, 1000);
  });
});

// --- CAKE SCENE LOGIC ---
function startCakeSequence() {
  const cakeWrapper = document.querySelector('.cake-bounce-wrapper');
  const storyTexts = document.querySelectorAll('.story-text');
  const micSection = document.querySelector('.mic-section');
  
  let delay = 500;
  
  // 1. Cake rises
  setTimeout(() => {
    cakeWrapper.classList.add('visible');
  }, delay);
  
  delay += 1500;
  
  // 2. Story text sequence
  storyTexts.forEach((text, index) => {
    setTimeout(() => {
      text.classList.add('visible');
    }, delay);
    delay += 1500;
  });
  
  // 3. Show Mic Section
  setTimeout(() => {
    micSection.classList.add('visible');
    initMicrophone();
  }, delay + 500);
}

function initMicrophone() {
  const btnMic = document.getElementById('btn-mic');
  const micText = btnMic.querySelector('.mic-text');
  let audioContext;
  let analyser;
  let microphone;
  let isListening = false;

  btnMic.addEventListener('click', async () => {
    if (isListening) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      isListening = true;
      btnMic.classList.add('listening');
      micText.textContent = "Listening...";
      
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let blowDetected = false;
      
      function detectBlow() {
        if (blowDetected) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        
        const average = sum / bufferLength;
        
        // Instant trigger on high volume, same as the cinematic candle
        if (average > 65) {
          blowDetected = true;
          triggerSuccess(stream, null, audioContext);
        } else {
          requestAnimationFrame(detectBlow);
        }
      }
      
      detectBlow();
      
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is needed to blow the candle! (Or you can tap the flame to simulate it)");
      
      // Fallback: tap the flame
      document.querySelector('.candle').addEventListener('click', () => {
        triggerSuccess(null, null, null);
      });
    }
  });
}

function triggerSuccess(stream, jsNode, audioContext) {
  // Stop audio processing
  if (stream) stream.getTracks().forEach(track => track.stop());
  if (jsNode) jsNode.disconnect();
  if (audioContext) audioContext.close();
  
  const micSection = document.querySelector('.mic-section');
  const flame = document.getElementById('flame');
  const flameGlow = document.getElementById('flame-glow');
  const smoke = document.getElementById('smoke');
  const storyTexts = document.querySelectorAll('.story-text');
  const successTexts = document.querySelectorAll('.success-text');
  const envelopeContainer = document.getElementById('envelope-container');
  const layerTop = document.querySelector('.layer-top');
  
  // 1. Hide mic section and old text
  micSection.classList.remove('visible');
  storyTexts.forEach(text => text.classList.remove('visible'));
  
  // 2. Blow out candle
  flame.style.display = 'none';
  flameGlow.style.display = 'none';
  smoke.classList.add('active');
  
  // 3. Trigger Confetti
  triggerConfetti();
  
  // Trigger Fireworks
  triggerFireworks();
  
  // 4. Show success text
  setTimeout(() => {
    successTexts[0].classList.add('visible'); // Yayyyy!
  }, 1000);
  
  setTimeout(() => {
    successTexts[0].classList.remove('visible');
    setTimeout(() => {
      successTexts[1].classList.add('visible'); // Wish locked
    }, 500);
  }, 3500);
  
  // 5. Open cake and reveal envelope
  setTimeout(() => {
    layerTop.classList.add('open');
    setTimeout(() => {
      envelopeContainer.classList.add('visible');
    }, 500);
  }, 6000);
  
  // Open Letter listener
  document.getElementById('envelope-container').addEventListener('click', () => {
    if (!envelopeContainer.classList.contains('opening')) {
      envelopeContainer.classList.add('opening');
      
      // Wait for the envelope opening animation, then show letter scene
      setTimeout(() => {
        document.getElementById('letter-scene').classList.add('active');
        
        // Start typewriter effect after a short delay
        setTimeout(() => {
          typeWriter();
        }, 1000);
        
      }, 1500); // 1.5s allows flap to open
    } else {
      // If already opened, just show the letter scene again instantly
      document.getElementById('letter-scene').classList.add('active');
    }
  });

  // Close letter listener (X button)
  document.getElementById('btn-close-letter').addEventListener('click', () => {
    document.getElementById('letter-scene').classList.remove('active');
  });

  // Close letter listener (Tapping the background/overlay)
  document.querySelector('.letter-overlay').addEventListener('click', () => {
    document.getElementById('letter-scene').classList.remove('active');
  });
}

const letterLines = [
  { text: "Dear Lucky 💌,", class: "letter-title", delayAfter: 1500, speed: 70 }, // Slower for title
  { text: "Happy Birthday ❤️", delayAfter: 2000, speed: 50 }, // Pause after this
  { text: "I hope this year brings you lots of happiness, good memories, and countless reasons to smile.", delayAfter: 800, speed: 35 },
  { text: "May you get closer to everything you wish for, and may the coming year be kinder, brighter, and even better than the last one.", delayAfter: 800, speed: 35 },
  { text: "Take care of yourself, enjoy your special day, eat lots of cake 🎂, and make some beautiful memories today.", delayAfter: 800, speed: 35 },
  { text: "Thank you for taking the time to go through this little birthday surprise. I spent a lot of time making it, and I hope it made you smile, even if just a little. ✨", delayAfter: 1500, speed: 35 },
  { text: "And one more thing...", delayAfter: 2500, speed: 50 }, // Pause after this
  { text: "If you really liked this gift and want to say thank you, don't just send a text 😭", delayAfter: 800, speed: 35 },
  { text: "Give me a call sometime and tell me yourself. 📞✨", delayAfter: 1000, speed: 35 },
  { text: "I'd love to hear your reaction.", delayAfter: 2000, speed: 40 }, // Pause after this
  { text: "Happy Birthday once again 🎂💖", delayAfter: 1000, speed: 40 },
  { text: "Priyanshu", delayAfter: 0, speed: 50 }
];

async function typeWriter() {
  const contentDiv = document.getElementById('letter-content');
  const paper = document.getElementById('letter-paper');
  
  for (let i = 0; i < letterLines.length; i++) {
    const lineObj = letterLines[i];
    const p = document.createElement('p');
    if (lineObj.class) {
      p.className = lineObj.class;
    } else {
      // Add a small bottom margin to regular paragraphs
      p.style.marginBottom = "15px";
    }
    contentDiv.appendChild(p);
    
    // Array.from safely splits string by Unicode characters (so emojis don't break)
    const chars = Array.from(lineObj.text);
    const speed = lineObj.speed || 35;
    
    for (let char of chars) {
      p.innerHTML += char;
      // Scroll down as new text appears
      paper.scrollTop = paper.scrollHeight;
      // Wait for 'speed' milliseconds
      await new Promise(r => setTimeout(r, speed));
    }
    
    // Wait before starting the next line
    await new Promise(r => setTimeout(r, lineObj.delayAfter));
  }
}

function triggerFireworks() {
  const container = document.getElementById('fireworks-container');
  
  // Shoot 4 to 6 fireworks
  const numFireworks = 4 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numFireworks; i++) {
    setTimeout(() => {
      const firework = document.createElement('div');
      firework.classList.add('firework');
      // Randomize horizontal launch position
      firework.style.left = (15 + Math.random() * 70) + '%';
      
      const explosion = document.createElement('div');
      explosion.classList.add('explosion');
      
      firework.appendChild(explosion);
      container.appendChild(firework);
      
      // Cleanup firework element after animation
      setTimeout(() => {
        if(container.contains(firework)) firework.remove();
      }, 3000);
      
    }, i * 500 + Math.random() * 400); // Stagger them nicely
  }
}

function triggerConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#ff7da9', '#ffa7c4', '#FFF2D1', '#FFF', '#904C77'];
  
  // Burst of 75 confetti pieces for a richer visual
  for (let i = 0; i < 75; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    
    // Randomize properties
    const left = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    // Fall duration roughly 1.5s to 2.8s
    const animDuration = 1.5 + Math.random() * 1.3;
    const delay = Math.random() * 0.4;
    
    confetti.style.left = left + '%';
    confetti.style.background = color;
    confetti.style.animationDuration = animDuration + 's';
    confetti.style.animationDelay = delay + 's';
    
    container.appendChild(confetti);
  }
  
  // Clean up the DOM to prevent performance issues, giving enough time for animations to finish
  setTimeout(() => {
    container.innerHTML = '';
  }, 4000);
}

function createBgBalloons() {
  const scene = document.getElementById('birthday-scene');
  const colors = ['#ffa7c4', '#ff7da9', '#FFF2D1', '#904C77'];
  
  // Create 15 background balloons
  for (let i = 0; i < 15; i++) {
    const b = document.createElement('div');
    b.classList.add('bg-balloon');
    
    // Randomize properties
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = 15 + Math.random() * 15; // 15s to 30s
    const width = 40 + Math.random() * 50; // 40px to 90px
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    b.style.left = left + 'vw';
    b.style.animationDuration = duration + 's';
    b.style.animationDelay = delay + 's';
    b.style.width = width + 'px';
    b.style.height = (width * 1.3) + 'px'; // proportional height
    
    b.innerHTML = `
      <svg viewBox="0 0 100 150" style="width: 100%; height: 100%;">
        <path d="M50 10 C 15 10, 15 60, 50 85 C 85 60, 85 10, 50 10" fill="${color}" stroke="none"/>
        <path d="M45 85 L 55 85 L 50 93 Z" fill="${color}" stroke="none"/>
        <path d="M50 93 Q 40 120, 60 150" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
      </svg>
    `;
    
    scene.appendChild(b);
  }
}

function createButterflies() {
  const scene = document.getElementById('birthday-scene');
  const colors = ['#ffa7c4', '#ff7da9', '#f4a7c1', '#FFF2D1', '#904C77'];
  
  // Create 8 butterflies for a constant flying effect
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('div');
    b.classList.add('butterfly');
    
    // Choose a random color
    const color = colors[Math.floor(Math.random() * colors.length)];
    b.style.setProperty('--butterfly-color', color);
    
    // Create elements
    b.innerHTML = `
      <div class="wing wing-left"></div>
      <div class="wing wing-right"></div>
      <div class="body"></div>
      <div class="antenna-left"></div>
      <div class="antenna-right"></div>
    `;
    
    scene.appendChild(b);
    
    // Initial random position
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;
    b.style.left = x + 'px';
    b.style.top = y + 'px';

    function flyToNextPoint() {
      // Generate random next point
      let nextX = Math.random() * window.innerWidth;
      let nextY = Math.random() * window.innerHeight;
      
      // Calculate angle for rotation
      let dx = nextX - x;
      let dy = nextY - y;
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      // Add 90 degrees because the CSS butterfly points upwards natively
      angle += 90;
      
      // Calculate distance to determine duration for consistent speed
      let dist = Math.sqrt(dx*dx + dy*dy);
      let duration = (dist / 100) * 1000; // 100 pixels per second
      
      // Give it at least 2 seconds minimum to look natural
      if (duration < 2000) duration = 2000 + Math.random() * 2000;

      // Animate using Web Animations API
      if (b.animate) {
        b.animate([
          { transform: `translate(0px, 0px) rotate(${angle}deg)` },
          { transform: `translate(${dx}px, ${dy}px) rotate(${angle}deg)` }
        ], {
          duration: duration,
          easing: 'ease-in-out',
          fill: 'forwards'
        }).onfinish = () => {
          // Update actual coordinates for the next flight segment
          x = nextX;
          y = nextY;
          b.style.left = x + 'px';
          b.style.top = y + 'px';
          flyToNextPoint();
        };
      } else {
        // Fallback for browsers without WAAPI (though very rare now)
        b.style.transition = `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out, transform 500ms ease`;
        b.style.left = nextX + 'px';
        b.style.top = nextY + 'px';
        b.style.transform = `rotate(${angle}deg)`;
        setTimeout(() => {
          x = nextX;
          y = nextY;
          flyToNextPoint();
        }, duration);
      }
    }
    
    // Start sequence with a slight random delay
    setTimeout(flyToNextPoint, Math.random() * 2000);
  }
}
