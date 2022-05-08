import { access_token, getRecentlyPlayed } from '../../src/spotify.mjs'
import { fetchArtist, fetchData, fetchUserTop, fetchRecentlyPlayedTracks, fetchPlaylist, fetchAlbum, fetchUserPlaylists } from '../../src/middle.js'
import { logOut, getIDfromURI, getFavGenres, getRecentlyContext } from '../../src/general.js'

//se non c'è il token di accesso effettua il login
let token = access_token;
if(!token){
    fetch("http://localhost:5500/login")
}

logOut();

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


//=================================================
//Barra laterale
//=================================================

//Artisti preferiti

let artistsData = await fetchUserTop("artists", 5, "medium_term");
let artistsURI = []; //link agli artisti

function displayFavArtists(){
    console.log(artistsData);

    let artistsContainer = document.getElementById("artisti-preferiti");
    let artists = artistsData.items;
    console.log(artistsData.items);

    artists.forEach(item => {
        let displayArtist = document.createElement("div");
        displayArtist.classList.add("artist");

        let image = document.createElement("img");
        let name = document.createElement("h3");
        let followers = document.createElement("p");

        let info = document.createElement("div");
        info.classList.add("info-artist");

        image.src = item.images[2].url;
        name.innerHTML = item.name;
        followers.innerHTML = `${item.followers.total} followers`;

        artistsURI.push(item.external_urls.spotify);

        info.appendChild(name);
        info.appendChild(followers);

        displayArtist.appendChild(image);
        displayArtist.appendChild(info);

        artistsContainer.appendChild(displayArtist);
    });
}

displayFavArtists();
console.log(artistsURI);

//link alle pagine artista
let artistItems = document.getElementsByClassName("artist");
for(let i = 0; i < artistItems.length; i ++){
    let artistID = getIDfromURI(artistsURI[i]);

    artistItems[i].addEventListener("click", () => {
        window.location.href = `http://localhost:5501/pages/artist/artist.html?id=${artistID}`;
    })
}

//=================================================
//Corpo centrale
//=================================================

//Generi preferiti
function displayFavGenres() {
    let favGenres = getFavGenres();

    let genreContainer = document.getElementById("genre-container");
    for(let i = 0; i < 8; i ++){
        let genreItem = document.createElement("p");
        genreItem.classList.add("genre-item");
        genreItem.innerText = favGenres[i];

        genreContainer.appendChild(genreItem);
    }
}

displayFavGenres();

//Ascoltati di recente
let uniqueContextID = []; //id dei context
let recentlyContainer = document.getElementById("recently-container");
async function displayRecentlyPlayed(){
    let recentlyPlayed = await fetchRecentlyPlayedTracks(50);
    let recentlyPlayedItems = recentlyPlayed.items;

    recentlyPlayedItems.forEach(async(item) => {
        if(item.context != null){
            let contextURI = item.context.href;
            let contextID = getIDfromURI(contextURI);
            
            let contextType = item.context.type;
            let contextData;
            switch (contextType) {
                case 'playlist':
                    contextData = await fetchPlaylist(contextID);
                break;
                case 'album':
                    contextData = await fetchAlbum(contextID);
                break;
                case 'artist':
                    contextData = await fetchArtist(contextID);
                break;
                default:
                break;
            }

            if(uniqueContextID.indexOf(contextID) === -1){
                uniqueContextID.push(contextID);

                let displayContext = document.createElement("div");
                displayContext.classList.add("recently-item");
        
                let contextName = document.createElement("h3");
                contextName.classList.add("context-name");
                let contextImg = document.createElement("img");
                let contextInfo = document.createElement("p");
        
                contextName.innerHTML = contextData.name;
                contextImg.src = contextData.images[0].url;
        
                if(contextType === 'artist') contextInfo.innerHTML = `${contextData.followers.total} followers`;
                if(contextType === 'album') contextInfo.innerHTML = contextData.artists[0].name;
                if(contextType === 'playlist') {
                    let firstArtist = contextData.tracks.items[0].track.artists[0].name;
                    let secondArtist = contextData.tracks.items[1].track.artists[0].name;
                    let thirdArtist = contextData.tracks.items[2].track.artists[0].name;
                    contextInfo.innerHTML = `${firstArtist}, ${secondArtist}, ${thirdArtist}`;
                }
        
                displayContext.appendChild(contextImg);
                displayContext.appendChild(contextName);
                displayContext.appendChild(contextInfo);
        
                recentlyContainer.appendChild(displayContext);

                //link alle pagine dei context
                displayContext.addEventListener("click", () => {
                    window.location.href = `http://localhost:5501/pages/${contextType}/${contextType}.html?id=${contextID}`;
    
                })
            }
        }
    }); 
}

displayRecentlyPlayed();

//Le tue playlists
async function displayUserPlaylists(){
    const playlists = await fetchUserPlaylists();

    console.log(playlists);

    let playlistContainer = document.getElementById("playlist-container")
    playlists.items.forEach(item => {
        let playlistID = item.id; //id della playlist

        let playlistsItem = document.createElement("div");
        playlistsItem.classList.add("playlist-item");

        let playlistName = document.createElement("h3");
        let playlistsOwner = document.createElement("p");
        let playlistImg = document.createElement("img");

        playlistName.innerHTML = item.name;
        playlistsOwner.innerHTML = `di ${item.owner.display_name}`;
        playlistImg.src = item.images[0].url;

        playlistsItem.appendChild(playlistImg);
        playlistsItem.appendChild(playlistName);
        playlistsItem.appendChild(playlistsOwner);

        playlistContainer.appendChild(playlistsItem);

        //link alle pagine delle playlist
        playlistsItem.addEventListener("click", () => {
            window.location.href = `http://localhost:5501/pages/playlist/playlist.html?id=${playlistID}`
        })
    })
}

displayUserPlaylists();