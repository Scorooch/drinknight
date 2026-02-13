/**
 * Lucy Club - Admin Panel
 * Complete admin functionality
 */

// ==================== STATE MANAGEMENT ====================
let isLoggedIn = false;
let currentSection = 'categories';
let editingItem = null;
let editingType = null;

// Working copy of data (to track changes)
let workingMenuData = {};
let workingHiddenDrinks = {};

// Undo/Redo system
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in (session)
    const session = localStorage.getItem('lucyAdminSession');
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.expiry > Date.now()) {
            isLoggedIn = true;
            showDashboard();
        } else {
            localStorage.removeItem('lucyAdminSession');
        }
    }
    
    // Initialize working data copies
    initializeWorkingData();
    
    // Setup login form
    setupLoginForm();
    
    // Setup navigation
    setupNavigation();
    
    // Setup filters
    setupFilters();
});

function initializeWorkingData() {
    workingMenuData = JSON.parse(JSON.stringify(menuData));
    workingHiddenDrinks = JSON.parse(JSON.stringify(hiddenDrinks));
    saveToHistory();
}

// ==================== LOGIN SYSTEM ====================
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        // Check credentials
        if (username === adminConfig.username && password === adminConfig.password) {
            // Create session (24 hours)
            const session = {
                user: username,
                expiry: Date.now() + (24 * 60 * 60 * 1000)
            };
            localStorage.setItem('lucyAdminSession', JSON.stringify(session));
            
            isLoggedIn = true;
            showDashboard();
            showToast('Welcome back! 👋', 'success');
        } else {
            errorDiv.textContent = '❌ Invalid username or password';
            document.getElementById('password').value = '';
        }
    });
}

function showDashboard() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    renderCurrentSection();
}

function logout() {
    localStorage.removeItem('lucyAdminSession');
    isLoggedIn = false;
    location.reload();
}

// ==================== NAVIGATION ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Update active state
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Show section
            currentSection = section;
            renderCurrentSection();
            
            // Update title
            updateSectionTitle(section);
        });
    });
}

function updateSectionTitle(section) {
    const titles = {
        categories: { title: 'Categories', subtitle: 'Manage your menu categories' },
        drinks: { title: 'All Drinks', subtitle: 'View and edit all drinks' },
        hidden: { title: 'Hidden Menu', subtitle: 'Secret drinks only visible in search' },
        tags: { title: 'Tags', subtitle: 'Manage and organize your drink tags' },
        settings: { title: 'Settings', subtitle: 'Configure your menu' },
        export: { title: 'Export & Import', subtitle: 'Backup and restore your data' }
    };
    
    const info = titles[section] || { title: section, subtitle: '' };
    document.getElementById('sectionTitle').textContent = info.title;
    document.getElementById('sectionSubtitle').textContent = info.subtitle;
}

function renderCurrentSection() {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show current section
    const currentSectionEl = document.getElementById(`section-${currentSection}`);
    if (currentSectionEl) {
        currentSectionEl.classList.add('active');
    }
    
    // Render content
    switch (currentSection) {
        case 'categories':
            renderCategories();
            break;
        case 'drinks':
            renderDrinksTable();
            break;
        case 'hidden':
            renderHiddenDrinks();
            break;
        case 'tags':
            renderTagsSection();
            break;
    }
}

