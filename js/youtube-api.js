/**
 * YouTube API Integration for Cozy Keep Playlist
 * Fetches and displays all videos from a YouTube playlist
 * 
 * ⚠️ IMPORTANTE: La API key se carga desde js/config.js
 * Asegúrate de tener el archivo config.js configurado (ver config.example.js)
 * 
 * ⚠️ IMPORTANTE: El ID de la playlist debe definirse en la página antes de cargar este script:
 * <script>window.YOUTUBE_PLAYLIST_ID = 'TU_PLAYLIST_ID';</script>
 */

// URL base de la API de YouTube
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Convierte la duración ISO 8601 de YouTube a formato legible
 * @param {string} duration - Duración en formato ISO 8601 (ej: PT15M33S)
 * @returns {string} Duración formateada (ej: 15:33)
 */
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    if (hours) {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}

/**
 * Formatea la fecha de publicación
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatPublishedDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

/**
 * Trunca el texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Obtiene todos los vídeos de la lista de reproducción
 * @returns {Promise<Array>} Array de vídeos
 */
async function fetchPlaylistVideos() {
    let allVideos = [];
    let nextPageToken = '';
    const playlistId = window.YOUTUBE_PLAYLIST_ID;

    try {
        // Obtener todos los items de la playlist (con paginación)
        do {
            const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${CONFIG.YOUTUBE_API_KEY}${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;

            const response = await fetch(playlistUrl);

            if (!response.ok) {
                throw new Error(`Error al obtener la playlist: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            allVideos = allVideos.concat(data.items);
            nextPageToken = data.nextPageToken || '';

        } while (nextPageToken);

        // Obtener detalles de los vídeos (duración, estadísticas)
        const videoIds = allVideos.map(item => item.contentDetails.videoId).join(',');
        const videosUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${videoIds}&key=${CONFIG.YOUTUBE_API_KEY}`;

        const videosResponse = await fetch(videosUrl);

        if (!videosResponse.ok) {
            throw new Error(`Error al obtener detalles de vídeos: ${videosResponse.status}`);
        }

        const videosData = await videosResponse.json();

        // Combinar datos de playlist con detalles de vídeos
        const videosWithDetails = allVideos.map(item => {
            const videoDetails = videosData.items.find(v => v.id === item.contentDetails.videoId);
            return {
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                publishedAt: item.snippet.publishedAt,
                duration: videoDetails?.contentDetails?.duration || 'PT0S',
                viewCount: videoDetails?.statistics?.viewCount || '0'
            };
        });

        return videosWithDetails;

    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        throw error;
    }
}

/**
 * Crea el HTML para una tarjeta de vídeo
 * @param {Object} video - Datos del vídeo
 * @returns {string} HTML de la tarjeta
 */
function createVideoCard(video) {
    const formattedDuration = formatDuration(video.duration);
    const formattedDate = formatPublishedDate(video.publishedAt);
    const truncatedDescription = truncateText(video.description, 120);
    const formattedViews = parseInt(video.viewCount).toLocaleString('es-ES');

    return `
        <article class="video-card">
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="video-duration">${formattedDuration}</div>
                    <div class="play-overlay">
                        <i class="fa-solid fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${truncatedDescription}</p>
                    <div class="video-meta">
                        <span><i class="fa-solid fa-eye"></i> ${formattedViews} visualizaciones</span>
                        <span><i class="fa-solid fa-calendar"></i> ${formattedDate}</span>
                    </div>
                </div>
            </a>
        </article>
    `;
}

/**
 * Muestra un indicador de carga
 */
function showLoading() {
    const videosGrid = document.querySelector('.videos-grid');
    videosGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando vídeos de la lista de reproducción...</p>
        </div>
    `;
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    const videosGrid = document.querySelector('.videos-grid');
    const playlistId = window.YOUTUBE_PLAYLIST_ID;

    videosGrid.innerHTML = `
        <div class="error-container">
            <i class="fa-solid fa-exclamation-triangle fa-3x"></i>
            <p class="error-message">${message}</p>
            <p class="error-hint">Por favor, verifica la configuración de la API key o visita la lista directamente en YouTube.</p>
            ${playlistId ? `
            <a href="https://www.youtube.com/playlist?list=${playlistId}" target="_blank" rel="noopener noreferrer" class="youtube-link-btn">
                <i class="fa-brands fa-youtube"></i> Ver en YouTube
            </a>
            ` : ''}
        </div>
    `;
}

/**
 * Renderiza todos los vídeos en la página
 * @param {Array} videos - Array de vídeos
 */
function renderVideos(videos) {
    const videosGrid = document.querySelector('.videos-grid');

    if (videos.length === 0) {
        videosGrid.innerHTML = `
            <div class="no-videos-container">
                <i class="fa-brands fa-youtube fa-3x"></i>
                <p>No se encontraron vídeos en esta lista de reproducción.</p>
            </div>
        `;
        return;
    }

    const videosHTML = videos.map(video => createVideoCard(video)).join('');
    videosGrid.innerHTML = videosHTML;

    // Actualizar el contador de vídeos
    const videosNote = document.querySelector('.videos-note');
    if (videosNote) {
        videosNote.textContent = `${videos.length} vídeo${videos.length !== 1 ? 's' : ''} en esta lista de reproducción.`;
    }
}

/**
 * Inicializa la carga de vídeos cuando la página está lista
 */
async function initializePlaylist() {
    // Verificar si el archivo de configuración existe y tiene la API key
    if (typeof CONFIG === 'undefined') {
        showError('⚠️ Archivo de configuración no encontrado. Por favor, crea el archivo js/config.js basándote en config.example.js');
        return;
    }

    if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === 'TU_API_KEY_AQUI') {
        showError('⚠️ API Key no configurada. Por favor, configura tu API key de YouTube en el archivo js/config.js');
        return;
    }

    if (!window.YOUTUBE_PLAYLIST_ID) {
        showError('⚠️ ID de lista de reproducción no definido. Por favor define window.YOUTUBE_PLAYLIST_ID en el HTML antes de cargar este script.');
        return;
    }

    showLoading();

    try {
        const videos = await fetchPlaylistVideos();
        renderVideos(videos);
    } catch (error) {
        showError('Error al cargar los vídeos de YouTube. ' + error.message);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePlaylist);
} else {
    initializePlaylist();
}
