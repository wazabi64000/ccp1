/* js/annonces.js
  Contient :
  - un tableau d'annonces (JSON-like)
  - fonctions pour rendre les annonces
  - gestion des favoris via localStorage
  - recherche + filtre + tri simple
*/

const annonces = [
  {
    id: 1,
    titre: "iPhone 14 Pro",
    description: "Comme neuf, 128 Go, couleur argent.",
    prix: 950,
    image: "https://via.placeholder.com/640x360?text=iPhone+14+Pro",
    categorie: "Electronique",
    date: "2025-02-15"
  },
  {
    id: 2,
    titre: "Vélo électrique urbain",
    description: "Autonomie 60 km, parfait pour la ville.",
    prix: 1200,
    image: "https://via.placeholder.com/640x360?text=Velo+Electrique",
    categorie: "Transport",
    date: "2025-05-02"
  },
  {
    id: 3,
    titre: "PC Portable Gaming",
    description: "RTX 3060, 16GB RAM, SSD 512GB.",
    prix: 1500,
    image: "https://via.placeholder.com/640x360?text=PC+Gaming",
    categorie: "Informatique",
    date: "2025-03-10"
  },
  {
    id: 4,
    titre: "Canapé 3 places",
    description: "Tissu gris, très confortable.",
    prix: 400,
    image: "https://via.placeholder.com/640x360?text=Canape",
    categorie: "Maison",
    date: "2025-01-12"
  }
];

/* ---------- Helpers localStorage (favoris) ---------- */
function getFavoris(){
  try{
    return JSON.parse(localStorage.getItem('ccp1_favoris')) || [];
  }catch(e){
    console.error('localStorage parse error', e);
    return [];
  }
}
function saveFavoris(favs){
  localStorage.setItem('ccp1_favoris', JSON.stringify(favs));
}
function toggleFavori(id){
  const favs = getFavoris();
  const idx = favs.indexOf(id);
  if(idx >= 0){
    favs.splice(idx,1);
  }else{
    favs.push(id);
  }
  saveFavoris(favs);
  renderAnnonces(currentState); // re-render to update buttons
}

/* ---------- Rendering ---------- */
const container = document.getElementById('annoncesContainer');
const searchInput = document.getElementById('search') || null;
const filterSelect = document.getElementById('filterCategorie') || null;
const sortSelect = document.getElementById('sort') || null;

let currentState = {
  data: annonces.slice(),
  search: '',
  categorie: 'all',
  sort: 'none'
};

function formatPrice(n){
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function applyFilters(state){
  let list = annonces.slice();

  // search
  if(state.search && state.search.trim() !== ''){
    const q = state.search.toLowerCase();
    list = list.filter(a => a.titre.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }

  // category
  if(state.categorie && state.categorie !== 'all'){
    list = list.filter(a => a.categorie === state.categorie);
  }

  // sort
  if(state.sort === 'price-asc'){
    list.sort((a,b) => a.prix - b.prix);
  }else if(state.sort === 'price-desc'){
    list.sort((a,b) => b.prix - a.prix);
  }else if(state.sort === 'date-desc'){
    list.sort((a,b) => new Date(b.date) - new Date(a.date));
  }

  return list;
}

function renderAnnonces(state){
  const list = applyFilters(state);
  container.innerHTML = '';
  const favoris = getFavoris();

  if(list.length === 0){
    container.innerHTML = '<p>Aucune annonce trouvée.</p>';
    return;
  }

  list.forEach(a => {
    const card = document.createElement('article');
    card.className = 'carte';
    card.setAttribute('tabindex', '0'); // focusable
    card.innerHTML = `
      <img src="${a.image}" alt="${a.titre}">
      <h3>${a.titre}</h3>
      <p class="muted">${a.categorie} • ${a.date}</p>
      <p>${a.description}</p>
      <p class="prix">${formatPrice(a.prix)}</p>
      <div style="display:flex;gap:.5rem;align-items:center;margin-top:.5rem;">
        <button class="btn btn-primary btn-fav" data-id="${a.id}" aria-pressed="${favoris.includes(a.id)}">
          ${favoris.includes(a.id) ? 'En favoris ✓' : 'Ajouter aux favoris'}
        </button>
        <button class="btn btn-ghost" data-id="${a.id}" onclick="alert('Détail : ${a.titre}')">Voir</button>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ---------- Init UI controls ---------- */
function initControls(){
  // search
  if(searchInput){
    searchInput.addEventListener('input', e => {
      currentState.search = e.target.value;
      renderAnnonces(currentState);
    });
  }

  // filter
  if(filterSelect){
    filterSelect.addEventListener('change', e => {
      currentState.categorie = e.target.value;
      renderAnnonces(currentState);
    });
  }

  // sort
  if(sortSelect){
    sortSelect.addEventListener('change', e => {
      currentState.sort = e.target.value;
      renderAnnonces(currentState);
    });
  }

  // delegation pour boutons favoris (évite d'attacher un gestionnaire par carte)
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if(!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    toggleFavori(id);
    e.target.blur();
  });
}

/* ---------- Utils : remplir la liste des catégories dynamiquement ---------- */
function populateCategories(){
  const select = document.getElementById('filterCategorie');
  if(!select) return;
  const cats = Array.from(new Set(annonces.map(a => a.categorie)));
  select.innerHTML = '<option value="all">Toutes catégories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

/* ---------- On DOM ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  initControls();
  renderAnnonces(currentState);
});

/* ---------- Expose some helpers to global scope for debugging (optionnel) ---------- */
window.ccp1 = {
  annonces,
  getFavoris,
  saveFavoris,
  renderAnnonces
};
