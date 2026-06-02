/* birthday.js */
document.addEventListener('DOMContentLoaded', () => {
  // Sequence:
  // 1. Background already visible
  // 2. Garlands drop (CSS animation starts automatically at 0.5s delay)
  // 3. Text appears word by word/letter by letter
  // 4. Cap falls
  // 5. Teddy bear + balloons + name plate appear
  // 6. Next button appears

  const happySpans = document.querySelectorAll('.happy-text span');
  const birthdaySpans = document.querySelectorAll('.birthday-text span');
  const datePill = document.querySelector('.date-pill');
  const cap = document.querySelector('.birthday-cap');
  const frame = document.querySelector('.frame');
  const namePlate = document.querySelector('.name-plate');
  const nextBtn = document.querySelector('.btn-next');

  // Initial delay waits for the garlands to finish dropping (1.5s total)
  let delay = 1500; 

  // 3. Animate Text (letter by letter)
  const animateText = (spans, startTime) => {
    spans.forEach((span, i) => {
      setTimeout(() => {
        span.style.transition = 'opacity 0.4s, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        span.style.opacity = '1';
        span.style.transform = 'translateY(0) scale(1)';
      }, startTime + (i * 100));
    });
    return startTime + (spans.length * 100);
  };

  delay = animateText(happySpans, delay);
  delay += 200; // gap between words
  delay = animateText(birthdaySpans, delay);

  // Date pill appears alongside the text completion
  setTimeout(() => {
    datePill.style.transition = 'opacity 0.5s, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    datePill.style.opacity = '1';
    datePill.style.transform = 'translateY(0)';
  }, delay);

  // 4. Birthday cap falls
  delay += 400;
  setTimeout(() => {
    cap.style.animation = 'dropCap 0.8s forwards cubic-bezier(0.5, 0, 0.3, 1.5)';
  }, delay);

  // 5. Bear and frame appears (pop in)
  delay += 600;
  setTimeout(() => {
    frame.style.animation = 'popIn 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Show balloons smoothly upwards
    const balloons = document.querySelectorAll('.balloon');
    balloons.forEach(b => b.classList.add('show'));
    
    // Name plate pops in shortly after the bear frame
    setTimeout(() => {
      namePlate.style.transition = 'opacity 0.5s, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      namePlate.style.opacity = '1';
      namePlate.style.transform = 'translateY(0)';
    }, 400);
  }, delay);

  // 6. Next button
  delay += 1200;
  setTimeout(() => {
    nextBtn.classList.add('visible');
  }, delay);

  // Next button click (Placeholder until next instruction)
  nextBtn.addEventListener('click', () => {
    console.log("Next clicked! Ready for the next instruction.");
  });
});