// ==================== CATEGORIES MANAGEMENT ====================
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    // Sort by order
    const sortedCategories = Object.entries(workingMenuData)
        .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
    
    grid.innerHTML = sortedCategories.map(([key, cat]) => {
        const enabledDrinks = cat.drinks.filter(d => d.enabled).length;
        const totalDrinks = cat.drinks.length;
        
        return `
            <div class="category-card-admin ${!cat.enabled ? 'disabled' : ''}" 
                 data-category="${key}"
                 draggable="true">
                <div class="category-header-admin">
                    <div class="category-info-admin">
                        <div class="category-icon-admin">${cat.icon}</div>
                        <div class="category-details-admin">
                            <h3>${cat.name}</h3>
                            <p>Order: ${cat.order || 0}</p>
                        </div>
                    </div>
                    <div class="category-toggle ${cat.enabled ? 'active' : ''}" 
                         onclick="toggleCategory('${key}')"></div>
                </div>
                
                <div class="category-stats-admin">
                    <div class="stat-item">
                        <div class="stat-value">${enabledDrinks}</div>
                        <div class="stat-label">Active</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${totalDrinks}</div>
                        <div class="stat-label">Total</div>
                    </div>
                </div>
                
                <div class="category-actions-admin">
                    <button class="cat-action-btn" onclick="editCategory('${key}')">
                        ✏️ Edit
                    </button>
                    <button class="cat-action-btn" onclick="viewCategoryDrinks('${key}')">
                        🍸 Drinks
                    </button>
                    <button class="cat-action-btn danger" onclick="deleteCategory('${key}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Setup drag & drop
    setupCategoryDragDrop();
}

function toggleCategory(key) {
    workingMenuData[key].enabled = !workingMenuData[key].enabled;
    saveToHistory();
    renderCategories();
    showToast(`Category ${workingMenuData[key].enabled ? 'enabled' : 'disabled'}`, 'success');
}

function editCategory(key) {
    const cat = workingMenuData[key];
    editingItem = key;
    editingType = 'category';
    
    document.getElementById('modalTitle').textContent = 'Edit Category';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Category Name</label>
            <input type="text" id="editCatName" value="${cat.name}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Icon (Emoji)</label>
                <input type="text" id="editCatIcon" value="${cat.icon}">
            </div>
            <div class="form-group">
                <label>Order</label>
                <input type="number" id="editCatOrder" value="${cat.order || 0}">
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editCatDesc">${cat.description || ''}</textarea>
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = saveCategory;
    openModal();
}

function saveCategory() {
    const name = document.getElementById('editCatName').value;
    const icon = document.getElementById('editCatIcon').value;
    const order = parseInt(document.getElementById('editCatOrder').value) || 0;
    const description = document.getElementById('editCatDesc').value;
    
    if (!name) {
        showToast('Name is required', 'error');
        return;
    }
    
    workingMenuData[editingItem].name = name;
    workingMenuData[editingItem].icon = icon;
    workingMenuData[editingItem].order = order;
    workingMenuData[editingItem].description = description;
    
    saveToHistory();
    closeModal();
    renderCategories();
    showToast('Category updated! ✅', 'success');
}

function addCategory() {
    editingItem = null;
    editingType = 'category';
    
    document.getElementById('modalTitle').textContent = 'Add Category';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Category Key (lowercase, no spaces)</label>
            <input type="text" id="editCatKey" placeholder="e.g. cocktails">
        </div>
        <div class="form-group">
            <label>Category Name</label>
            <input type="text" id="editCatName" placeholder="e.g. Cocktails">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Icon (Emoji)</label>
                <input type="text" id="editCatIcon" value="🍸">
            </div>
            <div class="form-group">
                <label>Order</label>
                <input type="number" id="editCatOrder" value="${Object.keys(workingMenuData).length + 1}">
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editCatDesc" placeholder="Category description..."></textarea>
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = saveNewCategory;
    openModal();
}

function saveNewCategory() {
    const key = document.getElementById('editCatKey').value.toLowerCase().replace(/\s+/g, '_');
    const name = document.getElementById('editCatName').value;
    const icon = document.getElementById('editCatIcon').value || '🍸';
    const order = parseInt(document.getElementById('editCatOrder').value) || 0;
    const description = document.getElementById('editCatDesc').value;
    
    if (!key || !name) {
        showToast('Key and Name are required', 'error');
        return;
    }
    
    if (workingMenuData[key]) {
        showToast('Category key already exists', 'error');
        return;
    }
    
    workingMenuData[key] = {
        name,
        icon,
        description,
        enabled: true,
        order,
        drinks: []
    };
    
    saveToHistory();
    closeModal();
    renderCategories();
    showToast('Category added! ✅', 'success');
}

function deleteCategory(key) {
    if (!confirm(`Delete category "${workingMenuData[key].name}"?\n\nThis will delete all drinks in this category!`)) {
        return;
    }
    
    delete workingMenuData[key];
    saveToHistory();
    renderCategories();
    showToast('Category deleted', 'warning');
}

function viewCategoryDrinks(key) {
    // Switch to drinks section with filter
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-section="drinks"]').classList.add('active');
    currentSection = 'drinks';
    updateSectionTitle('drinks');
    renderCurrentSection();
    
    // Set filter
    document.getElementById('categoryFilter').value = key;
    filterDrinks();
}

// Drag & Drop for categories
function setupCategoryDragDrop() {
    const cards = document.querySelectorAll('.category-card-admin');
    let draggedEl = null;
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedEl = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedEl = null;
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedEl && draggedEl !== card) {
                const rect = card.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    card.parentNode.insertBefore(draggedEl, card);
                } else {
                    card.parentNode.insertBefore(draggedEl, card.nextSibling);
                }
            }
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            updateCategoryOrder();
        });
    });
}

function updateCategoryOrder() {
    const cards = document.querySelectorAll('.category-card-admin');
    cards.forEach((card, index) => {
        const key = card.dataset.category;
        workingMenuData[key].order = index + 1;
    });
    saveToHistory();
    showToast('Order updated', 'success');
}

// ==================== DRINKS TABLE ====================
function renderDrinksTable() {
    const tbody = document.getElementById('drinksTableBody');
    const categorySelect = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('drinkFilter');
    
    if (!tbody || !categorySelect) return;
    
    // ⭐ اول مقادیر فیلتر رو بخون قبل از اینکه select رو دوباره بسازی
    const searchTerm = searchInput?.value?.toLowerCase() || '';
    const categoryFilter = categorySelect.value || '';
    
    // Populate category filter و حفظ مقدار انتخاب شده
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    Object.entries(workingMenuData).forEach(([key, cat]) => {
        const isSelected = key === categoryFilter ? 'selected' : '';
        categorySelect.innerHTML += `<option value="${key}" ${isSelected}>${cat.icon} ${cat.name}</option>`;
    });
    
    // Get drinks based on filter
    let allDrinks = [];
    
    // ⭐ اگه کتگوری انتخاب شده، فقط همون رو نشون بده
    if (categoryFilter && workingMenuData[categoryFilter]) {
        const cat = workingMenuData[categoryFilter];
        cat.drinks.forEach((drink, index) => {
            allDrinks.push({
                ...drink,
                categoryKey: categoryFilter,
                categoryName: cat.name,
                categoryIcon: cat.icon,
                originalIndex: index
            });
        });
    } else {
        // همه کتگوری‌ها
        Object.entries(workingMenuData).forEach(([catKey, cat]) => {
            if (!cat) return;
            cat.drinks.forEach((drink, index) => {
                allDrinks.push({
                    ...drink,
                    categoryKey: catKey,
                    categoryName: cat.name,
                    categoryIcon: cat.icon,
                    originalIndex: index
                });
            });
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        allDrinks = allDrinks.filter(d => 
            d.name.toLowerCase().includes(searchTerm) ||
            d.desc?.toLowerCase().includes(searchTerm) ||
            (d.tags || []).some(t => t.toLowerCase().includes(searchTerm))
        );
    }
    
    // اگه نوشیدنی‌ای نبود
    if (allDrinks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
                    🔍 No drinks found
                </td>
            </tr>
        `;
        return;
    }
    
    // Render table
    tbody.innerHTML = allDrinks.map((drink, index) => `
        <tr class="${!drink.enabled ? 'disabled' : ''}" 
            data-id="${drink.id}" 
            data-category="${drink.categoryKey}"
            data-index="${drink.originalIndex}"
            draggable="true">
            <td class="drag-handle" title="Drag to reorder">⋮⋮</td>
            <td>
                <div class="drink-status ${drink.enabled ? '' : 'inactive'}"></div>
            </td>
            <td class="drink-name-cell">
                ${drink.name}
                <span>${drink.desc || ''}</span>
            </td>
            <td>${drink.categoryIcon} ${drink.categoryName}</td>
            <td>
                <input type="text" class="drink-price-input" 
                       value="${drink.price}" 
                       onchange="updateDrinkPrice('${drink.categoryKey}', '${drink.id}', this.value)">
            </td>
            <td>
                <div class="tags-cell" data-category="${drink.categoryKey}" data-id="${drink.id}">
                    ${(drink.tags || []).map(t => `
                        <span class="mini-tag">
                            ${t}
                            <button onclick="removeTag('${drink.categoryKey}', '${drink.id}', '${t}')" title="Remove">×</button>
                        </span>
                    `).join('')}
                    <button class="add-tag-btn" onclick="showAddTagPopup('${drink.categoryKey}', '${drink.id}', this)" title="Add tag">+</button>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-btn" onclick="toggleDrink('${drink.categoryKey}', '${drink.id}')" 
                            title="${drink.enabled ? 'Disable' : 'Enable'}">
                        ${drink.enabled ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button class="table-btn" onclick="editDrink('${drink.categoryKey}', '${drink.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="table-btn danger" onclick="deleteDrink('${drink.categoryKey}', '${drink.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Setup drag & drop for drinks
    setupDrinksDragDrop();
}

function setupFilters() {
    const drinkFilter = document.getElementById('drinkFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (drinkFilter) {
        drinkFilter.addEventListener('input', debounce(filterDrinks, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterDrinks);
    }
}

function filterDrinks() {
    // فقط جدول رو دوباره رندر کن بدون ریست کردن فیلترها
    const tbody = document.getElementById('drinksTableBody');
    const categorySelect = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('drinkFilter');
    
    if (!tbody || !categorySelect) return;
    
    const searchTerm = searchInput?.value?.toLowerCase() || '';
    const categoryFilter = categorySelect.value || '';
    
    // Get drinks based on filter
    let allDrinks = [];
    
    if (categoryFilter && workingMenuData[categoryFilter]) {
        const cat = workingMenuData[categoryFilter];
        cat.drinks.forEach((drink, index) => {
            allDrinks.push({
                ...drink,
                categoryKey: categoryFilter,
                categoryName: cat.name,
                categoryIcon: cat.icon,
                originalIndex: index
            });
        });
    } else {
        Object.entries(workingMenuData).forEach(([catKey, cat]) => {
            if (!cat) return;
            cat.drinks.forEach((drink, index) => {
                allDrinks.push({
                    ...drink,
                    categoryKey: catKey,
                    categoryName: cat.name,
                    categoryIcon: cat.icon,
                    originalIndex: index
                });
            });
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        allDrinks = allDrinks.filter(d => 
            d.name.toLowerCase().includes(searchTerm) ||
            d.desc?.toLowerCase().includes(searchTerm) ||
            (d.tags || []).some(t => t.toLowerCase().includes(searchTerm))
        );
    }
    
    // اگه نوشیدنی‌ای نبود
    if (allDrinks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
                    🔍 No drinks found ${categoryFilter ? `in ${workingMenuData[categoryFilter]?.name}` : ''}
                </td>
            </tr>
        `;
        return;
    }
    
    // Render table
    tbody.innerHTML = allDrinks.map((drink, index) => `
        <tr class="${!drink.enabled ? 'disabled' : ''}" 
            data-id="${drink.id}" 
            data-category="${drink.categoryKey}"
            data-index="${drink.originalIndex}"
            draggable="true">
            <td class="drag-handle" title="Drag to reorder">⋮⋮</td>
            <td>
                <div class="drink-status ${drink.enabled ? '' : 'inactive'}"></div>
            </td>
            <td class="drink-name-cell">
                ${drink.name}
                <span>${drink.desc || ''}</span>
            </td>
            <td>${drink.categoryIcon} ${drink.categoryName}</td>
            <td>
                <input type="text" class="drink-price-input" 
                       value="${drink.price}" 
                       onchange="updateDrinkPrice('${drink.categoryKey}', '${drink.id}', this.value)">
            </td>
            <td>
                <div class="tags-cell" data-category="${drink.categoryKey}" data-id="${drink.id}">
                    ${(drink.tags || []).map(t => `
                        <span class="mini-tag">
                            ${t}
                            <button onclick="removeTag('${drink.categoryKey}', '${drink.id}', '${t}')" title="Remove">×</button>
                        </span>
                    `).join('')}
                    <button class="add-tag-btn" onclick="showAddTagPopup('${drink.categoryKey}', '${drink.id}', this)" title="Add tag">+</button>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-btn" onclick="toggleDrink('${drink.categoryKey}', '${drink.id}')" 
                            title="${drink.enabled ? 'Disable' : 'Enable'}">
                        ${drink.enabled ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button class="table-btn" onclick="editDrink('${drink.categoryKey}', '${drink.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="table-btn danger" onclick="deleteDrink('${drink.categoryKey}', '${drink.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Setup drag & drop
    setupDrinksDragDrop();
}

function updateDrinkPrice(categoryKey, drinkId, newPrice) {
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    if (drink) {
        drink.price = newPrice;
        saveToHistory();
        showToast('Price updated', 'success');
    }
}

function toggleDrink(categoryKey, drinkId) {
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    if (drink) {
        drink.enabled = !drink.enabled;
        saveToHistory();
        renderDrinksTable();
        showToast(`Drink ${drink.enabled ? 'enabled' : 'disabled'}`, 'success');
    }
}

function editDrink(categoryKey, drinkId) {
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    if (!drink) return;
    
    editingItem = { categoryKey, drinkId };
    editingType = 'drink';
    
    document.getElementById('modalTitle').textContent = 'Edit Drink';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Drink Name</label>
            <input type="text" id="editDrinkName" value="${drink.name}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Price</label>
                <input type="text" id="editDrinkPrice" value="${drink.price}">
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="editDrinkCategory">
                    ${Object.entries(workingMenuData).map(([key, cat]) => `
                        <option value="${key}" ${key === categoryKey ? 'selected' : ''}>
                            ${cat.icon} ${cat.name}
                        </option>
                    `).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editDrinkDesc">${drink.desc || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" id="editDrinkTags" value="${(drink.tags || []).join(', ')}" 
                   placeholder="popular, new, premium...">
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = saveDrink;
    openModal();
}

function saveDrink() {
    const name = document.getElementById('editDrinkName').value;
    const price = document.getElementById('editDrinkPrice').value;
    const newCategoryKey = document.getElementById('editDrinkCategory').value;
    const desc = document.getElementById('editDrinkDesc').value;
    const tagsStr = document.getElementById('editDrinkTags').value;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
    
    if (!name || !price) {
        showToast('Name and price are required', 'error');
        return;
    }
    
    const { categoryKey, drinkId } = editingItem;
    
    // If category changed, move drink
    if (newCategoryKey !== categoryKey) {
        const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
        workingMenuData[categoryKey].drinks = workingMenuData[categoryKey].drinks.filter(d => d.id !== drinkId);
        
        drink.name = name;
        drink.price = price;
        drink.desc = desc;
        drink.tags = tags;
        
        workingMenuData[newCategoryKey].drinks.push(drink);
    } else {
        const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
        drink.name = name;
        drink.price = price;
        drink.desc = desc;
        drink.tags = tags;
    }
    
    saveToHistory();
    closeModal();
    renderDrinksTable();
    showToast('Drink updated! ✅', 'success');
}

function addDrink() {
    editingItem = null;
    editingType = 'drink';
    
    document.getElementById('modalTitle').textContent = 'Add New Drink';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Drink Name</label>
            <input type="text" id="editDrinkName" placeholder="e.g. Mojito">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Price</label>
                <input type="text" id="editDrinkPrice" placeholder="e.g. €12">
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="editDrinkCategory">
                    ${Object.entries(workingMenuData).map(([key, cat]) => `
                        <option value="${key}">${cat.icon} ${cat.name}</option>
                    `).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editDrinkDesc" placeholder="Ingredients or description..."></textarea>
        </div>
        <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" id="editDrinkTags" placeholder="popular, new, premium...">
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = saveNewDrink;
    openModal();
}

function saveNewDrink() {
    const name = document.getElementById('editDrinkName').value;
    const price = document.getElementById('editDrinkPrice').value;
    const categoryKey = document.getElementById('editDrinkCategory').value;
    const desc = document.getElementById('editDrinkDesc').value;
    const tagsStr = document.getElementById('editDrinkTags').value;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
    
    if (!name || !price) {
        showToast('Name and price are required', 'error');
        return;
    }
    
    // Generate unique ID
    const id = `${categoryKey}_${Date.now()}`;
    
    workingMenuData[categoryKey].drinks.push({
        id,
        name,
        price,
        desc,
        tags,
        enabled: true
    });
    
    saveToHistory();
    closeModal();
    renderDrinksTable();
    showToast('Drink added! ✅', 'success');
}

function deleteDrink(categoryKey, drinkId) {
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    if (!confirm(`Delete "${drink.name}"?`)) return;
    
    workingMenuData[categoryKey].drinks = workingMenuData[categoryKey].drinks.filter(d => d.id !== drinkId);
    
    saveToHistory();
    renderDrinksTable();
    showToast('Drink deleted', 'warning');
}

// ==================== DRINK DRAG & DROP ====================
function setupDrinksDragDrop() {
    const tbody = document.getElementById('drinksTableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    let draggedRow = null;
    let draggedCategory = null;
    
    rows.forEach(row => {
        row.addEventListener('dragstart', (e) => {
            draggedRow = row;
            draggedCategory = row.dataset.category;
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            
            // Create a drag image
            const dragImage = row.cloneNode(true);
            dragImage.style.opacity = '0.8';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => dragImage.remove(), 0);
        });
        
        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            draggedRow = null;
            draggedCategory = null;
            
            // Remove all drag-over classes
            tbody.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));
        });
        
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            // Only allow reordering within same category
            if (draggedRow && row !== draggedRow && row.dataset.category === draggedCategory) {
                e.dataTransfer.dropEffect = 'move';
                
                // Visual feedback
                tbody.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));
                row.classList.add('drag-over');
            }
        });
        
        row.addEventListener('dragleave', () => {
            row.classList.remove('drag-over');
        });
        
        row.addEventListener('drop', (e) => {
            e.preventDefault();
            row.classList.remove('drag-over');
            
            if (!draggedRow || row === draggedRow) return;
            if (row.dataset.category !== draggedCategory) {
                showToast('Can only reorder within same category', 'warning');
                return;
            }
            
            // Get positions
            const categoryKey = draggedCategory;
            const fromId = draggedRow.dataset.id;
            const toId = row.dataset.id;
            
            // Reorder in data
            const drinks = workingMenuData[categoryKey].drinks;
            const fromIndex = drinks.findIndex(d => d.id === fromId);
            const toIndex = drinks.findIndex(d => d.id === toId);
            
            if (fromIndex !== -1 && toIndex !== -1) {
                // Remove from original position
                const [movedDrink] = drinks.splice(fromIndex, 1);
                // Insert at new position
                drinks.splice(toIndex, 0, movedDrink);
                
                saveToHistory();
                renderDrinksTable();
                showToast('Order updated', 'success');
            }
        });
    });
}

// ==================== TAG MANAGEMENT ====================
function removeTag(categoryKey, drinkId, tagToRemove) {
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    if (drink) {
        drink.tags = (drink.tags || []).filter(t => t !== tagToRemove);
        saveToHistory();
        renderDrinksTable();
        showToast(`Tag "${tagToRemove}" removed`, 'success');
    }
}

function showAddTagPopup(categoryKey, drinkId, buttonElement) {
    // Remove existing popup
    const existingPopup = document.querySelector('.tag-popup');
    if (existingPopup) existingPopup.remove();
    
    // Get available tags
    const commonTags = ['popular', 'new', 'premium', 'signature', 'hot', 'cold', 'sweet', 'strong', 'classic', 'seasonal'];
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    const currentTags = drink?.tags || [];
    const availableTags = commonTags.filter(t => !currentTags.includes(t));
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'tag-popup';
    popup.innerHTML = `
        <div class="tag-popup-header">Add Tag</div>
        <div class="tag-popup-common">
            ${availableTags.map(t => `
                <button class="tag-popup-item" onclick="addTag('${categoryKey}', '${drinkId}', '${t}')">${t}</button>
            `).join('')}
        </div>
        <div class="tag-popup-custom">
            <input type="text" id="customTagInput" placeholder="Custom tag...">
            <button onclick="addCustomTag('${categoryKey}', '${drinkId}')">Add</button>
        </div>
    `;
    
    // Position popup
    const rect = buttonElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = `${rect.bottom + 5}px`;
    popup.style.left = `${rect.left}px`;
    
    document.body.appendChild(popup);
    
    // Focus input
    document.getElementById('customTagInput').focus();
    
    // Handle enter key
    document.getElementById('customTagInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addCustomTag(categoryKey, drinkId);
        }
        if (e.key === 'Escape') {
            popup.remove();
        }
    });
    
    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target) && e.target !== buttonElement) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 100);
}

function addTag(categoryKey, drinkId, tag) {
    const drink = workingMenuData[categoryKey].drinks.find(d => d.id === drinkId);
    if (drink) {
        if (!drink.tags) drink.tags = [];
        if (!drink.tags.includes(tag)) {
            drink.tags.push(tag);
            saveToHistory();
            renderDrinksTable();
            showToast(`Tag "${tag}" added`, 'success');
        }
    }
    
    // Remove popup
    const popup = document.querySelector('.tag-popup');
    if (popup) popup.remove();
}

function addCustomTag(categoryKey, drinkId) {
    const input = document.getElementById('customTagInput');
    const tag = input.value.trim().toLowerCase();
    
    if (!tag) {
        showToast('Enter a tag name', 'error');
        return;
    }
    
    addTag(categoryKey, drinkId, tag);
}

// ==================== HIDDEN DRINKS ====================
function renderHiddenDrinks() {
    const container = document.getElementById('hiddenDrinksList');
    if (!container) return;
    
    container.innerHTML = Object.entries(workingHiddenDrinks).map(([key, cat]) => `
        <div class="hidden-category" data-category="${key}">
            <div class="hidden-category-header" onclick="toggleHiddenCategory('${key}')">
                <div class="hidden-category-info">
                    <span>${cat.icon}</span>
                    <h4>${cat.name} (${cat.drinks.filter(d => d.enabled).length} drinks)</h4>
                </div>
                <span class="hidden-category-toggle">▼</span>
            </div>
            <div class="hidden-category-content">
                <table class="drinks-table">
                    <tbody>
                        ${cat.drinks.map(drink => `
                            <tr class="${!drink.enabled ? 'disabled' : ''}">
                                <td>
                                    <div class="drink-status ${drink.enabled ? '' : 'inactive'}"></div>
                                </td>
                                <td class="drink-name-cell">
                                    ${drink.name}
                                    <span>${drink.desc || ''}</span>
                                </td>
                                <td>
                                    <input type="text" class="drink-price-input" 
                                           value="${drink.price}"
                                           onchange="updateHiddenDrinkPrice('${key}', '${drink.id}', this.value)">
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="table-btn" onclick="toggleHiddenDrink('${key}', '${drink.id}')">
                                            ${drink.enabled ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                        <button class="table-btn" onclick="editHiddenDrink('${key}', '${drink.id}')">✏️</button>
                                        <button class="table-btn danger" onclick="deleteHiddenDrink('${key}', '${drink.id}')">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="add-btn" style="margin-top: 16px;" onclick="addHiddenDrinkToCategory('${key}')">
                    <span>+</span> Add to ${cat.name}
                </button>
            </div>
        </div>
    `).join('');
}

function toggleHiddenCategory(key) {
    const el = document.querySelector(`.hidden-category[data-category="${key}"]`);
    el.classList.toggle('open');
}

function toggleHiddenDrink(categoryKey, drinkId) {
    const drink = workingHiddenDrinks[categoryKey].drinks.find(d => d.id === drinkId);
    if (drink) {
        drink.enabled = !drink.enabled;
        saveToHistory();
        renderHiddenDrinks();
    }
}

function updateHiddenDrinkPrice(categoryKey, drinkId, newPrice) {
    const drink = workingHiddenDrinks[categoryKey].drinks.find(d => d.id === drinkId);
    if (drink) {
        drink.price = newPrice;
        saveToHistory();
        showToast('Price updated', 'success');
    }
}

function editHiddenDrink(categoryKey, drinkId) {
    const drink = workingHiddenDrinks[categoryKey].drinks.find(d => d.id === drinkId);
    if (!drink) return;
    
    editingItem = { categoryKey, drinkId, isHidden: true };
    editingType = 'hiddenDrink';
    
    document.getElementById('modalTitle').textContent = 'Edit Secret Drink';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Drink Name</label>
            <input type="text" id="editDrinkName" value="${drink.name}">
        </div>
        <div class="form-group">
            <label>Price</label>
            <input type="text" id="editDrinkPrice" value="${drink.price}">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editDrinkDesc">${drink.desc || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" id="editDrinkTags" value="${(drink.tags || []).join(', ')}">
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = saveHiddenDrink;
    openModal();
}

function saveHiddenDrink() {
    const { categoryKey, drinkId } = editingItem;
    const drink = workingHiddenDrinks[categoryKey].drinks.find(d => d.id === drinkId);
    
    drink.name = document.getElementById('editDrinkName').value;
    drink.price = document.getElementById('editDrinkPrice').value;
    drink.desc = document.getElementById('editDrinkDesc').value;
    drink.tags = document.getElementById('editDrinkTags').value.split(',').map(t => t.trim()).filter(t => t);
    
    saveToHistory();
    closeModal();
    renderHiddenDrinks();
    showToast('Secret drink updated! 🤫', 'success');
}

function deleteHiddenDrink(categoryKey, drinkId) {
    const drink = workingHiddenDrinks[categoryKey].drinks.find(d => d.id === drinkId);
    if (!confirm(`Delete secret drink "${drink.name}"?`)) return;
    
    workingHiddenDrinks[categoryKey].drinks = workingHiddenDrinks[categoryKey].drinks.filter(d => d.id !== drinkId);
    
    saveToHistory();
    renderHiddenDrinks();
    showToast('Secret drink deleted', 'warning');
}

function addHiddenDrink() {
    // Show category selection first
    document.getElementById('modalTitle').textContent = 'Add Secret Drink';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Select Secret Category</label>
            <select id="selectHiddenCategory">
                ${Object.entries(workingHiddenDrinks).map(([key, cat]) => `
                    <option value="${key}">${cat.icon} ${cat.name}</option>
                `).join('')}
            </select>
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = () => {
        const categoryKey = document.getElementById('selectHiddenCategory').value;
        closeModal();
        addHiddenDrinkToCategory(categoryKey);
    };
    
    openModal();
}

function addHiddenDrinkToCategory(categoryKey) {
    editingItem = { categoryKey, isHidden: true };
    editingType = 'newHiddenDrink';
    
    document.getElementById('modalTitle').textContent = `Add to ${workingHiddenDrinks[categoryKey].name}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Drink Name</label>
            <input type="text" id="editDrinkName" placeholder="e.g. Purple Rain">
        </div>
        <div class="form-group">
            <label>Price</label>
            <input type="text" id="editDrinkPrice" placeholder="e.g. €15">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="editDrinkDesc" placeholder="Ingredients..."></textarea>
        </div>
        <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" id="editDrinkTags" value="secret" placeholder="secret, premium...">
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = saveNewHiddenDrink;
    openModal();
}

function saveNewHiddenDrink() {
    const { categoryKey } = editingItem;
    
    const name = document.getElementById('editDrinkName').value;
    const price = document.getElementById('editDrinkPrice').value;
    const desc = document.getElementById('editDrinkDesc').value;
    const tags = document.getElementById('editDrinkTags').value.split(',').map(t => t.trim()).filter(t => t);
    
    if (!name || !price) {
        showToast('Name and price required', 'error');
        return;
    }
    
    const id = `hidden_${Date.now()}`;
    
    workingHiddenDrinks[categoryKey].drinks.push({
        id, name, price, desc, tags, enabled: true
    });
    
    saveToHistory();
    closeModal();
    renderHiddenDrinks();
    showToast('Secret drink added! 🤫', 'success');
}

// ==================== SETTINGS ====================
function changePassword() {
    const currentPass = document.getElementById('currentPass').value;
    const newPass = document.getElementById('newPass').value;
    
    if (currentPass !== adminConfig.password) {
        showToast('Current password is incorrect', 'error');
        return;
    }
    
    if (newPass.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }
    
    adminConfig.password = newPass;
    document.getElementById('currentPass').value = '';
    document.getElementById('newPass').value = '';
    
    showToast('Password updated! 🔐', 'success');
}

function bulkPriceUpdate() {
    const percent = parseFloat(document.getElementById('priceAdjust').value);
    
    if (isNaN(percent)) {
        showToast('Enter a valid percentage', 'error');
        return;
    }
    
    if (!confirm(`Adjust ALL prices by ${percent}%?\n\nThis affects all categories and hidden drinks.`)) {
        return;
    }
    
    const adjustPrice = (priceStr) => {
        const match = priceStr.match(/[\d.]+/);
        if (!match) return priceStr;
        
        const value = parseFloat(match[0]);
        const newValue = value * (1 + percent / 100);
        return priceStr.replace(match[0], newValue.toFixed(2));
    };
    
    // Update menu drinks
    Object.values(workingMenuData).forEach(cat => {
        cat.drinks.forEach(drink => {
            drink.price = adjustPrice(drink.price);
        });
    });
    
    // Update hidden drinks
    Object.values(workingHiddenDrinks).forEach(cat => {
        cat.drinks.forEach(drink => {
            drink.price = adjustPrice(drink.price);
        });
    });
    
    saveToHistory();
    document.getElementById('priceAdjust').value = '';
    showToast(`All prices adjusted by ${percent}%! 💰`, 'success');
}

// ==================== EXPORT/IMPORT ====================
function exportJSON() {
    const data = {
        menuData: workingMenuData,
        hiddenDrinks: workingHiddenDrinks,
        exportDate: new Date().toISOString()
    };
    
    // Generate data.js content
    const content = `/**
 * Lucy Club - Menu Data
 * Generated: ${new Date().toLocaleString()}
 */

const menuData = ${JSON.stringify(workingMenuData, null, 4)};

const hiddenDrinks = ${JSON.stringify(workingHiddenDrinks, null, 4)};

const searchAliases = ${JSON.stringify(searchAliases, null, 4)};

const adminConfig = {
    username: "${adminConfig.username}",
    password: "${adminConfig.password}"
};
`;
    
    downloadFile(content, 'data.js', 'application/javascript');
    showToast('data.js exported! 📄', 'success');
}

function exportCSV() {
    let csv = 'Category,Name,Price,Description,Tags,Status\n';
    
    Object.entries(workingMenuData).forEach(([key, cat]) => {
        cat.drinks.forEach(drink => {
            csv += `"${cat.name}","${drink.name}","${drink.price}","${drink.desc || ''}","${(drink.tags || []).join('; ')}","${drink.enabled ? 'Active' : 'Inactive'}"\n`;
        });
    });
    
    downloadFile(csv, 'lucy-menu.csv', 'text/csv');
    showToast('CSV exported! 📊', 'success');
}

function exportPDF() {
    // Show category selection modal
    document.getElementById('modalTitle').textContent = 'Print Menu';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Select Categories to Print</label>
            <div class="print-category-list">
                <label class="print-category-item">
                    <input type="checkbox" id="printSelectAll" checked onchange="toggleAllPrintCategories(this)">
                    <span class="checkmark"></span>
                    <span>📋 Select All</span>
                </label>
                <hr style="border: none; border-top: 1px solid var(--admin-border); margin: 10px 0;">
                ${Object.entries(workingMenuData)
                    .filter(([_, cat]) => cat.enabled)
                    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
                    .map(([key, cat]) => `
                        <label class="print-category-item">
                            <input type="checkbox" class="print-cat-checkbox" value="${key}" checked>
                            <span class="checkmark"></span>
                            <span>${cat.icon} ${cat.name}</span>
                            <span class="print-cat-count">${cat.drinks.filter(d => d.enabled).length} drinks</span>
                        </label>
                    `).join('')}
            </div>
        </div>
        
        <div class="form-group">
            <label>Print Options</label>
            <div class="print-options">
                <label class="print-option-item">
                    <input type="checkbox" id="printShowPrices" checked>
                    <span class="checkmark"></span>
                    <span>💰 Show Prices</span>
                </label>
                <label class="print-option-item">
                    <input type="checkbox" id="printShowDesc" checked>
                    <span class="checkmark"></span>
                    <span>📝 Show Descriptions</span>
                </label>
                <label class="print-option-item">
                    <input type="checkbox" id="printShowTags">
                    <span class="checkmark"></span>
                    <span>🏷️ Show Tags</span>
                </label>
            </div>
        </div>
    `;
    
    document.getElementById('modalSaveBtn').textContent = '🖨️ Print';
    document.getElementById('modalSaveBtn').onclick = executePrint;
    openModal();
}

function toggleAllPrintCategories(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('.print-cat-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
}

function executePrint() {
    // Get selected categories
    const selectedCategories = [];
    document.querySelectorAll('.print-cat-checkbox:checked').forEach(cb => {
        selectedCategories.push(cb.value);
    });
    
    if (selectedCategories.length === 0) {
        showToast('Please select at least one category', 'error');
        return;
    }
    
    // Get options
    const showPrices = document.getElementById('printShowPrices').checked;
    const showDesc = document.getElementById('printShowDesc').checked;
    const showTags = document.getElementById('printShowTags').checked;
    
    closeModal();
    
    // Reset save button text
    document.getElementById('modalSaveBtn').textContent = 'Save';
    
    // Generate printable HTML
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Lucy Club Menu</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px;
            background: white;
            color: #1a1a2e;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #ff2d95;
        }
        .header h1 { 
            font-size: 2.5rem;
            color: #ff2d95;
            margin-bottom: 5px;
        }
        .header p {
            color: #666;
            font-size: 0.9rem;
        }
        .category { 
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .category h2 { 
            color: #8b00ff;
            font-size: 1.4rem;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #8b00ff;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .drinks-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .drink { 
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px dotted #ddd;
        }
        .drink:last-child {
            border-bottom: none;
        }
        .drink-info {
            flex: 1;
            padding-right: 20px;
        }
        .drink-name { 
            font-weight: 600;
            font-size: 1rem;
            color: #1a1a2e;
        }
        .drink-desc { 
            color: #666;
            font-size: 0.85rem;
            margin-top: 3px;
            line-height: 1.4;
        }
        .drink-tags {
            display: flex;
            gap: 5px;
            margin-top: 5px;
        }
        .drink-tag {
            font-size: 0.65rem;
            padding: 2px 8px;
            background: #f0f0f0;
            border-radius: 10px;
            color: #666;
            text-transform: uppercase;
        }
        .drink-tag.popular { background: #ff2d95; color: white; }
        .drink-tag.new { background: #00d4aa; color: white; }
        .drink-tag.premium { background: #d4af37; color: white; }
        .drink-price { 
            color: #ff2d95;
            font-weight: 700;
            font-size: 1.1rem;
            white-space: nowrap;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 0.8rem;
        }
        .no-price .drink-price { display: none; }
        .no-desc .drink-desc { display: none; }
        .no-tags .drink-tags { display: none; }
        @media print { 
            body { padding: 20px; }
            .category { page-break-inside: avoid; }
        }
    </style>
</head>
<body class="${!showPrices ? 'no-price' : ''} ${!showDesc ? 'no-desc' : ''} ${!showTags ? 'no-tags' : ''}">
    <div class="header">
        <h1>🍹 Lucy Club</h1>
        <p>Drink Menu</p>
    </div>
`;

    // Add selected categories
    selectedCategories.forEach(catKey => {
        const cat = workingMenuData[catKey];
        if (!cat || !cat.enabled) return;
        
        const enabledDrinks = cat.drinks.filter(d => d.enabled);
        if (enabledDrinks.length === 0) return;
        
        html += `
    <div class="category">
        <h2>${cat.icon} ${cat.name}</h2>
        <div class="drinks-list">
`;
        
        enabledDrinks.forEach(drink => {
            const tagsHtml = (drink.tags || []).map(tag => 
                `<span class="drink-tag ${tag}">${tag}</span>`
            ).join('');
            
            html += `
            <div class="drink">
                <div class="drink-info">
                    <span class="drink-name">${drink.name}</span>
                    <div class="drink-desc">${drink.desc || ''}</div>
                    <div class="drink-tags">${tagsHtml}</div>
                </div>
                <span class="drink-price">${drink.price}</span>
            </div>
`;
        });
        
        html += `
        </div>
    </div>
`;
    });
    
    html += `
    <div class="footer">
        Lucy Club &copy; ${new Date().getFullYear()} — Printed on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>
`;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
    };
    
    showToast('Print dialog opened! 🖨️', 'success');
}

function importJSON() {
    document.getElementById('importFile').click();
}

document.getElementById('importFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            let content = event.target.result;
            
            // Try to parse as JSON first
            if (file.name.endsWith('.json')) {
                const data = JSON.parse(content);
                if (data.menuData) workingMenuData = data.menuData;
                if (data.hiddenDrinks) workingHiddenDrinks = data.hiddenDrinks;
            } else if (file.name.endsWith('.js')) {
                // Extract JSON from JS file
                const menuMatch = content.match(/const menuData = ({[\s\S]*?});/);
                const hiddenMatch = content.match(/const hiddenDrinks = ({[\s\S]*?});/);
                
                if (menuMatch) {
                    workingMenuData = JSON.parse(menuMatch[1]);
                }
                if (hiddenMatch) {
                    workingHiddenDrinks = JSON.parse(hiddenMatch[1]);
                }
            }
            
            saveToHistory();
            renderCurrentSection();
            showToast('Data imported! ✅', 'success');
        } catch (err) {
            showToast('Invalid file format', 'error');
            console.error(err);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ==================== UNDO/REDO ====================
function saveToHistory() {
    // Remove future history if we're in the middle
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }
    
    // Save current state
    historyStack.push({
        menuData: JSON.parse(JSON.stringify(workingMenuData)),
        hiddenDrinks: JSON.parse(JSON.stringify(workingHiddenDrinks))
    });
    
    // Limit history size
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    }
    
    historyIndex = historyStack.length - 1;
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreFromHistory();
        showToast('Undone ↶', 'success');
    }
}

function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        restoreFromHistory();
        showToast('Redone ↷', 'success');
    }
}

function restoreFromHistory() {
    const state = historyStack[historyIndex];
    workingMenuData = JSON.parse(JSON.stringify(state.menuData));
    workingHiddenDrinks = JSON.parse(JSON.stringify(state.hiddenDrinks));
    renderCurrentSection();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= historyStack.length - 1;
}

// ==================== SAVE CHANGES ====================
function saveChanges() {
    // In a real app, this would send to server
    // For now, we'll export the file
    exportJSON();
    showToast('Changes saved! Download and replace your data.js file.', 'success');
}

// ==================== MODAL ====================
function openModal() {
    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    editingItem = null;
    editingType = null;
}

// Close modal on escape or backdrop click
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

document.getElementById('editModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'editModal') closeModal();
});

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    toast.className = 'toast';
    toast.classList.add(type);
    icon.textContent = icons[type] || '💬';
    msg.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== UTILITIES ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function openPreview() {
    window.open('index.html', '_blank');
}

// Generate unique ID
function generateId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== TAGS MANAGEMENT ====================

// Tag colors
const tagColors = {
    'popular': '#ff2d95',
    'new': '#00d4aa',
    'premium': '#d4af37',
    'signature': '#8b00ff',
    'hot': '#ff6b35',
    'cold': '#17a2b8',
    'sweet': '#ff69b4',
    'strong': '#dc3545',
    'classic': '#c9a227',
    'seasonal': '#6f42c1',
    'secret': '#667eea',
    'shooter': '#fd7e14',
    'german': '#ffcc00',
    'virgin': '#28a745',
    'frozen': '#00bcd4',
    'fire': '#ff4500',
    'energy': '#00d4aa',
    'default': '#6e6e82'
};

const colorOptions = [
    '#ff2d95', '#8b00ff', '#00d4aa', '#d4af37', '#ff6b35',
    '#17a2b8', '#dc3545', '#6f42c1', '#fd7e14', '#28a745',
    '#667eea', '#ff4500', '#00bcd4', '#ffcc00', '#ff69b4'
];

let selectedTags = [];
let currentTagDetails = null;

function renderTagsSection() {
    updateTagsStats();
    renderTagsGrid();
}

function updateTagsStats() {
    const allTags = getAllTags();
    const taggedDrinks = getTaggedDrinksCount();
    const topTag = getTopTag(allTags);
    
    document.getElementById('totalTagsCount').textContent = Object.keys(allTags).length;
    document.getElementById('taggedDrinksCount').textContent = taggedDrinks;
    document.getElementById('topTagName').textContent = topTag || '-';
}

function getAllTags() {
    const tags = {};
    
    // From menu drinks
    Object.entries(workingMenuData).forEach(([catKey, cat]) => {
        cat.drinks.forEach(drink => {
            (drink.tags || []).forEach(tag => {
                if (!tags[tag]) {
                    tags[tag] = {
                        name: tag,
                        count: 0,
                        drinks: [],
                        color: tagColors[tag] || tagColors.default
                    };
                }
                tags[tag].count++;
                tags[tag].drinks.push({
                    id: drink.id,
                    name: drink.name,
                    category: cat.name,
                    categoryKey: catKey,
                    categoryIcon: cat.icon
                });
            });
        });
    });
    
    // From hidden drinks
    Object.entries(workingHiddenDrinks).forEach(([catKey, cat]) => {
        cat.drinks.forEach(drink => {
            (drink.tags || []).forEach(tag => {
                if (!tags[tag]) {
                    tags[tag] = {
                        name: tag,
                        count: 0,
                        drinks: [],
                        color: tagColors[tag] || tagColors.default,
                        hasHidden: true
                    };
                }
                tags[tag].count++;
                tags[tag].hasHidden = true;
                tags[tag].drinks.push({
                    id: drink.id,
                    name: drink.name,
                    category: cat.name,
                    categoryKey: catKey,
                    categoryIcon: cat.icon,
                    isHidden: true
                });
            });
        });
    });
    
    return tags;
}

function getTaggedDrinksCount() {
    let count = 0;
    
    Object.values(workingMenuData).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags && drink.tags.length > 0) count++;
        });
    });
    
    Object.values(workingHiddenDrinks).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags && drink.tags.length > 0) count++;
        });
    });
    
    return count;
}

function getTopTag(tags) {
    let topTag = null;
    let maxCount = 0;
    
    Object.entries(tags).forEach(([name, data]) => {
        if (data.count > maxCount) {
            maxCount = data.count;
            topTag = name;
        }
    });
    
    return topTag;
}

function renderTagsGrid() {
    const grid = document.getElementById('tagsGrid');
    const searchTerm = document.getElementById('tagSearchInput')?.value?.toLowerCase() || '';
    
    if (!grid) return;
    
    const allTags = getAllTags();
    let tagsArray = Object.entries(allTags);
    
    // Filter by search
    if (searchTerm) {
        tagsArray = tagsArray.filter(([name]) => 
            name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by count descending
    tagsArray.sort((a, b) => b[1].count - a[1].count);
    
    if (tagsArray.length === 0) {
        grid.innerHTML = `
            <div class="tags-empty" style="grid-column: 1/-1;">
                <div class="tags-empty-icon">🏷️</div>
                <p class="tags-empty-text">${searchTerm ? 'No tags found' : 'No tags yet'}</p>
                ${!searchTerm ? '<button class="add-btn" onclick="showAddTagModal()"><span>+</span> Create First Tag</button>' : ''}
            </div>
        `;
        return;
    }
    
    grid.innerHTML = tagsArray.map(([name, data]) => `
        <div class="tag-card ${selectedTags.includes(name) ? 'selected' : ''}" 
             data-tag="${name}"
             onclick="handleTagCardClick(event, '${name}')">
            <div class="tag-card-checkbox" onclick="toggleTagSelection(event, '${name}')">✓</div>
            
            <div class="tag-card-header">
                <div class="tag-name-display">
                    <span class="tag-color-dot" style="background: ${data.color}"></span>
                    <span class="tag-name">${name}</span>
                </div>
            </div>
            
            <div class="tag-card-stats">
                <div class="tag-mini-stat">
                    <div class="tag-mini-stat-value">${data.count}</div>
                    <div class="tag-mini-stat-label">Drinks</div>
                </div>
                <div class="tag-mini-stat">
                    <div class="tag-mini-stat-value">${data.hasHidden ? '🤫' : '📋'}</div>
                    <div class="tag-mini-stat-label">${data.hasHidden ? 'Has Hidden' : 'Menu Only'}</div>
                </div>
            </div>
            
            <div class="tag-card-actions">
                <button class="tag-action-btn" onclick="showTagDetails('${name}')">
                    👁️ View
                </button>
                <button class="tag-action-btn" onclick="editTag('${name}')">
                    ✏️ Edit
                </button>
                <button class="tag-action-btn danger" onclick="deleteTag('${name}')">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function handleTagCardClick(event, tagName) {
    // Don't trigger if clicking on buttons
    if (event.target.closest('.tag-card-actions') || 
        event.target.closest('.tag-card-checkbox')) {
        return;
    }
    showTagDetails(tagName);
}

function toggleTagSelection(event, tagName) {
    event.stopPropagation();
    
    const index = selectedTags.indexOf(tagName);
    if (index > -1) {
        selectedTags.splice(index, 1);
    } else {
        selectedTags.push(tagName);
    }
    
    renderTagsGrid();
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('tagsBulkActions');
    const count = document.getElementById('selectedTagsCount');
    
    if (selectedTags.length > 0) {
        bar.style.display = 'flex';
        count.textContent = selectedTags.length;
    } else {
        bar.style.display = 'none';
    }
}

function clearTagSelection() {
    selectedTags = [];
    renderTagsGrid();
    updateBulkActionsBar();
}

// Add/Create new tag
function showAddTagModal() {
    document.getElementById('modalTitle').textContent = 'Create New Tag';
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Tag Name</label>
            <input type="text" id="newTagName" placeholder="e.g. bestseller">
        </div>
        <div class="form-group">
            <label>Tag Color</label>
            <div class="tag-color-picker">
                ${colorOptions.map((color, i) => `
                    <div class="color-option ${i === 0 ? 'selected' : ''}" 
                         style="background: ${color}"
                         data-color="${color}"
                         onclick="selectTagColor(this)"></div>
                `).join('')}
            </div>
            <input type="hidden" id="selectedTagColor" value="${colorOptions[0]}">
        </div>
        <div class="form-group">
            <label>Apply to drinks (optional)</label>
            <select id="tagApplyCategory">
                <option value="">Select category to bulk apply...</option>
                ${Object.entries(workingMenuData).map(([key, cat]) => `
                    <option value="${key}">${cat.icon} ${cat.name}</option>
                `).join('')}
            </select>
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = createNewTag;
    openModal();
}

function selectTagColor(element) {
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selectedTagColor').value = element.dataset.color;
}

function createNewTag() {
    const name = document.getElementById('newTagName').value.toLowerCase().trim();
    const color = document.getElementById('selectedTagColor').value;
    const applyTo = document.getElementById('tagApplyCategory').value;
    
    if (!name) {
        showToast('Tag name is required', 'error');
        return;
    }
    
    // Save color
    tagColors[name] = color;
    
    // Apply to category if selected
    if (applyTo && workingMenuData[applyTo]) {
        workingMenuData[applyTo].drinks.forEach(drink => {
            if (!drink.tags) drink.tags = [];
            if (!drink.tags.includes(name)) {
                drink.tags.push(name);
            }
        });
        saveToHistory();
    }
    
    closeModal();
    renderTagsSection();
    showToast(`Tag "${name}" created! 🏷️`, 'success');
}

// Edit tag
function editTag(tagName) {
    const allTags = getAllTags();
    const tagData = allTags[tagName];
    
    document.getElementById('modalTitle').textContent = `Edit Tag: ${tagName}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Tag Name</label>
            <input type="text" id="editTagName" value="${tagName}">
        </div>
        <div class="form-group">
            <label>Tag Color</label>
            <div class="tag-color-picker">
                ${colorOptions.map(color => `
                    <div class="color-option ${color === tagData.color ? 'selected' : ''}" 
                         style="background: ${color}"
                         data-color="${color}"
                         onclick="selectTagColor(this)"></div>
                `).join('')}
            </div>
            <input type="hidden" id="selectedTagColor" value="${tagData.color}">
        </div>
        <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-top: 16px;">
            ⚠️ Renaming will update all ${tagData.count} drinks with this tag.
        </p>
    `;
    
    document.getElementById('modalSaveBtn').onclick = () => saveTagEdit(tagName);
    openModal();
}

function saveTagEdit(oldName) {
    const newName = document.getElementById('editTagName').value.toLowerCase().trim();
    const newColor = document.getElementById('selectedTagColor').value;
    
    if (!newName) {
        showToast('Tag name is required', 'error');
        return;
    }
    
    // Update color
    tagColors[newName] = newColor;
    if (newName !== oldName) {
        delete tagColors[oldName];
    }
    
    // Rename tag in all drinks
    if (newName !== oldName) {
        // Menu drinks
        Object.values(workingMenuData).forEach(cat => {
            cat.drinks.forEach(drink => {
                if (drink.tags) {
                    const index = drink.tags.indexOf(oldName);
                    if (index > -1) {
                        drink.tags[index] = newName;
                    }
                }
            });
        });
        
        // Hidden drinks
        Object.values(workingHiddenDrinks).forEach(cat => {
            cat.drinks.forEach(drink => {
                if (drink.tags) {
                    const index = drink.tags.indexOf(oldName);
                    if (index > -1) {
                        drink.tags[index] = newName;
                    }
                }
            });
        });
        
        saveToHistory();
    }
    
    closeModal();
    renderTagsSection();
    showToast('Tag updated! ✅', 'success');
}

// Delete tag
function deleteTag(tagName) {
    const allTags = getAllTags();
    const tagData = allTags[tagName];
    
    if (!confirm(`Delete tag "${tagName}"?\n\nThis will remove the tag from ${tagData.count} drinks.`)) {
        return;
    }
    
    // Remove from all drinks
    Object.values(workingMenuData).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags) {
                drink.tags = drink.tags.filter(t => t !== tagName);
            }
        });
    });
    
    Object.values(workingHiddenDrinks).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags) {
                drink.tags = drink.tags.filter(t => t !== tagName);
            }
        });
    });
    
    delete tagColors[tagName];
    saveToHistory();
    renderTagsSection();
    showToast(`Tag "${tagName}" deleted`, 'warning');
}

