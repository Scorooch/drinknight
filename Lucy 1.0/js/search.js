/**
 * Lucy Club - Smart Drink Search
 * Fuzzy search with bilingual support (English/German)
 */

// ==================== SEARCH INDEX ====================
const searchIndex = [];

// ==================== TEXT NORMALIZATION ====================
function normalize(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ');
}

// ==================== BUILD SEARCH INDEX ====================
function buildSearchIndex() {
    searchIndex.length = 0;
    
    // Index visible menu items
    for (const [categoryKey, category] of Object.entries(menuData)) {
        if (!category.enabled) continue;
        indexCategory(categoryKey, category, false);
    }
    
    // Index hidden drinks
    if (typeof hiddenDrinks !== 'undefined') {
        for (const [categoryKey, category] of Object.entries(hiddenDrinks)) {
            if (!category.enabled) continue;
            indexCategory(categoryKey, category, true);
        }
    }
}

function indexCategory(categoryKey, category, isHidden) {
    category.drinks.forEach(drink => {
        if (!drink.enabled) return;
        
        const searchTerms = [
            normalize(drink.name),
            normalize(category.name),
            normalize(drink.desc || '')
        ];
        
        if (drink.tags) {
            drink.tags.forEach(tag => {
                searchTerms.push(normalize(tag));
                if (searchAliases[tag]) {
                    searchAliases[tag].forEach(alias => searchTerms.push(normalize(alias)));
                }
            });
        }
        
        for (const [key, values] of Object.entries(searchAliases)) {
            const nameAndDesc = (drink.name + ' ' + (drink.desc || '')).toLowerCase();
            if (nameAndDesc.includes(key)) {
                values.forEach(v => searchTerms.push(normalize(v)));
            }
            values.forEach(alias => {
                if (nameAndDesc.includes(alias)) {
                    searchTerms.push(normalize(key));
                }
            });
        }
        
        searchIndex.push({
            id: drink.id,
            name: drink.name,
            price: drink.price,
            description: drink.desc || '',
            category: category.name,
            categoryKey: categoryKey,
            categoryIcon: category.icon,
            tags: drink.tags || [],
            searchTerms: searchTerms.join(' '),
            isHidden: isHidden
        });
    });
}

// ==================== LEVENSHTEIN DISTANCE ====================
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
}

function similarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

// ==================== SEARCH FUNCTION ====================
function searchDrinks(query) {
    const normalizedQuery = normalize(query);
    
    if (!normalizedQuery || normalizedQuery.length < 2) {
        return [];
    }
    
    const results = [];
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
    
    searchIndex.forEach(item => {
        let score = 0;
        const itemTerms = item.searchTerms;
        const normalizedName = normalize(item.name);
        
        if (normalizedName.includes(normalizedQuery)) {
            score += 100;
            if (normalizedName.startsWith(normalizedQuery)) {
                score += 50;
            }
        }
        
        queryWords.forEach(word => {
            if (word.length < 2) return;
            
            if (itemTerms.includes(word)) {
                score += 30;
            }
            
            const nameWords = normalizedName.split(' ');
            nameWords.forEach(nameWord => {
                if (nameWord.startsWith(word)) {
                    score += 25;
                } else {
                    const sim = similarity(word, nameWord);
                    if (sim > 0.7) {
                        score += sim * 20;
                    }
                }
            });
            
            if (itemTerms.includes(word) || itemTerms.indexOf(word) > -1) {
                score += 15;
            }
        });
        
        const nameSimilarity = similarity(normalizedQuery, normalizedName);
        if (nameSimilarity > 0.5) {
            score += nameSimilarity * 40;
        }
        
        if (score > 10) {
            results.push({ ...item, score: score });
        }
    });
    
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 5);
}

// ==================== UI FUNCTIONS ====================
let searchTimeout = null;
const SEARCH_DELAY = 150;

function initSearch() {
    buildSearchIndex();
    
    const searchInput = document.getElementById('drinkSearch');
    const clearBtn = document.getElementById('clearSearch');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    // Input event with debounce
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        
        // Show/hide clear button
        clearBtn.classList.toggle('visible', query.length > 0);
        
        // Debounce search
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            hideResults();
            return;
        }
        
        // Show loading
        showTypingIndicator();
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, SEARCH_DELAY);
    });
    
    // Clear button
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('visible');
        hideResults();
        searchInput.focus();
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearBtn.classList.remove('visible');
            hideResults();
        }
    });
}

