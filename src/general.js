import { logout } from "./spotify.mjs";
import { fetchAlbum, fetchArtist, fetchPlaylist, fetchRecentlyPlayedTracks, fetchUserTop } from "./middle.js";

//logout
export const logOut = () => {
    let logoutBtn = document.getElementById("logout");
    logoutBtn.addEventListener("click", () => {
        logout();
    });
};

/**
 * Prende l'ID della risorsa dall'uri passato come parametro
 * @param {string} uri URI della risorsa
 * @returns ID della risorsa
 */
export const getIDfromURI = (uri) => {
    let items = uri.split('/');
    
    return items[items.length - 1];
}

let getUserTopAlbums = async(time_range) => {
    let userTracks = await fetchUserTop('tracks', 50, time_range);
    let userTracksItems = userTracks.items;

    let occ = new Map(); //mappa di occorrenze

    userTracksItems.forEach(track => {
        let trackAlbum = {
            name: track.album.name,
            img: track.album.images[0].url,
            artist: track.artists[0].name,
            releaseDate: track.album.release_date
        };

        occ.set(trackAlbum, occ.get(trackAlbum) + 1 || 1);
    });

    let sortedOcc = new Map([...occ.entries()].sort((a, b) => b[1] - a[1]));
    let albums = [...sortedOcc].map(a => a[0]);

    return albums;
}

/**
 * Risponde alla richiesta dell'utente fatta per la prima volta
 * @param {string} type 
 * @returns dati in long_term
 */
export const makeRequest = async(type, time_range) => {
    switch(type){
        case 'tracks':
            return await fetchUserTop('tracks', 50, time_range);
        case 'albums':
            return await getUserTopAlbums(time_range);
        case 'artists':
            return await fetchUserTop('artists', 50, time_range);
        case 'recent':
            return await fetchRecentlyPlayedTracks(50);
        default:
            console.error("tipo errato");
    }
}

let getDuration = (millisec) =>{
    let sec = millisec / 1000;
    let min = sec / 60;
    sec %= 60;

    let minStr = `${min.toFixed(0)}`;
    if(min < 10) minStr = `0${min.toFixed(0)}`;

    let secStr = `${sec.toFixed(0)}`;
    if(sec < 10) secStr = `0${sec.toFixed(0)}`;

    return `${minStr} : ${secStr}`;
}

function clear(){
    let container = document.getElementById('result-container');

    while (container.lastElementChild) {
        container.removeChild(container.lastElementChild);
    }
}

/**
 * Mostra le migliori tracce
 * @param {*} data 
 */
export function showTracks(data){
    clear();
    let tracks = data.items;
    let tracksContainer = document.getElementById('result-container');
    let cont = 1;

    tracks.forEach(track => {
        let trackContainer = document.createElement('div');
        trackContainer.classList.add('item-container');

        let trackCounter = document.createElement('p');
        trackCounter.classList.add('item-couter');
        trackCounter.innerHTML = cont;
        cont ++;

        let title = document.createElement('h2');
        let artist = document.createElement('p');
        let trackText = document.createElement('div');
        let trackInfo = document.createElement('div');
        let image = document.createElement('img');
        let duration = document.createElement('p');

        trackText.classList.add('item-text');
        trackInfo.classList.add('item-info');
        duration.classList.add('item-secondInfo');


        title.innerHTML = track.name;
        artist.innerHTML = track.artists[0].name;
        trackText.appendChild(title);
        trackText.appendChild(artist);
        image.src = track.album.images[1].url;

        trackInfo.appendChild(image);
        trackInfo.appendChild(trackText);

        duration.innerHTML = getDuration(track.duration_ms);
        
        trackContainer.appendChild(trackCounter);
        trackContainer.appendChild(trackInfo);
        trackContainer.appendChild(duration);

        tracksContainer.appendChild(trackContainer);
    });
}

/**
 * Mostra i migliori album
 * @param {*} data 
 */