// Bulk delete
function bulkDeleteTags() {
    if (!confirm(`Delete ${selectedTags.length} tags?\n\nThis will remove these tags from all drinks.`)) {
        return;
    }
    
    selectedTags.forEach(tagName => {
        Object.values(workingMenuData).forEach(cat => {
            cat.drinks.forEach(drink => {
                if (drink.tags) {
                    drink.tags = drink.tags.filter(t => t !== tagName);
                }
            });
        });
        
        Object.values(workingHiddenDrinks).forEach(cat => {
            cat.drinks.forEach(drink => {
                if (drink.tags) {
                    drink.tags = drink.tags.filter(t => t !== tagName);
                }
            });
        });
        
        delete tagColors[tagName];
    });
    
    saveToHistory();
    selectedTags = [];
    renderTagsSection();
    updateBulkActionsBar();
    showToast('Tags deleted', 'warning');
}

// Merge tags
function mergeSelectedTags() {
    if (selectedTags.length < 2) {
        showToast('Select at least 2 tags to merge', 'error');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Merge Tags';
    document.getElementById('modalBody').innerHTML = `
        <p style="margin-bottom: 16px;">Merge these tags into one:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
            ${selectedTags.map(t => `<span class="mini-tag">${t}</span>`).join('')}
        </div>
        <div class="form-group">
            <label>New Tag Name</label>
            <input type="text" id="mergedTagName" value="${selectedTags[0]}" placeholder="Enter merged tag name">
        </div>
    `;
    
    document.getElementById('modalSaveBtn').onclick = executeMergeTags;
    openModal();
}

function executeMergeTags() {
    const newName = document.getElementById('mergedTagName').value.toLowerCase().trim();
    
    if (!newName) {
        showToast('Tag name is required', 'error');
        return;
    }
    
    // Replace all selected tags with new name
    const tagsToMerge = [...selectedTags];
    
    Object.values(workingMenuData).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags) {
                const hasAny = drink.tags.some(t => tagsToMerge.includes(t));
                if (hasAny) {
                    drink.tags = drink.tags.filter(t => !tagsToMerge.includes(t));
                    if (!drink.tags.includes(newName)) {
                        drink.tags.push(newName);
                    }
                }
            }
        });
    });
    
    Object.values(workingHiddenDrinks).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags) {
                const hasAny = drink.tags.some(t => tagsToMerge.includes(t));
                if (hasAny) {
                    drink.tags = drink.tags.filter(t => !tagsToMerge.includes(t));
                    if (!drink.tags.includes(newName)) {
                        drink.tags.push(newName);
                    }
                }
            }
        });
    });
    
    saveToHistory();
    selectedTags = [];
    closeModal();
    renderTagsSection();
    updateBulkActionsBar();
    showToast(`Tags merged into "${newName}"! 🔗`, 'success');
}