function showTypingIndicator() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    resultsContainer.classList.add('active');
}

function performSearch(query) {
    const results = searchDrinks(query);
    displayResults(results, query);
}

function displayResults(results, query) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p class="no-results-text">Keine Ergebnisse für "${query}"</p>
                <p class="no-results-suggestion">Versuchen Sie es mit einem anderen Begriff</p>
            </div>
        `;
        resultsContainer.classList.add('active');
        return;
    }
    
    const html = results.map(item => {
        const highlightedName = highlightMatch(item.name, query);
        const secretBadge = item.isHidden ? '<span class="secret-badge">🤫 Secret</span>' : '';
        
        return `
            <div class="result-item ${item.isHidden ? 'secret-item' : ''}" 
                 data-category="${item.categoryKey}" 
                 data-name="${item.name}"
                 data-hidden="${item.isHidden}">
                <div class="result-info">
                    <span class="result-name">${highlightedName}</span>
                    <span class="result-category">${item.categoryIcon} ${item.category} ${secretBadge}</span>
                </div>
                <span class="result-price">${item.price}</span>
            </div>
        `;
    }).join('');
    
    resultsContainer.innerHTML = html;
    resultsContainer.classList.add('active');
    
    resultsContainer.querySelectorAll('.result-item').forEach(item => {
        item.addEventListener('click', () => {
            const categoryKey = item.dataset.category;
            const drinkName = item.dataset.name;
            const isHidden = item.dataset.hidden === 'true';
            
            if (isHidden) {
                showSecretDrinkPopup(searchIndex.find(d => d.name === drinkName));
                return;
            }
            
            const categories = getEnabledCategories();
            const categoryIndex = categories.findIndex(([key]) => key === categoryKey);
            
            if (categoryIndex !== -1) {
                currentPosition = categoryIndex;
                updateCarousel(true);
                
                const card = document.querySelector(`[data-category="${categoryKey}"]`);
                if (card) {
                    selectCategory(categoryKey, card);
                    
                    setTimeout(() => {
                        document.getElementById('drinksSection').scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        setTimeout(() => {
                            highlightDrinkItem(drinkName);
                        }, 600);
                    }, 100);
                }
            }
        });
    });
}

function highlightMatch(text, query) {
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase().trim();
    
    const index = normalizedText.indexOf(normalizedQuery);
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + normalizedQuery.length);
    const after = text.substring(index + normalizedQuery.length);
    
    return `${before}<span class="match-highlight">${match}</span>${after}`;
}

function highlightDrinkItem(drinkName) {
    const drinkItems = document.querySelectorAll('.drink-item');
    drinkItems.forEach(item => {
        const nameEl = item.querySelector('.drink-name');
        if (nameEl && nameEl.textContent.trim() === drinkName) {
            item.style.animation = 'none';
            item.offsetHeight;
            item.style.animation = 'highlightPulse 1.5s ease';
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

function hideResults() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.classList.remove('active');
    setTimeout(() => {
        resultsContainer.innerHTML = '';
    }, 300);
}

// ==================== SECRET DRINK POPUP ====================
function showSecretDrinkPopup(drink) {
    const existingPopup = document.querySelector('.secret-popup-overlay');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.className = 'secret-popup-overlay';
    popup.innerHTML = `
        <div class="secret-popup">
            <button class="secret-popup-close" onclick="closeSecretPopup()">✕</button>
            
            <div class="secret-popup-header">
                <span class="secret-popup-icon">🤫</span>
                <h3 class="secret-popup-title">Secret Menu Item</h3>
            </div>
            
            <div class="secret-popup-content">
                <div class="secret-drink-name">${drink.name}</div>
                <div class="secret-drink-category">${drink.categoryIcon} ${drink.category}</div>
                <div class="secret-drink-price">${drink.price}</div>
                <p class="secret-drink-desc">${drink.description}</p>
                ${drink.tags.length > 0 ? `
                    <div class="secret-drink-tags">
                        ${drink.tags.map(tag => `<span class="drink-tag ${tag}">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="secret-popup-footer">
                <p class="secret-hint">💡 Ask our bartender for this special drink!</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    requestAnimationFrame(() => {
        popup.classList.add('active');
    });
    
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closeSecretPopup();
        }
    });
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeSecretPopup();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeSecretPopup() {
    const popup = document.querySelector('.secret-popup-overlay');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSearch, 100);
});