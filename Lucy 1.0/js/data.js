/**
 * Lucy Club - Menu Data
 * All drink categories and items
 */

const menuData = {
    longdrinks: {
        name: "Longdrinks",
        icon: "🍸",
        description: "Classic long drinks mixed with premium spirits",
        enabled: true,
        order: 1,
        drinks: [
            { id: "ld1", name: "Vodka Energy", price: "€8.50", desc: "Vodka 360, Redbull Energy drink", tags: ["popular"], enabled: true },
            { id: "ld2", name: "Bacardirazz", price: "€8.50", desc: "Bacardirazz, Sprite", tags: ["popular"], enabled: true },
            { id: "ld10", name: "Gin tonic", price: "€8.50", desc: "Bacardirazz, Sprite", tags: ["popular"], enabled: true },
            { id: "ld3", name: "Vodka + Filler", price: "€8.50", desc: "Vodka 360, ein Ausgewählte Filler", tags: ["new"], enabled: true },
            { id: "ld4", name: "Whisky + Filler", price: "€8.50", desc: "Jim Beam, dein Filler", tags: ["new"], enabled: true },
            { id: "ld5", name: "Rum + Filler", price: "€8.50", desc: "Bacardi Rum, dein Filler", tags: ["new"], enabled: true },
            { id: "ld6", name: "Captain Morgan + Filler", price: "€8.50", desc: "Captain Morgan, dein Filler", tags: [], enabled: true },
            { id: "ld7", name: "Malibu + Filler", price: "€8.50", desc: "Malibu, dein Filler", tags: [], enabled: true },
            { id: "ld8", name: "Aperol Spritz", price: "€10", desc: "Aperol, Prosecco, Soda, Orange", tags: [], enabled: true },
            { id: "ld9", name: "Lillet Wildberry", price: "€10", desc: "Lillet, Schweppes Wildberry", tags: [], enabled: true },
        ]
    },
    softdrinks: {
        name: "Alkoholfreie",
        icon: "🧃",
        description: "Refreshing non-alcoholic beverages",
        enabled: true,
        order: 2,
        drinks: [
            { id: "sd1", name: "Coca Cola", price: "€4", desc: "200ml Coke, Eiswürfeln", tags: ["popular"], enabled: true },
            { id: "sd2", name: "Coca Cola Zero", price: "€4", desc: "200ml Coke Zero, Eiswürfeln", tags: ["popular"], enabled: true },
            { id: "sd3", name: "Fanta", price: "€4", desc: "200ml Fanta, Eiswürfeln", tags: [], enabled: true },
            { id: "sd4", name: "Sprite", price: "€4", desc: "Sprite, Eiswürfeln", tags: [], enabled: true },
            { id: "sd5", name: "Maracujasaft", price: "€4", desc: "Frischer Maracujasaft", tags: [], enabled: true },
            { id: "sd6", name: "Orangensaft", price: "€4", desc: "Frischer Orangensaft", tags: ["popular"], enabled: true },
            { id: "sd7", name: "Kirschsaft", price: "€4", desc: "Kirschsaft", tags: [], enabled: true },
            { id: "sd8", name: "Cranberrysaft", price: "€4", desc: "Cranberrysaft", tags: [], enabled: true },
        ]
    },
    shots: {
        name: "Shots",
        icon: "🔥",
        description: "Quick shots for the brave ones",
        enabled: true,
        order: 3,
        drinks: [
            { id: "sh1", name: "Tequila", price: "€4", desc: "Smooth silver tequila", tags: ["popular"], enabled: true },
            { id: "sh2", name: "Jägermeister", price: "€4", desc: "20ml Jägermeister", tags: ["popular"], enabled: true },
            { id: "sh3", name: "Sourz", price: "€4", desc: "20ml Sourz", tags: [], enabled: true },
            { id: "sh4", name: "Sambuca", price: "€4", desc: "20ml Molinari Sambuca", tags: [], enabled: true },
            { id: "sh5", name: "Berliner Luft", price: "€4", desc: "Pfefferminzlikör", tags: ["popular"], enabled: true },
            { id: "sh6", name: "Vodka Shot", price: "€4", desc: "20ml Premium Vodka", tags: [], enabled: true },
        ]
    },
    beer: {
        name: "Bier",
        icon: "🍺",
        description: "Cold beers from around the world",
        enabled: true,
        order: 4,
        drinks: [
            { id: "br1", name: "Becks 0.33L", price: "€4", desc: "Classic German lager", tags: ["popular"], enabled: true },
            { id: "br2", name: "Becks Ice", price: "€4.50", desc: "Refreshing ice cold beer", tags: [], enabled: true },
            { id: "br3", name: "Becks Lemon", price: "€4.50", desc: "Beer with lemon taste", tags: [], enabled: true },
            { id: "br4", name: "Corona", price: "€5", desc: "Mexican beer with lime", tags: ["popular"], enabled: true },
            { id: "br5", name: "Heineken", price: "€5", desc: "Dutch premium lager", tags: [], enabled: true },
        ]
    },
    bottles: {
        name: "Flaschen",
        icon: "🍾",
        description: "Premium bottles for your table",
        enabled: true,
        order: 5,
        drinks: [
            { id: "bt1", name: "Vodka 360 0.7L", price: "€89", desc: "inkl. 4x Red Bull + Gläser", tags: ["popular"], enabled: true },
            { id: "bt2", name: "Vodka 360 1L", price: "€120", desc: "inkl. 6x Red Bull + Gläser", tags: ["premium"], enabled: true },
            { id: "bt3", name: "Grey Goose 0.7L", price: "€150", desc: "inkl. 4x Red Bull + Gläser", tags: ["premium"], enabled: true },
            { id: "bt4", name: "Belvedere 0.7L", price: "€140", desc: "inkl. 4x Red Bull + Gläser", tags: [], enabled: true },
            { id: "bt5", name: "Bombay Gin 0.7L", price: "€99", desc: "inkl. 4x Tonic Water + Gläser", tags: [], enabled: true },
            { id: "bt6", name: "Jack Daniels 0.7L", price: "€99", desc: "inkl. 4x Cola + Gläser", tags: ["popular"], enabled: true },
            { id: "bt7", name: "Moet Chandon", price: "€120", desc: "Champagner 0.75L", tags: ["premium"], enabled: true },
        ]
    },
    cocktails: {
        name: "Cocktails",
        icon: "🍹",
        description: "Handcrafted signature cocktails",
        enabled: true,
        order: 6,
        drinks: [
            { id: "ct1", name: "Lucy Pornstar", price: "€12", desc: "Vodka, Passoa, Vanille, Prosecco, Limette, Maracuja", tags: ["popular", "signature"], enabled: true },
            { id: "ct2", name: "Lucy Collins", price: "€11", desc: "Gin, Zuckersirup, Zitrone, Soda", tags: ["signature"], enabled: true },
            { id: "ct3", name: "Lucy Cosmopolitan", price: "€12", desc: "Vodka, Cointreau, Limette, Cranberry", tags: ["new"], enabled: true },
            { id: "ct4", name: "Long Island Ice Tea", price: "€13", desc: "Vodka, Rum, Gin, Tequila, Cointreau, Cola", tags: ["popular"], enabled: true },
            { id: "ct5", name: "Mojito", price: "€11", desc: "Weißer Rum, Limette, Minze, Soda", tags: ["popular"], enabled: true },
            { id: "ct6", name: "Caipirinha", price: "€11", desc: "Cachaça, Limette, Rohrzucker", tags: [], enabled: true },
            { id: "ct7", name: "Piña Colada", price: "€12", desc: "Rum, Kokosnuss, Ananas", tags: [], enabled: true },
            { id: "ct8", name: "Mai Tai", price: "€12", desc: "Rum, Curaçao, Orgeat, Limette", tags: [], enabled: true },
        ]
    },
    wine: {
        name: "Wine",
        icon: "🍷",
        description: "Fine wines from select vineyards",
        enabled: true,
        order: 7,
        drinks: [
            { id: "wn1", name: "Prosecco Glas", price: "€6", desc: "Italienischer Schaumwein", tags: ["popular"], enabled: true },
            { id: "wn2", name: "Prosecco Flasche", price: "€25", desc: "0.75L Prosecco DOC", tags: [], enabled: true },
            { id: "wn3", name: "Weißwein", price: "€6", desc: "Hauswein 0.2L", tags: [], enabled: true },
            { id: "wn4", name: "Rotwein", price: "€6", desc: "Hauswein 0.2L", tags: [], enabled: true },
            { id: "wn5", name: "Rosé", price: "€6", desc: "Hauswein 0.2L", tags: [], enabled: true },
        ]
    },
    champagne: {
        name: "Champagne",
        icon: "🥂",
        description: "Celebrate with luxury bubbles",
        enabled: true,
        order: 8,
        drinks: [
            { id: "ch1", name: "Moët & Chandon", price: "€120", desc: "Imperial Brut 0.75L", tags: ["popular"], enabled: true },
            { id: "ch2", name: "Veuve Clicquot", price: "€140", desc: "Yellow Label 0.75L", tags: ["premium"], enabled: true },
            { id: "ch3", name: "Dom Pérignon", price: "€350", desc: "Vintage 0.75L", tags: ["premium"], enabled: true },
            { id: "ch4", name: "Ace of Spades", price: "€500", desc: "Armand de Brignac Gold 0.75L", tags: ["premium"], enabled: true },
        ]
    },
    specials: {
        name: "Specials",
        icon: "💎",
        description: "Exclusive house specialties",
        enabled: true,
        order: 9,
        drinks: [
            { id: "sp1", name: "Golden Hour", price: "€35", desc: "Champagner Cocktail mit 24K Goldflakes", tags: ["signature", "premium"], enabled: true },
            { id: "sp2", name: "Smoke & Mirrors", price: "€28", desc: "Smoked Bourbon mit Cherry und Bitters", tags: ["signature"], enabled: true },
            { id: "sp3", name: "The Velvet", price: "€30", desc: "Gin, Hibiskus, Champagner, essbare Blumen", tags: ["signature", "popular"], enabled: true },
            { id: "sp4", name: "Diamond Drop", price: "€40", desc: "Premium Vodka mit Trüffel-Honig", tags: ["premium"], enabled: true },
        ]
    }
};

