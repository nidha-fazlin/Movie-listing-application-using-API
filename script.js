const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const grid = document.getElementById('movie-grid');
const statsBar = document.getElementById('stats-bar');
const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeModalButton = document.getElementById('close-modal');

const API_BASE = 'https://www.omdbapi.com/';
const API_KEY = 'thewdb';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const searchTerm = queryInput.value.trim();
  if (!searchTerm) return;

  statsBar.textContent = 'Searching...';
  grid.innerHTML = '';

  try {
    const movies = await fetchMovies(searchTerm);
    if (!movies.length) {
      statsBar.textContent = `No movies found for "${searchTerm}".`;
      return;
    }

    statsBar.textContent = `Found ${movies.length} movie${movies.length === 1 ? '' : 's'} for "${searchTerm}".`;
    renderMovies(movies);
  } catch (error) {
    statsBar.textContent = 'Unable to fetch movies. Please try again later.';
    console.error(error);
  }
});

async function fetchMovies(query) {
  const response = await fetch(`${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
  const data = await response.json();
  if (!data || data.Response === 'False') return [];
  return data.Search || [];
}

function renderMovies(movies) {
  grid.innerHTML = movies
    .map((movie) => {
      const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Image';
      return `
      <article class="movie-card">
        <img class="poster" src="${poster}" alt="Poster for ${movie.Title}" />
        <div class="movie-details">
          <h2 class="movie-title">${movie.Title}</h2>
          <p class="movie-meta">
            <span>${movie.Year}</span>
            <span class="badge">${movie.Type || 'Movie'}</span>
          </p>
          <button type="button" data-imdbid="${movie.imdbID}">View Details</button>
        </div>
      </article>`;
    })
    .join('');

  grid.querySelectorAll('button[data-imdbid]').forEach((button) => {
    button.addEventListener('click', async () => {
      const imdbID = button.dataset.imdbid;
      await showMovieDetails(imdbID);
    });
  });
}

async function showMovieDetails(imdbID) {
  try {
    const detail = await fetchMovieDetails(imdbID);
    if (!detail || detail.Response === 'False') {
      alert('Movie details are not available.');
      return;
    }

    const poster = detail.Poster && detail.Poster !== 'N/A' ? detail.Poster : 'https://via.placeholder.com/400x600?text=No+Image';
    modalBody.innerHTML = `
      <div class="modal-grid">
        <img class="modal-poster" src="${poster}" alt="Poster for ${detail.Title}" />
        <div class="modal-copy">
          <h2>${detail.Title}</h2>
          <p>${detail.Plot !== 'N/A' ? detail.Plot : 'No description available.'}</p>
          <div class="info-list">
            <div class="info-item"><span>Year</span><span>${detail.Year}</span></div>
            <div class="info-item"><span>Genre</span><span>${detail.Genre}</span></div>
            <div class="info-item"><span>Runtime</span><span>${detail.Runtime}</span></div>
            <div class="info-item"><span>Director</span><span>${detail.Director}</span></div>
            <div class="info-item"><span>Rating</span><span>${detail.imdbRating !== 'N/A' ? detail.imdbRating : '—'}</span></div>
          </div>
        </div>
      </div>`;

    modal.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    alert('There was an error loading movie details.');
  }
}

async function fetchMovieDetails(imdbID) {
  const response = await fetch(`${API_BASE}?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`);
  return response.json();
}

closeModalButton.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    modal.classList.add('hidden');
  }
});
