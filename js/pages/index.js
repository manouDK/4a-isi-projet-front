// Affichage du catalogue public : menus et produits.

// Les prix sont stockés en centimes (350) : on les affiche en euros (« 3,50 € »).
function formatPrice(cents) {
    return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// "2026-11-30" -> "30/11/2026". On découpe la chaîne plutôt que d'utiliser new Date(),
// qui peut décaler d'un jour à cause du fuseau horaire.
function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return day + "/" + month + "/" + year;
}

// Badge vert ou rouge, partagé par les cartes produit et menu.
function setAvailability(element, isAvailable, text) {
    element.textContent = text;
    if (!isAvailable) {
        element.classList.add("is-unavailable");
    }
}

function createProductCard(product) {
    // cloneNode(true) copie le contenu du template avec tous ses enfants
    const card = document.getElementById("product-card-template").content.cloneNode(true);

    card.querySelector(".card-title").textContent = product.name;
    card.querySelector(".card-price").textContent = formatPrice(product.price);

    const isAvailable = product.availability === 1 && product.stock > 0;
    const text = isAvailable ? "Disponible (" + product.stock + " en stock)" : "Indisponible";
    setAvailability(card.querySelector(".card-availability"), isAvailable, text);

    return card;
}

function createMenuCard(menu) {
    const card = document.getElementById("menu-card-template").content.cloneNode(true);

    card.querySelector(".card-title").textContent = menu.name;
    card.querySelector(".card-price").textContent = formatPrice(menu.price);

    // Sans dates, le menu est permanent (règle du CHECK dans schema.sql)
    const dates = card.querySelector(".card-dates");
    if (menu.start_date === null) {
        dates.textContent = "Menu permanent";
    } else {
        dates.textContent = "Du " + formatDate(menu.start_date) + " au " + formatDate(menu.end_date);
    }

    const isAvailable = menu.availability === 1;
    setAvailability(card.querySelector(".card-availability"), isAvailable, isAvailable ? "Disponible" : "Indisponible");

    const productList = card.querySelector(".card-products");
    for (const product of menu.products) {
        const item = document.createElement("li");
        item.textContent = product.quantity + " × " + product.name;
        productList.appendChild(item);
    }

    return card;
}

// Logique commune aux deux sections : chargement -> erreur, vide ou résultat.
async function loadSection(fetchItems, createCard, listId, statusId, emptyMessage) {
    const list = document.getElementById(listId);
    const status = document.getElementById(statusId);

    try {
        const items = await fetchItems();

        if (items.length === 0) {
            status.textContent = emptyMessage;
            return;
        }

        for (const item of items) {
            list.appendChild(createCard(item));
        }
        // Texte vide => le CSS (.status:empty) masque le message de chargement
        status.textContent = "";
    } catch (error) {
        status.textContent = error.message;
        status.classList.add("is-error");
    }
}

// Les scripts sont en "defer" : le HTML est déjà chargé et api.js est déjà lu.
loadSection(getMenus, createMenuCard, "menus-list", "menus-status", "Aucun menu pour le moment.");
loadSection(getProducts, createProductCard, "products-list", "products-status", "Aucun produit pour le moment.");