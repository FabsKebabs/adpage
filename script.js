
particlesJS('particles-js', {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: '#00ffff'
    },
    shape: {
      type: 'circle'
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: true,
        speed: 2,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#00ffff',
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 3,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: {
        enable: true,
        rotateX: 600,
        rotateY: 1200
      }
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: true,
        mode: 'grab'
      },
      onclick: {
        enable: true,
        mode: 'push'
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 200,
        line_linked: {
          opacity: 0.8
        }
      },
      push: {
        particles_nb: 4
      }
    }
  },
  retina_detect: true
});

// Add cursor tracking effect
document.addEventListener('mousemove', (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  
  document.body.style.background = `
    linear-gradient(
      135deg,
      rgba(15, 15, 31, 1) 0%,
      rgba(31, 31, 63, 1) 50%,
      rgba(${x * 20 + 15}, ${y * 20 + 15}, ${Math.max(31, x * y * 50)}, 1) 100%
    )
  `;
});

document.querySelector('.cyber-button').addEventListener('click', () => {
});

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Navigation and button functionality
document.addEventListener('DOMContentLoaded', () => {
  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.textContent.toLowerCase();
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

// Subscribe button
const subscribeBtn = document.querySelector('#channel .cyber-button');
if (subscribeBtn) {
  subscribeBtn.addEventListener('click', () => {
    window.open('https://www.youtube.com/@PubzyD', '_blank'); // Open YouTube channel in a new tab
  });
}

  // Giveaway button
  const giveawayBtn = document.querySelector('.cta-section .cyber-button');
  if (giveawayBtn) {
    giveawayBtn.addEventListener('click', () => {
    });
  }
});

// Redirect from /congrats.html to /congrats
if (window.location.pathname === "/congrats.html") {
  window.location.replace("/congrats");
}

if (window.location.pathname === "/index.html") {
  window.location.replace("/");
}
