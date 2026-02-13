/**
 * Lucy Club - Main Application
 * Carousel with loop and mobile fix
 */

// ==================== CAROUSEL STATE ====================
let currentPosition = 0;
let activeCategory = null;
let isDragging = false;
let startX = 0;
let startY = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let dragDistance = 0;

// Get enabled categories only
function getEnabledCategories() {
    return Object.entries(menuData)
        .filter(([key, cat]) => cat.enabled)
        .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
}

const TOTAL_ITEMS = () => getEnabledCategories().length;

// ==================== HELPER FUNCTIONS ====================
function getContainerWidth() {
    const container = document.getElementById('carouselContainer');
    if (!container) return 320;
    return container.offsetWidth;
}

function getItemWidth() {
    const containerWidth = getContainerWidth();
    return containerWidth - 32; // container width minus padding (16px each side)
}

function getTrackOffset() {
    return getItemWidth() + 16; // item width + gap
}

function getPositionX(e) {
    return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
}

function getPositionY(e) {
    return e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
}

// ==================== BUILD CAROUSEL ====================
function buildCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicatorsContainer = document.getElementById('carouselIndicators');
    
    if (!track || !indicatorsContainer) return;
    
    track.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    const categories = getEnabledCategories();

    categories.forEach(([key, cat], index) => {
        // Count enabled drinks
        const enabledDrinks = cat.drinks.filter(d => d.enabled).length;
        
        // Create card
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.category = key;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="category-card-header">
                <div class="category-icon-container">
                    <span class="category-icon">${cat.icon}</span>
                </div>
            </div>
            <div class="category-card-content">
                <div class="category-name">${cat.name}</div>
                <p class="category-description">${cat.description}</p>
                <div class="category-count">${enabledDrinks} items</div>
            </div>
        `;
        track.appendChild(card);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'carousel-indicator' + (index === 0 ? ' active' : '');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });

    // Initial setup
    currentPosition = 0;
    updateCardWidths();
    updateCarousel(false);
    setupEventListeners();
    setupCardTiltEffect();
}

function updateCardWidths() {
    const itemWidth = getItemWidth();
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(card => {
        card.style.width = `${itemWidth}px`;
    });
}

// ==================== CARD 3D TILT EFFECT ====================
function setupCardTiltEffect() {
    const cards = document.querySelectorAll('.category-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.setProperty('--rot-x', `${rotateX}deg`);
            card.style.setProperty('--rot-y', `${rotateY}deg`);
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rot-x', '0deg');
            card.style.setProperty('--rot-y', '0deg');
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => moveCarousel(-1));
    nextBtn.addEventListener('click', () => moveCarousel(1));

    track.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', () => {
        if (isDragging) dragEnd();
    });

    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('touchmove', dragMove, { passive: false });
    track.addEventListener('touchend', dragEnd);
    track.addEventListener('touchcancel', dragEnd);

    track.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', handleKeyboard);
}

// ==================== DRAG FUNCTIONS ====================
function dragStart(e) {
    isDragging = true;
    dragDistance = 0;
    startX = getPositionX(e);
    startY = getPositionY(e);
    prevTranslate = currentTranslate;
    
    const track = document.getElementById('carouselTrack');
    if (track) track.classList.add('dragging');
}

function dragMove(e) {
    if (!isDragging) return;
    
    const currentX = getPositionX(e);
    const currentY = getPositionY(e);
    const diffX = currentX - startX;
    const diffY = currentY - startY;
    
    dragDistance = Math.abs(diffX);
    
    if (Math.abs(diffX) > Math.abs(diffY) && e.type === 'touchmove') {
        e.preventDefault();
    }
    
    currentTranslate = prevTranslate + diffX;
    
    const track = document.getElementById('carouselTrack');
    if (track) track.style.transform = `translateX(${currentTranslate}px)`;
}

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const track = document.getElementById('carouselTrack');
    if (track) track.classList.remove('dragging');
    
    const movedBy = currentTranslate - prevTranslate;
    const total = TOTAL_ITEMS();
    const threshold = getItemWidth() * 0.2; // 20% of card width
    
    // If minimal movement, treat as a click/tap
    if (dragDistance < 10) {
        if (e && e.target) {
            const clickedCard = e.target.closest('.category-card');
            if (clickedCard) {
                const categoryKey = clickedCard.dataset.category;
                selectCategory(categoryKey, clickedCard);
            }
        }
        updateCarousel(true);
        return;
    }
    
    // Determine swipe direction with loop support
    if (movedBy < -threshold) {
        // Swipe left - go next
        currentPosition++;
        if (currentPosition >= total) {
            currentPosition = 0; // Loop to first
        }
    } else if (movedBy > threshold) {
        // Swipe right - go previous
        currentPosition--;
        if (currentPosition < 0) {
            currentPosition = total - 1; // Loop to last
        }
    }
    
    updateCarousel(true);
}

// ==================== CAROUSEL NAVIGATION ====================
function moveCarousel(direction) {
    const total = TOTAL_ITEMS();
    
    currentPosition += direction;
    
    // Loop logic
    if (currentPosition >= total) {
        currentPosition = 0; // Loop to first
    } else if (currentPosition < 0) {
        currentPosition = total - 1; // Loop to last
    }
    
    updateCarousel(true);
}

function goToSlide(index) {
    currentPosition = index;
    updateCarousel(true);
}

function updateCarousel(animate = true) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const trackOffset = getTrackOffset();
    const total = TOTAL_ITEMS();
    
    // Calculate exact position
    currentTranslate = -currentPosition * trackOffset;
    
    if (animate) {
        track.classList.remove('dragging');
    }
    
    track.style.transform = `translateX(${currentTranslate}px)`;

    // Update card 3D effects
    const cards = track.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        const distance = index - currentPosition;
        const rotateY = distance * -25;
        const scale = Math.abs(distance) === 0 ? 1 : 0.85;
        const opacity = Math.abs(distance) > 1 ? 0.4 : 1;
        
        card.style.transform = `rotateY(${rotateY}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = 10 - Math.abs(distance);
    });

    // Update indicators
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === currentPosition);
    });

    // Update navigation buttons - always enabled for loop
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
}

