/* ═══════════════════════════════════════════════════════
   APP.JS — Main Application Data & Initialization
   ═══════════════════════════════════════════════════════ */

const APP = {
    // ─── Drinks Database ───
    drinks: [
        // Cocktails
        {
            id: 1,
            name: "Lucy Sunset",
            price: 14,
            category: "cocktails",
            description: "Our signature blend of passion fruit, vodka, and a hint of lavender",
            ingredients: ["Vodka", "Passion Fruit", "Lavender Syrup", "Lime Juice"],
            tags: ["sweet", "fruity", "signature"],
            mood: ["sweet", "chill"],
            badge: "top",
            icon: "wine"
        },
        {
            id: 2,
            name: "Purple Rain",
            price: 16,
            category: "cocktails",
            description: "A mesmerizing blend of butterfly pea, gin, and citrus that changes color",
            ingredients: ["Gin", "Butterfly Pea Flower", "Lemon", "Simple Syrup"],
            tags: ["colorful", "gin", "citrus"],
            mood: ["party", "surprise"],
            badge: "spicy",
            icon: "sparkles"
        },
        {
            id: 3,
            name: "Golden Hour",
            price: 35,
            category: "cocktails",
            description: "Premium champagne cocktail with gold leaf and elderflower",
            ingredients: ["Champagne", "Elderflower Liqueur", "Gold Leaf", "Peach"],
            tags: ["premium", "elegant", "champagne"],
            mood: ["classy"],
            badge: "vip",
            icon: "crown"
        },
        {
            id: 4,
            name: "Midnight Mojito",
            price: 13,
            category: "cocktails",
            description: "Classic mojito with activated charcoal and blackberry twist",
            ingredients: ["White Rum", "Charcoal", "Blackberry", "Mint", "Lime"],
            tags: ["refreshing", "rum", "unique"],
            mood: ["party", "chill"],
            badge: null,
            icon: "moon"
        },
        {
            id: 5,
            name: "Spice Market",
            price: 15,
            category: "cocktails",
            description: "Bold tequila cocktail with jalapeño, mango, and chili salt rim",
            ingredients: ["Tequila", "Mango", "Jalapeño", "Chili Salt", "Lime"],
            tags: ["spicy", "tequila", "bold"],
            mood: ["bold", "party"],
            badge: "spicy",
            icon: "flame"
        },
        {
            id: 6,
            name: "Rose Garden",
            price: 14,
            category: "cocktails",
            description: "Delicate vodka cocktail with rose water, lychee, and prosecco",
            ingredients: ["Vodka", "Rose Water", "Lychee", "Prosecco"],
            tags: ["floral", "sweet", "elegant"],
            mood: ["sweet", "classy"],
            badge: "new",
            icon: "flower-2"
        },
        {
            id: 7,
            name: "Neon Nights",
            price: 15,
            category: "cocktails",
            description: "Electric blue curaçao and vodka with UV-reactive tonic",
            ingredients: ["Vodka", "Blue Curaçao", "Tonic", "Lime"],
            tags: ["colorful", "vodka", "party"],
            mood: ["party"],
            badge: null,
            icon: "zap"
        },
        {
            id: 8,
            name: "Velvet Whisper",
            price: 16,
            category: "cocktails",
            description: "Creamy espresso martini with vanilla and dark chocolate",
            ingredients: ["Vodka", "Espresso", "Coffee Liqueur", "Vanilla", "Chocolate"],
            tags: ["coffee", "creamy", "smooth"],
            mood: ["chill", "classy"],
            badge: null,
            icon: "coffee"
        },

        // Classics
        {
            id: 9,
            name: "Old Fashioned",
            price: 14,
            category: "classics",
            description: "The timeless bourbon cocktail with Angostura bitters and orange",
            ingredients: ["Bourbon", "Angostura Bitters", "Sugar", "Orange Peel"],
            tags: ["classic", "whiskey", "strong"],
            mood: ["bold", "classy"],
            badge: null,
            icon: "glass-water"
        },
        {
            id: 10,
            name: "Negroni",
            price: 13,
            category: "classics",
            description: "Equal parts gin, Campari, and sweet vermouth — perfectly balanced",
            ingredients: ["Gin", "Campari", "Sweet Vermouth"],
            tags: ["classic", "bitter", "strong"],
            mood: ["bold", "classy"],
            badge: null,
            icon: "wine"
        },
        {
            id: 11,
            name: "Margarita",
            price: 12,
            category: "classics",
            description: "Fresh lime, tequila, and triple sec with salt rim",
            ingredients: ["Tequila", "Triple Sec", "Lime", "Salt"],
            tags: ["classic", "citrus", "refreshing"],
            mood: ["party", "chill"],
            badge: null,
            icon: "citrus"
        },
        {
            id: 12,
            name: "Martini",
            price: 14,
            category: "classics",
            description: "Stirred, not shaken — gin or vodka with dry vermouth",
            ingredients: ["Gin/Vodka", "Dry Vermouth", "Olive/Lemon Twist"],
            tags: ["classic", "elegant", "strong"],
            mood: ["classy"],
            badge: null,
            icon: "martini"
        },

        // Mocktails
        {
            id: 13,
            name: "Virgin Sunset",
            price: 8,
            category: "mocktails",
            description: "All the sunset vibes without the spirits — passion fruit and lavender",
            ingredients: ["Passion Fruit", "Lavender Syrup", "Lime", "Soda"],
            tags: ["non-alcoholic", "fruity", "refreshing"],
            mood: ["sweet", "chill"],
            badge: null,
            icon: "sun"
        },
        {
            id: 14,
            name: "Tropical Storm",
            price: 9,
            category: "mocktails",
            description: "Mango, coconut cream, and pineapple in a tropical paradise",
            ingredients: ["Mango", "Coconut Cream", "Pineapple", "Lime"],
            tags: ["non-alcoholic", "tropical", "creamy"],
            mood: ["sweet", "chill"],
            badge: null,
            icon: "palmtree"
        },
        {
            id: 15,
            name: "Berry Bliss",
            price: 8,
            category: "mocktails",
            description: "Mixed berries, mint, and elderflower with sparkling water",
            ingredients: ["Mixed Berries", "Elderflower", "Mint", "Sparkling Water"],
            tags: ["non-alcoholic", "berry", "refreshing"],
            mood: ["sweet"],
            badge: null,
            icon: "cherry"
        },

        // Shots
        {
            id: 16,
            name: "B-52",
            price: 7,
            category: "shots",
            description: "Layered shot — Kahlúa, Baileys, and Grand Marnier",
            ingredients: ["Kahlúa", "Baileys", "Grand Marnier"],
            tags: ["layered", "sweet", "classic"],
            mood: ["party"],
            badge: null,
            icon: "layers"
        },
        {
            id: 17,
            name: "Kamikaze",
            price: 6,
            category: "shots",
            description: "Vodka, triple sec, and lime — clean and sharp",
            ingredients: ["Vodka", "Triple Sec", "Lime"],
            tags: ["strong", "citrus", "sharp"],
            mood: ["party", "bold"],
            badge: null,
            icon: "target"
        },
        {
            id: 18,
            name: "Liquid Gold",
            price: 8,
            category: "shots",
            description: "Goldschläger and Jägermeister — with real gold flakes",
            ingredients: ["Goldschläger", "Jägermeister"],
            tags: ["premium", "sweet", "unique"],
            mood: ["party"],
            badge: "vip",
            icon: "sparkles"
        },

        // Beer & Wine
        {
            id: 19,
            name: "House Red",
            price: 8,
            category: "beer-wine",
            description: "Carefully selected Cabernet Sauvignon — smooth and full-bodied",
            ingredients: ["Cabernet Sauvignon"],
            tags: ["wine", "red", "smooth"],
            mood: ["classy", "chill"],
            badge: null,
            icon: "wine"
        },
        {
            id: 20,
            name: "Craft IPA",
            price: 7,
            category: "beer-wine",
            description: "Local craft IPA with citrus and pine notes",
            ingredients: ["Craft IPA"],
            tags: ["beer", "craft", "hoppy"],
            mood: ["chill"],
            badge: null,
            icon: "beer"
        },

        // Secret Menu
        {
            id: 21,
            name: "The Dark Knight",
            price: 22,
            category: "secret",
            description: "Activated charcoal, aged rum, and smoked maple — served in darkness",
            ingredients: ["Aged Rum", "Activated Charcoal", "Smoked Maple", "Bitters"],
            tags: ["secret", "strong", "smoky"],
            mood: ["bold", "surprise"],
            badge: "secret",
            icon: "shield"
        },
        {
            id: 22,
            name: "Unicorn Tears",
            price: 25,
            category: "secret",
            description: "Color-changing cocktail with edible glitter — magical and mysterious",
            ingredients: ["Gin", "Butterfly Pea", "Edible Glitter", "Elderflower", "Lemon"],
            tags: ["secret", "magical", "colorful"],
            mood: ["surprise", "sweet"],
            badge: "secret",
            icon: "sparkles"
        },
        {
            id: 23,
            name: "Dragon's Breath",
            price: 20,
            category: "secret",
            description: "Served smoking with dry ice — tequila, dragon fruit, and chili",
            ingredients: ["Tequila", "Dragon Fruit", "Chili", "Lime", "Dry Ice"],
            tags: ["secret", "spicy", "dramatic"],
            mood: ["bold", "surprise", "party"],
            badge: "secret",
            icon: "flame"
        }
    ],

    // ─── Reviews Data ───
    reviews: [
        {
            text: "Best night of my life! The Purple Rain is absolutely magical — it literally changes color before your eyes.",
            author: "Sarah M.",
            role: "Regular Guest",
            rating: 5,
            initial: "S"
        },
        {
            text: "The VIP bottle service is worth every penny. Private booth, incredible cocktails, and the staff treats you like royalty.",
            author: "Marcus K.",
            role: "VIP Member",
            rating: 5,
            initial: "M"
        },
        {
            text: "I'm obsessed with the Drink Builder! Created my perfect cocktail and now they make it for me every time I visit.",
            author: "Emma L.",
            role: "Cocktail Enthusiast",
            rating: 5,
            initial: "E"
        },
        {
            text: "The atmosphere is incredible. Live DJ, amazing drinks, and the interior design is absolutely stunning.",
            author: "James W.",
            role: "First-time Visitor",
            rating: 4,
            initial: "J"
        },
        {
            text: "Found the secret menu and now I can't go back to normal drinks. The Dragon's Breath is an experience!",
            author: "Sophia R.",
            role: "Secret Menu Fan",
            rating: 5,
            initial: "S"
        }
    ],

    // ─── Gallery Data ───
    gallery: [
        { id: 1, category: "drinks", caption: "Purple Rain Cocktail", tall: true },
        { id: 2, category: "interior", caption: "VIP Lounge" },
        { id: 3, category: "people", caption: "Saturday Night Vibes" },
        { id: 4, category: "drinks", caption: "Signature Collection" },
        { id: 5, category: "events", caption: "DJ Night", wide: true },
        { id: 6, category: "interior", caption: "Bar Counter" },
        { id: 7, category: "people", caption: "Birthday Celebration", tall: true },
        { id: 8, category: "drinks", caption: "Golden Hour" },
        { id: 9, category: "events", caption: "Live Jazz" },
        { id: 10, category: "interior", caption: "Neon Entrance" },
        { id: 11, category: "drinks", caption: "Midnight Mojito" },
        { id: 12, category: "people", caption: "Friends Night Out" }
    ],

    // ─── Signature Drinks (IDs from main list) ───
    signatureIds: [1, 2, 3, 5, 6, 8],

    // ─── Mood Mapping ───
    moodTitles: {
        bold: "🔥 For Your Bold Mood, We Suggest:",
        chill: "🧊 Chill Vibes Coming Right Up:",
        sweet: "🌸 Sweet & Lovely Picks:",
        party: "⚡ Let's Get The Party Started:",
        classy: "👑 Refined Taste, Refined Drinks:",
        surprise: "🎲 Surprise! Here's What We Picked:"
    }
};