/**
 * Hidden Drinks - Only searchable, not displayed in menu
 */
const hiddenDrinks = {
    secret_cocktails: {
        name: "Secret Menu",
        icon: "🤫",
        description: "Ask the bartender",
        enabled: true,
        hidden: true,
        drinks: [
            { id: "sec1", name: "Purple Rain", price: "€15", desc: "Vodka, Blue Curaçao, Grenadine, Sprite", tags: ["secret"], enabled: true },
            { id: "sec2", name: "Dark Knight", price: "€16", desc: "Black Vodka, Kahlúa, Espresso, Cream", tags: ["secret"], enabled: true },
            { id: "sec3", name: "Unicorn Tears", price: "€18", desc: "Gin, Elderflower, Glitter, Prosecco", tags: ["secret", "premium"], enabled: true },
            { id: "sec4", name: "Zombie", price: "€14", desc: "3 types of Rum, Lime, Falernum, Bitters", tags: ["secret", "strong"], enabled: true },
            { id: "sec5", name: "Painkiller", price: "€13", desc: "Rum, Coconut, Pineapple, Orange", tags: ["secret"], enabled: true },
        ]
    },
    classic_cocktails: {
        name: "Classic Cocktails",
        icon: "🍸",
        description: "Timeless classics",
        enabled: true,
        hidden: true,
        drinks: [
            { id: "cls1", name: "Old Fashioned", price: "€12", desc: "Bourbon, Sugar, Bitters, Orange", tags: ["classic"], enabled: true },
            { id: "cls2", name: "Manhattan", price: "€13", desc: "Rye Whiskey, Sweet Vermouth, Bitters", tags: ["classic"], enabled: true },
            { id: "cls3", name: "Negroni", price: "€12", desc: "Gin, Campari, Sweet Vermouth", tags: ["classic", "popular"], enabled: true },
            { id: "cls4", name: "Martini", price: "€14", desc: "Gin or Vodka, Dry Vermouth, Olive", tags: ["classic"], enabled: true },
            { id: "cls5", name: "Daiquiri", price: "€11", desc: "White Rum, Lime, Sugar", tags: ["classic"], enabled: true },
            { id: "cls6", name: "Margarita", price: "€12", desc: "Tequila, Cointreau, Lime, Salt", tags: ["classic", "popular"], enabled: true },
            { id: "cls7", name: "Whiskey Sour", price: "€11", desc: "Bourbon, Lemon, Sugar, Egg White", tags: ["classic"], enabled: true },
        ]
    },
    shooters: {
        name: "Party Shots",
        icon: "🎉",
        description: "Party shots collection",
        enabled: true,
        hidden: true,
        drinks: [
            { id: "sht1", name: "B-52", price: "€6", desc: "Kahlúa, Baileys, Grand Marnier (layered)", tags: ["shooter"], enabled: true },
            { id: "sht2", name: "Kamikaze", price: "€5", desc: "Vodka, Triple Sec, Lime", tags: ["shooter"], enabled: true },
            { id: "sht3", name: "Lemon Drop", price: "€5", desc: "Vodka, Lemon, Sugar Rim", tags: ["shooter", "popular"], enabled: true },
            { id: "sht4", name: "Jägerbomb", price: "€8", desc: "Jägermeister dropped in Red Bull", tags: ["shooter", "popular"], enabled: true },
            { id: "sht5", name: "Flaming Lamborghini", price: "€15", desc: "Kahlúa, Sambuca, Baileys (flaming)", tags: ["shooter", "fire"], enabled: true },
        ]
    },
    german_specialties: {
        name: "Deutsche Spezialitäten",
        icon: "🇩🇪",
        description: "German specialties",
        enabled: true,
        hidden: true,
        drinks: [
            { id: "de1", name: "Radler", price: "€4", desc: "Bier mit Zitronenlimonade", tags: ["german"], enabled: true },
            { id: "de2", name: "Diesel", price: "€4", desc: "Bier mit Cola", tags: ["german"], enabled: true },
            { id: "de3", name: "Mexikaner", price: "€5", desc: "Tomatensaft, Korn, Tabasco", tags: ["german", "shot"], enabled: true },
            { id: "de4", name: "Hugo", price: "€9", desc: "Prosecco, Holunderblütensirup, Minze", tags: ["german", "popular"], enabled: true },
            { id: "de5", name: "Glühwein", price: "€6", desc: "Mulled Wine (seasonal)", tags: ["german", "hot", "seasonal"], enabled: true },
        ]
    },
    virgin_drinks: {
        name: "Virgin & Mocktails",
        icon: "🥤",
        description: "Alcohol-free alternatives",
        enabled: true,
        hidden: true,
        drinks: [
            { id: "vr1", name: "Virgin Mojito", price: "€8", desc: "Lime, Mint, Sugar, Soda", tags: ["virgin", "popular"], enabled: true },
            { id: "vr2", name: "Virgin Piña Colada", price: "€9", desc: "Coconut Cream, Pineapple", tags: ["virgin"], enabled: true },
            { id: "vr3", name: "Shirley Temple", price: "€7", desc: "Ginger Ale, Grenadine, Cherry", tags: ["virgin", "classic"], enabled: true },
            { id: "vr4", name: "Virgin Strawberry Daiquiri", price: "€9", desc: "Strawberry, Lime, Sugar, Frozen", tags: ["virgin", "frozen"], enabled: true },
            { id: "vr5", name: "Tropical Sunrise", price: "€8", desc: "Orange, Pineapple, Grenadine", tags: ["virgin"], enabled: true },
        ]
    }
};

