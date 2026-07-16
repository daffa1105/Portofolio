// script.js
   AOS.init({
      duration: 800,
      once: true
    });

    // Mobile menu toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.innerHTML = navLinks.classList.contains('active')
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });

    // Typewriter effect
    const typewriterElement = document.getElementById('typewriter');
    const phrases = [
      "Junior Front end Developer",
      "Quick Learner",
      "Team Player"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isEnd = false;

    function typeWriter() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isEnd = true;
        isDeleting = true;
        setTimeout(typeWriter, 1500);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeWriter, 500);
      } else {
        const speed = isDeleting ? 50 : 100;
        setTimeout(typeWriter, speed);
      }
    }

    // Start the typewriter effect
    setTimeout(typeWriter, 1000);

    // PT. Otomedia manual image carousel
    const otomediaCarousel = document.querySelector('.project-image-carousel');
    const otomediaPrevBtn = document.querySelector('.carousel-btn-prev');
    const otomediaNextBtn = document.querySelector('.carousel-btn-next');

    if (otomediaCarousel && otomediaPrevBtn && otomediaNextBtn) {
      let otomediaIndex = 0;
      const otomediaSlides = otomediaCarousel.querySelectorAll('.project-image-slide');

      function updateOtomediaCarousel() {
        otomediaCarousel.style.transform = `translateX(-${otomediaIndex * 50}%)`;
      }

      otomediaPrevBtn.addEventListener('click', () => {
        otomediaIndex = (otomediaIndex - 1 + otomediaSlides.length) % otomediaSlides.length;
        updateOtomediaCarousel();
      });

      otomediaNextBtn.addEventListener('click', () => {
        otomediaIndex = (otomediaIndex + 1) % otomediaSlides.length;
        updateOtomediaCarousel();
      });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
         const href = this.getAttribute('href');
    if (href.startsWith('#') && href.length > 1) { 
      e.preventDefault();
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