// Tag Details Panel
function showTagDetails(tagName) {
    const allTags = getAllTags();
    const tagData = allTags[tagName];
    
    if (!tagData) return;
    
    currentTagDetails = tagName;
    
    document.getElementById('tagDetailsTitle').textContent = tagName;
    document.getElementById('tagDetailsContent').innerHTML = `
        <div class="tag-detail-section">
            <h4>Overview</h4>
            <div class="tag-card-stats" style="margin: 0;">
                <div class="tag-mini-stat">
                    <div class="tag-mini-stat-value">${tagData.count}</div>
                    <div class="tag-mini-stat-label">Total Drinks</div>
                </div>
                <div class="tag-mini-stat">
                    <div class="tag-mini-stat-value" style="background: ${tagData.color}; width: 24px; height: 24px; border-radius: 6px; margin: 0 auto;"></div>
                    <div class="tag-mini-stat-label">Color</div>
                </div>
            </div>
        </div>
        
        <div class="tag-detail-section">
            <h4>Drinks with this tag (${tagData.drinks.length})</h4>
            <div class="tag-drinks-list">
                ${tagData.drinks.map(drink => `
                    <div class="tag-drink-item">
                        <div class="tag-drink-info">
                            <span class="tag-drink-name">${drink.name}</span>
                            <span class="tag-drink-category">${drink.categoryIcon} ${drink.category} ${drink.isHidden ? '🤫' : ''}</span>
                        </div>
                        <button class="tag-drink-remove" onclick="removeTagFromDrink('${tagName}', '${drink.categoryKey}', '${drink.id}', ${drink.isHidden || false})" title="Remove tag">
                            ✕
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="tag-detail-section">
            <h4>Quick Actions</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button class="tag-action-btn primary" onclick="filterDrinksByTag('${tagName}')">
                    🔍 View in All Drinks
                </button>
                <button class="tag-action-btn" onclick="addTagToCategory('${tagName}')">
                    ➕ Add to Category
                </button>
                <button class="tag-action-btn danger" onclick="removeTagFromAll('${tagName}')">
                    🗑️ Remove from All Drinks
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('tagDetailsPanel').style.display = 'flex';
}