export function showAlbums(data){
    clear();
    let albums = data;
    let albumsContainer = document.getElementById('result-container');
    let cont = 1;

    albums.forEach(album => {
        let albumContainer = document.createElement('div');
        albumContainer.classList.add('item-container');

        let albumCounter = document.createElement('p');
        albumCounter.classList.add('item-couter');
        albumCounter.innerHTML = cont;
        cont ++;

        let albumInfo = document.createElement('div');
        let albumText = document.createElement('div');

        let artist = document.createElement('p');
        let image = document.createElement('img');
        let name = document.createElement('h2');
        let releaseDate = document.createElement('p');

        albumInfo.classList.add('item-info');
        releaseDate.classList.add('second-info');
        albumText.classList.add('item-text');

        artist.innerHTML = album.artist;
        image.src = album.img;
        name.innerHTML = album.name;
        releaseDate.innerHTML = album.releaseDate.split('-')[0];

        albumText.appendChild(name);
        albumText.appendChild(artist);

        albumInfo.appendChild(image);
        albumInfo.appendChild(albumText);

        albumContainer.appendChild(albumCounter);
        albumContainer.appendChild(albumInfo);
        albumContainer.appendChild(releaseDate);

        albumsContainer.appendChild(albumContainer);
    })
}

/**
 * Migliori artisti
 * @param {*} data 
 */
export function showArtists(data){
    clear();

    let artists = data.items;
    let artistsContainer = document.getElementById('result-container');
    let cont = 1;

    artists.forEach(artist => {
        let artistContainer = document.createElement('div');
        artistContainer.classList.add('item-container');

        let artistCounter = document.createElement('p');
        artistCounter.classList.add('item-couter');
        artistCounter.innerHTML = cont;
        cont ++;

        let artistInfo = document.createElement('div');
        let artistText = document.createElement('div');

        let name = document.createElement('h2');
        let genres = document.createElement('p');
        let image = document.createElement('img');
        let followers = document.createElement('p');

        artistInfo.classList.add('item-info');
        followers.classList.add('second-info');
        artistText.classList.add('item-text');

        name.innerHTML = artist.name;
        genres.innerHTML = `${artist.genres[0]}, ${artist.genres[1]}, ${artist.genres[2]}`;
        image.src = artist.images[1].url;
        followers.innerHTML = `${artist.followers.total} followers`;

        artistText.appendChild(name);
        artistText.appendChild(genres);

        artistInfo.appendChild(image);
        artistInfo.appendChild(artistText);

        artistContainer.appendChild(artistCounter);
        artistContainer.appendChild(artistInfo);
        artistContainer.appendChild(followers);

        artistsContainer.appendChild(artistContainer);
    })
}

export function showRecent(data){
    clear();
    
    let recentlyPlayedItems = data.items;
    let recentlyPlayedItemsContainer = document.getElementById('result-container');

    recentlyPlayedItems.forEach(recentlyPlayed => {
        let recentlyContainer = document.createElement('div');
        recentlyContainer.classList.add('item-container');

        let title = document.createElement('h2');
        let artist = document.createElement('p');
        let recentlyText = document.createElement('div');
        let recentlyInfo = document.createElement('div');
        let image = document.createElement('img');
        let duration = document.createElement('p');

        recentlyText.classList.add('item-text');
        recentlyInfo.classList.add('item-info');
        duration.classList.add('item-secondInfo');


        title.innerHTML = recentlyPlayed.track.name;
        artist.innerHTML = recentlyPlayed.track.artists[0].name;
        recentlyText.appendChild(title);
        recentlyText.appendChild(artist);
        image.src = recentlyPlayed.track.album.images[1].url;

        recentlyInfo.appendChild(image);
        recentlyInfo.appendChild(recentlyText);

        duration.innerHTML = getDuration(recentlyPlayed.track.duration_ms);
        
        recentlyContainer.appendChild(recentlyInfo);
        recentlyContainer.appendChild(duration);

        recentlyPlayedItemsContainer.appendChild(recentlyContainer);
    });
}