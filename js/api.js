// Adresse de base du back. Chemin relatif : en production, le front est servi par le back.
const API_BASE_URL = "/api";

// true tant que les routes n'existent pas côté back ; passer à false pour utiliser le vrai serveur.
const USE_MOCK = true;

// Données fictives calquées sur la table "product" de schema.sql (prix en centimes).
const MOCK_PRODUCTS = [
    { id_product: "P1", name: "Sandwich jambon", price: 350, stock: 12, availability: 1 },
    { id_product: "P2", name: "Salade César", price: 520, stock: 0, availability: 1 },
    { id_product: "P3", name: "Compote", price: 150, stock: 30, availability: 0 }
];

// Données fictives calquées sur la table "menu" + la table d'association "menu_product".
const MOCK_MENUS = [
    {
        id_menu: "M1",
        name: "Menu midi",
        price: 750,
        availability: 1,
        start_date: null,
        end_date: null,
        products: [
            { id_product: "P1", name: "Sandwich jambon", quantity: 1 },
            { id_product: "P3", name: "Compote", quantity: 1 }
        ]
    },
    {
        id_menu: "M2",
        name: "Menu de la semaine",
        price: 900,
        availability: 0,
        start_date: "2026-11-30",
        end_date: "2026-12-04",
        products: [
            { id_product: "P2", name: "Salade César", quantity: 1 },
            { id_product: "P3", name: "Compote", quantity: 2 }
        ]
    }
];

// Point de passage unique vers le back : token, JSON et erreurs sont gérés ici, une seule fois.
// options = { method: "POST", body: {...} } ; par défaut, une requête GET sans corps.
async function request(path, options = {}) {
    const headers = { "Content-Type": "application/json" };

    // getToken() vient de auth.js : il est défini au moment où request() est appelée
    const token = getToken();
    if (token !== null) {
        headers["Authorization"] = "Bearer " + token;
    }

    let response;
    try {
        response = await fetch(API_BASE_URL + path, {
            method: options.method || "GET",
            headers: headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body)
        });
    } catch (networkError) {
        // fetch n'échoue que si le serveur est injoignable (pas pour un code 404 ou 500)
        throw new Error("Impossible de contacter le serveur. Réessayez plus tard.");
    }

    if (!response.ok) {
        // Le contrat prévoit des erreurs au format {"detail": "message"}
        const body = await response.json().catch(() => null);
        const hasDetail = body !== null && typeof body.detail === "string";
        throw new Error(hasDetail ? body.detail : "Erreur du serveur (code " + response.status + ").");
    }

    // 204 = succès sans contenu (ex. suppression) : il n'y a pas de JSON à lire
    if (response.status === 204) {
        return null;
    }
    return await response.json();
}

async function getHealth() {
    return await request("/health");
}

// Route supposée GET /api/products : à confirmer dans docs/API.md
async function getProducts() {
    if (USE_MOCK) {
        return MOCK_PRODUCTS;
    }
    return await request("/products");
}

// Route supposée GET /api/menus : à confirmer dans docs/API.md
async function getMenus() {
    if (USE_MOCK) {
        return MOCK_MENUS;
    }
    return await request("/menus");
}

// Comptes fictifs pour tester les 3 cas : utilisateur, compte bloqué, administrateur.
// Ce ne sont que des données de test : elles disparaîtront avec USE_MOCK = false.
const MOCK_USERS = [
    { username: "alice", password: "alice123", role: "user", blocked: false },
    { username: "bob", password: "bob123", role: "user", blocked: true },
    { username: "admin", password: "admin123", role: "admin", blocked: false }
];

// Imite les réponses du back : 401 si identifiants faux, 403 si compte bloqué.
function mockLogin(username, password) {
    const user = MOCK_USERS.find((candidate) =>
        candidate.username === username && candidate.password === password
    );

    if (user === undefined) {
        throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
    }
    if (user.blocked) {
        throw new Error("Ce compte est bloqué. Contactez un administrateur.");
    }
    return { token: "mock-token-" + user.username, user: { username: user.username, role: user.role } };
}

// Route proposée POST /api/auth/login : à confirmer dans docs/API.md
async function loginUser(username, password) {
    if (USE_MOCK) {
        return mockLogin(username, password);
    }
    return await request("/auth/login", {
        method: "POST",
        body: { username: username, password: password }
    });
}