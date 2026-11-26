const API_BASE_URL = "/api";

async function getHealth() {
    const response = await fetch(API_BASE_URL + "/health");
    
    if (!response.ok) {
        throw new Error("Le serveur ne répond pas correctement (code " + response.status + ").");
    }

    return await response.json();
}