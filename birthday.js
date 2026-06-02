/* birthday.js */
document.addEventListener('DOMContentLoaded', () => {
  const letters = document.querySelectorAll('.happy-text span, .birthday-text span');
  const datePill = document.querySelector('.date-pill');
  const balloons = document.querySelectorAll('.balloon');
  const cap = document.querySelector('.birthday-cap');
  const frame = document.querySelector('.frame');
  const namePlate = document.querySelector('.name-plate');
  const nextBtn = document.querySelector('.btn-next');

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
    datePill.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    datePill.style.opacity = '1';
    datePill.style.transform = 'translateY(0)';
    
    namePlate.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    namePlate.style.opacity = '1';
    namePlate.style.transform = 'translateY(0)';
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
  let javascriptNode;
  let isListening = false;

  btnMic.addEventListener('click', async () => {
    if (isListening) return;
    
    try {
      // Turn off audio processing on mobile to capture raw blowing noise
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      isListening = true;
      btnMic.classList.add('listening');
      micText.textContent = "Listening...";
      
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);
      
      let blowFrames = 0;
      
      javascriptNode.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        let peak = 0;
        
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += array[i];
          if (array[i] > peak) peak = array[i];
        }
        
        const average = values / length;
        
        // Mobile phones often have huge peaks from just handling/tapping the phone.
        // By completely removing the "peak" check, we stop false positives from taps.
        // We now only look for a SUSTAINED high average volume (continuous blowing).
        if (average > 65) {
          blowFrames++;
          // Require about ~400ms of sustained high volume
          if (blowFrames > 8) {
            // Blow detected!
            triggerSuccess(stream, javascriptNode, audioContext);
          }
        } else {
          // Slowly decay rather than instant reset to make it more forgiving
          blowFrames = Math.max(0, blowFrames - 1);
        }
      };
      
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
  document.getElementById('btn-open-letter').addEventListener('click', () => {
    console.log("Opening letter...");
    // Future integration
    alert("Opening the letter... (Next feature!)");
  });
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