// ==================== CATEGORY SELECTION ====================
function selectCategory(key, cardElement) {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    
    if (cardElement) {
        cardElement.classList.add('active');
    }
    
    activeCategory = key;
    renderDrinks(key);
    
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            const drinksSection = document.getElementById('drinksSection');
            if (drinksSection) {
                drinksSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }
}

function renderDrinks(key) {
    const section = document.getElementById('drinksSection');
    if (!section) return;
    
    const cat = menuData[key];
    if (!cat) return;

    // Filter enabled drinks only
    const enabledDrinks = cat.drinks.filter(d => d.enabled);

    let drinksHTML = `
        <div class="drinks-header">
            <div class="drinks-header-line"></div>
            <h3>${cat.icon} ${cat.name}</h3>
            <div class="drinks-header-line"></div>
        </div>
        <div class="drinks-grid">
    `;

    enabledDrinks.forEach(drink => {
        let tagsHTML = '';
        if (drink.tags) {
            drink.tags.forEach(tag => {
                let cls = 'drink-tag';
                if (tag === 'popular') cls += ' popular';
                if (tag === 'new') cls += ' new';
                if (tag === 'premium') cls += ' premium';
                if (tag === 'signature') cls += ' signature';
                const label = tag.charAt(0).toUpperCase() + tag.slice(1);
                tagsHTML += `<span class="${cls}">${label}</span>`;
            });
        }

        drinksHTML += `
            <div class="drink-item">
                <div class="drink-top">
                    <div class="drink-name">${drink.name}</div>
                    <div class="drink-price">${drink.price}</div>
                </div>
                <div class="drink-description">${drink.desc || ''}</div>
                ${tagsHTML ? `<div class="drink-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
    });

    drinksHTML += '</div>';
    section.innerHTML = drinksHTML;
}

// ==================== KEYBOARD NAVIGATION ====================
function handleKeyboard(e) {
    if (e.key === 'ArrowLeft') moveCarousel(-1);
    if (e.key === 'ArrowRight') moveCarousel(1);
    if (e.key === 'Enter' && currentPosition >= 0 && currentPosition < TOTAL_ITEMS()) {
        const categories = getEnabledCategories();
        const key = categories[currentPosition][0];
        const card = document.querySelector(`[data-category="${key}"]`);
        selectCategory(key, card);
    }
}

// ==================== MODE TOGGLE ====================
function toggleMode() {
    const html = document.documentElement;
    const thumb = document.getElementById('toggleThumb');
    const label = document.getElementById('toggleLabel');

    if (html.dataset.mode === 'night') {
        html.dataset.mode = 'day';
        if (thumb) thumb.textContent = '☀️';
        if (label) label.textContent = 'Day Mode';
    } else {
        html.dataset.mode = 'night';
        if (thumb) thumb.textContent = '🌙';
        if (label) label.textContent = 'Night Mode';
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', buildCarousel);

// Rebuild on resize with debounce
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateCardWidths();
        updateCarousel(false);
    }, 150);
});

// Recalculate on orientation change (mobile)
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        updateCardWidths();
        updateCarousel(false);
    }, 300);
});