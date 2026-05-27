/**
 * main.js — nav, mobile menu, scroll, animations
 */
document.addEventListener('DOMContentLoaded', () => {

  // Scrolled shadow on nav
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile burger
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      const [s1, , s3] = burger.querySelectorAll('span');
      burger.querySelector('span:nth-child(1)').style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
      burger.querySelector('span:nth-child(2)').style.opacity   = open ? '0' : '';
      burger.querySelector('span:nth-child(3)').style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }));
  }

  // Active nav link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
    if ((a.getAttribute('href') || '') === current) a.classList.add('active');
  });

  // Intersection observer for fade-up animations
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up-1,.fade-up-2,.fade-up-3,.fade-up-4').forEach(el => {
    el.style.animationPlayState = 'paused';
    io.observe(el);
  });

});