function closeTagDetails() {
    document.getElementById('tagDetailsPanel').style.display = 'none';
    currentTagDetails = null;
}

function removeTagFromDrink(tagName, categoryKey, drinkId, isHidden) {
    const dataSource = isHidden ? workingHiddenDrinks : workingMenuData;
    const drink = dataSource[categoryKey]?.drinks.find(d => d.id === drinkId);
    
    if (drink && drink.tags) {
        drink.tags = drink.tags.filter(t => t !== tagName);
        saveToHistory();
        renderTagsSection();
        
        // Refresh details panel if still open
        if (currentTagDetails === tagName) {
            showTagDetails(tagName);
        }
        
        showToast('Tag removed from drink', 'success');
    }
}

function filterDrinksByTag(tagName) {
    // Switch to drinks section
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-section="drinks"]').classList.add('active');
    currentSection = 'drinks';
    updateSectionTitle('drinks');
    renderCurrentSection();
    
    // Set search filter to tag name
    document.getElementById('drinkFilter').value = tagName;
    filterDrinks();
    
    closeTagDetails();
}

function addTagToCategory(tagName) {
    document.getElementById('modalTitle').textContent = `Add "${tagName}" to Category`;
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Select Category</label>
            <select id="tagTargetCategory">
                ${Object.entries(workingMenuData).map(([key, cat]) => `
                    <option value="${key}">${cat.icon} ${cat.name} (${cat.drinks.length} drinks)</option>
                `).join('')}
            </select>
        </div>
        <p style="color: var(--admin-text-muted); font-size: 0.85rem; margin-top: 12px;">
            This will add the tag to all drinks in the selected category.
        </p>
    `;
    
    document.getElementById('modalSaveBtn').onclick = () => {
        const categoryKey = document.getElementById('tagTargetCategory').value;
        if (categoryKey && workingMenuData[categoryKey]) {
            workingMenuData[categoryKey].drinks.forEach(drink => {
                if (!drink.tags) drink.tags = [];
                if (!drink.tags.includes(tagName)) {
                    drink.tags.push(tagName);
                }
            });
            saveToHistory();
            closeModal();
            renderTagsSection();
            if (currentTagDetails === tagName) {
                showTagDetails(tagName);
            }
            showToast(`Tag added to all drinks in ${workingMenuData[categoryKey].name}`, 'success');
        }
    };
    
    openModal();
}

function removeTagFromAll(tagName) {
    const allTags = getAllTags();
    const count = allTags[tagName]?.count || 0;
    
    if (!confirm(`Remove "${tagName}" from all ${count} drinks?`)) return;
    
    Object.values(workingMenuData).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags) {
                drink.tags = drink.tags.filter(t => t !== tagName);
            }
        });
    });
    
    Object.values(workingHiddenDrinks).forEach(cat => {
        cat.drinks.forEach(drink => {
            if (drink.tags) {
                drink.tags = drink.tags.filter(t => t !== tagName);
            }
        });
    });
    
    saveToHistory();
    closeTagDetails();
    renderTagsSection();
    showToast(`Tag "${tagName}" removed from all drinks`, 'warning');
}

// Setup tag search
document.getElementById('tagSearchInput')?.addEventListener('input', debounce(() => {
    renderTagsGrid();
}, 300));