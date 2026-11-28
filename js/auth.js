// Gestion de la session : token, utilisateur connecté, rôle, menu de navigation.

// Clés du localStorage, préfixées pour ne pas entrer en conflit avec d'autres sites en local.
const TOKEN_KEY = "poleatheck_token";
const USER_KEY = "poleatheck_user";

// localStorage ne stocke que du texte : l'objet utilisateur est converti en JSON.
function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser === null ? null : JSON.parse(savedUser);
}

function isLoggedIn() {
    return getToken() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user !== null && user.role === "admin";
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
}

// À appeler en haut des pages réservées. Ce n'est que du confort :
// le back refusera de toute façon une requête sans token valide (401).
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        window.location.href = "index.html";
    }
}

// data-role="guest"  : visible seulement pour un visiteur non connecté
// data-role="logged" : visible pour toute personne connectée
// data-role="admin"  : visible seulement pour un administrateur
function canSee(role) {
    if (role === "guest") {
        return !isLoggedIn();
    }
    if (role === "logged") {
        return isLoggedIn();
    }
    if (role === "admin") {
        return isAdmin();
    }
    return true;
}

function updateNavigation() {
    for (const item of document.querySelectorAll("[data-role]")) {
        item.hidden = !canSee(item.dataset.role);
    }

    const logoutButton = document.getElementById("logout-button");
    if (logoutButton !== null) {
        logoutButton.addEventListener("click", logout);
    }
}

// auth.js est chargé sur toutes les pages (en defer, donc le HTML existe déjà) :
// le menu est mis à jour automatiquement partout.
updateNavigation();