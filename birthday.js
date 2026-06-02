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
    console.log("Next clicked! Ready for the next instruction.");
  });
});