// ─── Utility Functions ───
const Utils = {
    // Smooth lerp
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Random number in range
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random integer in range
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Clamp value
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Fuzzy search
    fuzzyMatch(str, pattern) {
        str = str.toLowerCase();
        pattern = pattern.toLowerCase();
        let patternIdx = 0;
        for (let i = 0; i < str.length && patternIdx < pattern.length; i++) {
            if (str[i] === pattern[patternIdx]) {
                patternIdx++;
            }
        }
        return patternIdx === pattern.length;
    },

    // Simple search score
    searchScore(item, query) {
        query = query.toLowerCase();
        let score = 0;

        if (item.name.toLowerCase().includes(query)) score += 10;
        if (item.name.toLowerCase().startsWith(query)) score += 5;
        if (item.description.toLowerCase().includes(query)) score += 3;
        if (item.category.toLowerCase().includes(query)) score += 2;

        item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(query)) score += 4;
        });

        item.ingredients.forEach(ing => {
            if (ing.toLowerCase().includes(query)) score += 3;
        });

        return score;
    }
};

// ─── Initialize App ───
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🍹 LUCY CLUB V2', 'color: #ff2d95; font-size: 20px; font-weight: bold;');
    console.log('%c Where nights become legendary.', 'color: #8b00ff; font-size: 12px;');
});