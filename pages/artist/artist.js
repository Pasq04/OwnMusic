import {fetchArtist} from '../../src/middle.js';

let urlParams = new URLSearchParams(window.location.search);
console.log(window.location.search);
console.log(urlParams);
let artistID = urlParams.get('id');

let artist = await fetchArtist(artistID);

console.log(artist);
