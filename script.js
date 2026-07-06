// script.js
// Rendering, filtering, WhatsApp booking links, and slider-compatible animations


const WHATSAPP_NUMBER = "917061222617"; 

function getActiveContainer() {
  return document.getElementById('allListingsContainer') || document.getElementById('listingsContainer');
}

function isHomePage() {
  return !!document.getElementById('listingsContainer');
}

function buildStarRating(rating) {
  const fullStars = Math.round(rating);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= fullStars ? '★' : '☆';
  }
  return `<span class="star-rating">${stars} <span class="rating-number">${rating.toFixed(1)}</span></span>`;
}

function buildWhatsAppLink(listing) {
  const message = `Hi! I'm interested in "${listing.title}" (${listing.location}, Rs.${listing.price}/mo) that I saw on Unwize. Please share more details.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildCardHTML(listing) {
  const genderClass = listing.gender === 'Girls' ? 'girls' : 'boys';
  const amenitiesHTML = listing.amenities
    .map(a => `<span class="amenity">${a}</span>`)
    .join('');
  const verifiedBadge = listing.verified
    ? `<span class="verified-badge">✓ Verified</span>`
    : '';

  return `
    <div class="house-card reveal">
      <div class="img-box">
        <img src="${listing.image}" alt="${listing.title}" loading="lazy">
        <div class="price-tag">₹${listing.price.toLocaleString('en-IN')}/mo</div>
        ${verifiedBadge}
      </div>
      <div class="house-details">
        <span class="gender-badge ${genderClass}">${listing.gender} PG</span>
        ${buildStarRating(listing.rating || 4.2)}
        <h3 class="house-title">${listing.title}</h3>
        <p class="loc-campus">${listing.location} • ${listing.campus}</p>
        <div class="amenities-list">${amenitiesHTML}</div>
        <a href="${buildWhatsAppLink(listing)}" target="_blank" rel="noopener noreferrer" class="btn-house-call">
          Contact on WhatsApp
        </a>
      </div>
    </div>
  `;
}

function renderListings(listings) {
  const container = getActiveContainer();
  if (!container) return;

  if (!isHomePage()) updateResultsCount(listings.length);

  if (listings.length === 0) {
    container.innerHTML = `<p style="color:#94a3b8; width: 100%; text-align:center; padding: 40px 0;">
      No PGs or flats match your filters right now. Try adjusting your search.
    </p>`;
    return;
  }

  container.innerHTML = listings.map(buildCardHTML).join('');

  requestAnimationFrame(() => {
    initScrollReveal();
  });
}

function getFilterValues() {
  const budget = document.getElementById('budgetSelect')?.value || 'all';
  const location = document.getElementById('locationSelect')?.value || 'all';
  const roomType = document.getElementById('roomSelect')?.value || 'all';
  const gender = document.getElementById('genderSelect')?.value || 'all';
  return { budget, location, roomType, gender };
}

function applyHousingFilters() {
  const { budget, location, roomType, gender } = getFilterValues();

  let filtered = housingListings.filter(listing => {
    const withinBudget = budget === 'all' || listing.price <= Number(budget);
    const matchesLocation = location === 'all' || listing.location === location;
    const matchesRoom = roomType === 'all' || listing.roomType === roomType;
    const matchesGender = gender === 'all' || listing.gender === gender;

    return withinBudget && matchesLocation && matchesRoom && matchesGender;
  });

  renderListings(filtered);
}

/* ---------------- SCROLL REVEAL ANIMATIONS ---------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  revealEls.forEach(el => observer.observe(el));
}

/* ---------------- STICKY NAVBAR SHADOW ON SCROLL ---------------- */
function initNavbarScrollEffect() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

/* ---------------- ANIMATED STAT COUNTERS ---------------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10) || 0;
  const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '+';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    el.textContent = value + (progress === 1 ? suffix : '');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => observer.observe(c));
}

/* ---------------- FAQ ACCORDION ---------------- */
function toggleFaq(questionEl) {
  const item = questionEl.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-answer').style.maxHeight = null;
    }
  });

  if (isOpen) {
    item.classList.remove('open');
    answer.style.maxHeight = null;
  } else {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

/* ---------------- RESULTS COUNTER (listings page) ---------------- */
function updateResultsCount(count) {
  const el = document.getElementById('resultsCount');
  if (!el) return;
  el.textContent = `${count} verified ${count === 1 ? 'stay' : 'stays'} found`;
}

/* ---------------- HOW-IT-WORKS CARD TILT EFFECT ---------------- */
function initCardTilt() {
  const card = document.querySelector('.how-it-works-card');
  if (!card || window.matchMedia('(pointer: coarse)').matches) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  });
}

/* ---------------- HOME LISTINGS AUTO SCROLL ---------------- */

function initListingsAutoScroll() {
  const container = document.getElementById('listingsContainer');

  // Sirf home page par chalega
  if (!container) return;

  let isPaused = false;
  const scrollSpeed = 1;

  function autoScroll() {
    if (!isPaused) {
      container.scrollLeft += scrollSpeed;

      // End par pahunchne par beginning se start
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - 1
      ) {
        container.scrollLeft = 0;
      }
    }

    requestAnimationFrame(autoScroll);
  }

  // Mouse hover par pause
  container.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  container.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Mobile touch par pause
  container.addEventListener('touchstart', () => {
    isPaused = true;
  });

  container.addEventListener('touchend', () => {
    isPaused = false;
  });

  requestAnimationFrame(autoScroll);
}

/* ---------------- DYNAMIC CUSTOM SELECT DROPDOWNS ---------------- */
function initCustomDropdowns() {
  const selects = document.querySelectorAll('.filter-item select');
  
  selects.forEach(select => {
    if (select.dataset.customized === 'true') return;
    select.dataset.customized = 'true';
    
    // Hide native select
    select.style.display = 'none';
    
    // Create container wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select); // move select inside wrapper
    
    // Create trigger button
    const trigger = document.createElement('div');
    trigger.className = 'select-trigger';
    const selectedOption = select.options[select.selectedIndex];
    trigger.innerHTML = `<span>${selectedOption.textContent}</span><span class="chevron">&#9662;</span>`;
    wrapper.appendChild(trigger);
    
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'select-options';
    
    // Populate options
    Array.from(select.options).forEach(opt => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option';
      if (opt.value === select.value) optionEl.classList.add('selected');
      optionEl.textContent = opt.textContent;
      optionEl.dataset.value = opt.value;
      
      optionEl.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove selected class from sibling options
        optionsContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        optionEl.classList.add('selected');
        
        // Update trigger text
        trigger.querySelector('span').textContent = opt.textContent;
        
        // Update hidden select and trigger change event
        select.value = opt.value;
        select.dispatchEvent(new Event('change'));
        
        // Close dropdown
        wrapper.classList.remove('open');
      });
      
      optionsContainer.appendChild(optionEl);
    });
    
    wrapper.appendChild(optionsContainer);
    
    // Toggle dropdown open state
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close all other dropdowns
      document.querySelectorAll('.custom-select.open').forEach(openSelect => {
        if (openSelect !== wrapper) openSelect.classList.remove('open');
      });
      
      wrapper.classList.toggle('open');
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select.open').forEach(openSelect => {
      openSelect.classList.remove('open');
    });
  });
}

/* ---------------- INIT ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  initCustomDropdowns();
  applyHousingFilters();
  initScrollReveal();
  initNavbarScrollEffect();
  initCounters();
  initCardTilt();
  // Disabled auto-scroll to fix scroll-snap conflict and prevent freezing/flickering
});