/**
 * German-English search aliases
 */
const searchAliases = {
    'beer': ['bier', 'biere', 'pils', 'pilsner', 'lager', 'weizen'],
    'wine': ['wein', 'rotwein', 'weisswein', 'weißwein', 'rosé'],
    'champagne': ['champagner', 'sekt', 'schaumwein', 'prosecco'],
    'cocktail': ['cocktails', 'mixgetränk', 'drink', 'drinks'],
    'shot': ['shots', 'kurze', 'schnaps', 'shooter'],
    'juice': ['saft', 'säfte'],
    'cola': ['coke', 'coca cola', 'coca-cola'],
    'vodka': ['wodka'],
    'whisky': ['whiskey', 'bourbon', 'scotch'],
    'rum': ['bacardi'],
    'gin': ['bombay', 'tanqueray', 'hendricks'],
    'non-alcoholic': ['alkoholfrei', 'ohne alkohol', 'virgin', 'mocktail'],
    'bottle': ['flasche', 'flaschen'],
    'energy': ['redbull', 'red bull', 'bull'],
    'lemon': ['zitrone', 'lemonade', 'limonade'],
    'orange': ['orangensaft', 'orangen'],
    'passion fruit': ['maracujasaft', 'maracuja'],
    'mint': ['minze', 'pfefferminz'],
    'lime': ['limette'],
    'hot': ['heiss', 'heiß', 'warm'],
    'cold': ['kalt', 'iced', 'frozen'],
    'sweet': ['süß', 'suess'],
    'strong': ['stark'],
    'premium': ['luxus', 'exclusive'],
    'classic': ['klassisch', 'klassiker'],
    'secret': ['geheim', 'hidden'],
    'popular': ['beliebt', 'favorit'],
    'new': ['neu'],
    'german': ['deutsch', 'deutsche']
};

/**
 * Admin credentials (در نسخه واقعی باید hash شده باشه)
 */
const adminConfig = {
    username: "admin",
    password: "Ali2026"
};