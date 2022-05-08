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

/**
 * restituisce i generi preferiti contando le occorrenze tra i 50 artisti più ascoltati nel
 * lungo periodo.
 */
let artistsMediumTerm = await fetchUserTop("artists", 50, "short_term");
export const getFavGenres = () => {
    let occ = new Map();
    let artistsMediumTermData = artistsMediumTerm.items;

    artistsMediumTermData.forEach(item => {
        let genres = item.genres;

        genres.forEach(genre => {
            occ.set(genre, occ.get(genre) + 1 || 1);
        });
    });

    let sortedOcc = new Map([...occ.entries()].sort((a, b) => b[1] - a[1]));
    let genres = [...sortedOcc].map(a => a[0]);

    return genres;
}


/**
 * Partendo dal context di ogni canzone ascoltata di recente restituisce le playlist recentemente ascoltate
 * @returns {Promise<any[]>} ID delle playlists ascoltate di recente
 */
export const getRecentlyContext = async(recentlyPlayed) => {
    let recentlyPlayedItems = recentlyPlayed.items;
    //let uniqueContext = new Set(); //dati delle playlists
    //let uniqueContextID = new Set(); //id dei context


    let uniqueContext = []; //dati delle playlists
    let uniqueContextID = []; //id dei context

    let recentlyContainer = document.getElementById("recently-container");
    //ERRORE: il predicato del forEach è asincrono e nel return si accede alla Promise e non al set in se
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
                    //console.error('Missing context type');
                break;
            }
            //console.log(contextID);
            //console.log(contextData);

            if(uniqueContextID.indexOf(contextID) === -1){
                uniqueContext.push(contextData);
                uniqueContextID.push(contextID);

                let displayContext = document.createElement("div");
                displayContext.classList.add("recently-item");
        
                let contextName = document.createElement("h3");
                let contextImg = document.createElement("img");
                let contextInfo = document.createElement("p");
        
                contextName.innerHTML = contextData.name;
                contextImg.src = contextData.images[0].url;
        
                if(contextType === 'artist') contextInfo.innerHTML = `Artista, ${contextData.genres[0]}`;
                if(contextType === 'album') contextInfo.innerHTML = contextData.artists[0].name;
                if(contextType === 'playlist') {
                    let firstArtist = contextData.tracks.items[0].track.artists[0].name;
                    let secondArtist = contextData.tracks.items[1].track.artists[0].name;
                    let thirdArtist = contextData.tracks.items[2].track.artists[0].name;
                    contextInfo.innerHTML = `${firstArtist}, ${secondArtist}, ${thirdArtist}`;
                }
        
                displayContext.appendChild(contextName);
                displayContext.appendChild(contextImg);
                displayContext.appendChild(contextInfo);
        
                recentlyContainer.appendChild(displayContext);
            }
            /*
            if(!uniqueContextID.has(contextID)) {
                uniqueContext.add(contextData);
                uniqueContextID.add(contextID);                
            }*/

            
        }
    }) 

    console.log(uniqueContext);
    console.log([1,2,3])

    return uniqueContext;
}