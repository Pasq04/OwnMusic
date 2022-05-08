import { access_token, getRecentlyPlayed } from '../../src/spotify.mjs'
import { fetchArtist, fetchData, fetchUserTop, fetchRecentlyPlayedTracks, fetchPlaylist, fetchAlbum, fetchUserPlaylists } from '../../src/middle.js'
import { logOut, getIDfromURI, getFavGenres, getRecentlyContext, makeRequest, showAlbums, showArtists, showRecent, showTracks } from '../../src/general.js'

//se non c'è il token di accesso effettua il login
let token = access_token;
if(!token){
    fetch("http://localhost:5500/login")
}

logOut();

/*
let user_profile = await fetchData();//profilo da mostrare
console.log(user_profile);

//Display user
function displayUser(profile) {
    let user_container = document.getElementById("fromSpotify");

    let displayName = document.createElement("h1");
    let user_image = document.createElement("img");
    user_image.setAttribute("id", "user_image");

    displayName.innerHTML = profile.display_name;
    user_container.appendChild(displayName);

    user_image.src = profile.images[0].url;
    user_container.appendChild(user_image);
}

displayUser(user_profile);
*/
//Eventi bottoni

function showResults(result, type){
    let cassetta = document.getElementById('cassetta');
    cassetta.style.top = 0;

    let cassettaTitle = document.getElementById('cassetta-name-type');
    if(type == 'recent'){
        cassettaTitle.innerHTML = 'Recently Played';
    }
    else{
        cassettaTitle.innerHTML = `Top ${type}`;
    }

    if(type == 'tracks') showTracks(result);
}

let menuButtons = document.getElementsByClassName('req-btn');
let result, data;

for(let i = 0; i < menuButtons.length; i ++){
    menuButtons[i].addEventListener("click", () => {
        let type = menuButtons[i].id;
        data = makeRequest(type);
        data.then(r => result = r);
        console.log(result);
        showResults(result, type);
    })
}