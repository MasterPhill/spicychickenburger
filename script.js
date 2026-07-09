// ===== SMOOTH SCROLLING ===== 
// This makes links smoothly scroll to sections instead of jumping
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== FADE IN ANIMATION ===== 
// This makes sections fade in as you scroll down
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-in';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Watch all sections for fade-in effect
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// ===== FADE IN KEYFRAME ===== 
// Add the fade-in animation to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== NAVBAR SCROLL EFFECT ===== 
// Makes navbar background slightly darker when you scroll down
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ===== CARD ANIMATION ===== 
// Adds a fun tilt effect when you hover over cards
document.querySelectorAll('.interest-card, .project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

console.log('Welcome to Philip\'s website! 🎉');
