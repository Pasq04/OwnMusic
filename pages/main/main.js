import { access_token, getRecentlyPlayed } from '../../src/spotify.mjs'
import { fetchArtist, fetchData, fetchUserTop, fetchRecentlyPlayedTracks, fetchPlaylist, fetchAlbum, fetchUserPlaylists } from '../../src/middle.js'
import { logOut, makeRequest, showAlbums, showArtists, showRecent, showTracks } from '../../src/general.js'

//se non c'è il token di accesso effettua il login
let token = access_token;
if(!token){
    fetch("http://localhost:5500/login")
}

logOut();

let menuButtons = document.getElementsByClassName('req-btn');
let data;
let type = 'tracks';
let timeInterval = 'long_term';

async function initialize(){
    data = await makeRequest("tracks", "long_term");

    let longTermBtn = document.getElementById('long_term');
    longTermBtn.classList.add('selected');

    showResults(data, 'tracks');
}

initialize();

//Richieste

function showResults(result, type){
    let resultType = document.getElementById('result-type');

    let timeIntervalBar = document.getElementById('time-interval-bar');

    if(type == 'tracks') {
        timeIntervalBar.style.display = "flex";

        showTracks(result);
        resultType.innerHTML = 'Top Tracks';
    }
    if(type == 'albums'){
        timeIntervalBar.style.display = "flex";

        showAlbums(result);
        resultType.innerHTML = 'Top Albums';
    }
    if(type == 'artists'){
        timeIntervalBar.style.display = "flex";

        showArtists(result);
        resultType.innerHTML = 'Top Artists';
    }
    if(type == 'recent'){
        timeIntervalBar.style.display = "none";

        showRecent(result);
        resultType.innerHTML = 'Recently Played';
    }
}

for(let i = 0; i < menuButtons.length; i ++){
    menuButtons[i].addEventListener("click", async() => {
        type = menuButtons[i].id;
        data = await makeRequest(type, "long_term");
        showResults(data, type);
    })
}

let timeIntervalButtons = document.getElementsByClassName('time-interval-btn');
for(let i = 0; i < timeIntervalButtons.length; i ++){
    timeIntervalButtons[i].addEventListener("click", async() => {
        for(let j = 0; j < timeIntervalButtons.length; j ++){
            timeIntervalButtons[j].classList.remove('selected');
        }

        timeIntervalButtons[i].classList.add('selected');

        timeInterval = timeIntervalButtons[i].id;
        data = await makeRequest(type, timeInterval);
        showResults(data, type);
    })
}