const localStorage_keys = {
    access_token: 'spotify_access_token',
    refresh_token: 'spotify_refresh_token',
    expires_in: 'spotify_expires_in',
    timestamp: 'spotify_token_timestamp'
};

const localStorage_values = {
    access_token: window.localStorage.getItem(localStorage_keys.access_token),
    refresh_token: window.localStorage.getItem(localStorage_keys.refresh_token),
    expires_in: window.localStorage.getItem(localStorage_keys.expires_in),
    timestamp: window.localStorage.getItem(localStorage_keys.timestamp)
};

/**
 * Partendo dall'url prende i parametri e li restituisce
 * da prendere: access_token, refresh_token e expires_in
 * @param {string} url 
 * @returns {object} {access_token, refresh_token, expires_in}
 */
const findUrlParams = (url) => {
    let r = {};

    url = url.slice(1); //elimino il carattere '?'
    let data = url.split('&');

    data.forEach((data) => {
        let pair = data.split('=');
        Object.defineProperty(r, pair[0], {value: pair[1]});
    })

    return r;
}

/**
 * Cancella tutto il localStorage e ricarica la pagina
 * @returns {void}
 */

export const logout = () => {
    //cancella il localStorage
    for(let property in localStorage_keys){
        window.localStorage.removeItem(localStorage_keys[property]);
    }

    //torna alla homepage
    window.location = window.location.origin;
}

/**
 * Controlla se il token di accesso è scomparso
 * @returns {boolean} il token di accesso è scomparso o no
 */

const hasTokenExpired = () => {
    const {access_token, timestamp, expires_in} = localStorage_values;
    if(!access_token || !timestamp) return false;

    //controlla se il numero di secondi trascorsi è maggiore di expires_in(3600 secondi)
    const milliSecondsElapsed = Date.now() - Number(timestamp);
    return (milliSecondsElapsed / 1000) > Number(expires_in);
};

/**
 * Chiede un nuovo token di accesso alla nostra app node nell'endpoint '/refresh-token'
 * aggiorna i dati nel localStorage con quelli ricevuti nella response
 * @returns {void}
 */

const refresh_token = async() =>{

    try {
         //Logout se non c'è un refresh_token o siamo in un loop infinito di reload
         if (!localStorage_values.refresh_token ||
            localStorage_values.refresh_token === 'undefined' ||
          (Date.now() - Number(localStorage_values.timestamp) / 1000) < 1000
        ) {
          console.error('No refresh token available');
          logout();
        }
    
        //Usa l'enpoint /refresh_token per prendere i dati
        const { data } = await axios.get(`http://localhost:5500/refresh-token?refresh_token=${localStorage_values.refresh_token}`);
    
        //Aggiorniamo i dati
        window.localStorage.setItem(localStorage_keys.access_token, data.access_token);
        window.localStorage.setItem(localStorage_keys.timestamp, Date.now());
    
        //Aggiorniamo la pagina
        window.location.reload();
    
      } catch (e) {
        console.error(e);
      }


    /*try{
        //Logout se non c'è un refresh_token o siamo in un loop infinito di reload
        if(!localStorage_values.refresh_token || localStorage_values.refresh_token === 'undefined' ||
            (Date.now() - Number(localStorage_values.timestamp)) / 1000 < 1000){
                console.error("Nessun refresh_token disponibile");
                logout();
            }
        console.log("Sto provando a richiedere il nuovo token");
        //Usa l'enpoint /refresh_token per prendere i dati
        let newData = await axios(`http://localhost:5500/refresh-token?refresh_token=${refresh_token}`);
        console.log(newData);

        //Aggiorniamo i dati
        console.log(`nuovo token di accesso: ${newData.access_token}`);
        window.localStorage.setItem(localStorage_keys.access_token, newData.access_token);
        window.localStorage.setItem(localStorage_keys.timestamp, Date.now());

        //Aggiorna la pagina
        window.location.reload();
    }
    catch(e){
        console.error(e);
    }
    */
};

/**
 * Utilizza la logica del localStorage per gestire i token di accesso
 * @returns {string} token di accesso a Spotify
 */
let getAccessToken = () => {
    let url = window.location.search;
    let urlParams = findUrlParams(url);

    const queryParams = {
        [localStorage_keys.access_token]: urlParams.access_token,
        [localStorage_keys.refresh_token]: urlParams.refresh_token,
        [localStorage_keys.expires_in]: urlParams.expires_in
    };
    
    const hasError = urlParams.error;
    //se ci sono errori o il token è scomparso usa il refresh_token per richiederene un altro
    if(hasError || hasTokenExpired() || localStorage_keys.access_token === 'undefined'){
        refresh_token();
    }

    //se c'è un token valido usalo
    if(localStorage_keys.access_token && localStorage_values.access_token !== 'undefined' && localStorage_values.access_token !== null) {
        return localStorage_keys.access_token;
    }

    //se c'è un token nei parametri dell'URL allora l'utente sta facendo il login per la prima volta
    if(queryParams[localStorage_keys.access_token]){
        //raccogli i parametri nel localStorage
        for(let property in queryParams){
            window.localStorage.setItem(property, queryParams[property]);
        }
        //imposta il timestamp
        window.localStorage.setItem(localStorage_keys.timestamp, Date.now());

        return queryParams[localStorage_keys.access_token];
    }

    //non dovremmo essere qui
    return false;
};

export const access_token = getAccessToken();

/**
 * Axios global request headers
 * https://github.com/axios/axios#global-axios-defaults
 */

axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${localStorage_values.access_token}`;
axios.defaults.headers['Content-Type'] = 'application/json';

/**
 * Get Current User's Profile
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-current-users-profile
 * @returns {Promise}
 */
export const getCurrentUserProfile = () => axios.get('/me');

/**
 * 
 * Get User's Top Item
 * https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-top-artists-and-tracks
 * @param {string} type 
 * @param {number} limit 
 * @param {string} time_range 
 * @returns 
 */

export const getUserTopItems = (type, limit, time_range) => {
    return axios({
        method: 'get',
        url: `/me/top/${type}?limit=${limit}&time_range=${time_range}`,
        data: new URLSearchParams({
            limit: limit,
            time_range: time_range
        }),
    })
}

/**
 * Get Artist
 * @param {string} id 
 * @returns artista
 */
export const getArtist = (id) => axios(`/artists/${id}`);

/**
 * Get User's Recently Played Tracks
 * @param {number} limit 
 * @returns 
 */
export const getRecentlyPlayed = (limit) => {
    return axios(`/me/player/recently-played?limit=${limit}`);
};

/**
 * Get Playlist
 * @param {string} id ID della playlist
 * @returns 
 */
export const getPlaylist = (id) => axios(`/playlists/${id}`);

/**
 * Get Album
 * @param {string} id 
 * @returns 
 */
export const getAlbum = (id) => axios(`/albums/${id}`);

/**
 * Get Current User's Playlists
 * @returns playlist dell'utente
 */
export const getCurrentUserPlaylists = () => axios(`/me/playlists`);

/**
 * 
 * @param {string} q cosa vuole cercare
 * @param {Array} type tipi di risultato(playlist, album, ecc...) 
 * @param {Number} limit limite 
 */
export const makeQuerySearch = (q, type, limit) => {
    let typeString = type.join(',');

    return axios(`/search?q=${q}&type=${type}&limit=${limit}`);
}