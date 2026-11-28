// Page de connexion : envoie les identifiants, enregistre la session, redirige.

const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");

// Déjà connecté : la page de connexion n'a plus d'intérêt
if (isLoggedIn()) {
    window.location.href = "index.html";
}

function showLoginError(message) {
    loginStatus.textContent = message;
    loginStatus.classList.add("is-error");
}

async function handleLogin(event) {
    // Sans cela, le navigateur rechargerait la page et on perdrait tout
    event.preventDefault();

    const username = loginForm.elements.username.value.trim();
    const password = loginForm.elements.password.value;
    const submitButton = loginForm.querySelector("button[type=submit]");

    // État « chargement »
    submitButton.disabled = true;
    loginStatus.classList.remove("is-error");
    loginStatus.textContent = "Connexion en cours…";

    try {
        const result = await loginUser(username, password);
        saveSession(result.token, result.user);
        window.location.href = "index.html";
    } catch (error) {
        showLoginError(error.message);
    } finally {
        // finally s'exécute dans tous les cas : succès ou erreur
        submitButton.disabled = false;
    }
}

loginForm.addEventListener("submit", handleLogin);