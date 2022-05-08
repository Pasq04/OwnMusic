import { fetchPlaylist } from "../../src/middle.js";

let urlParams = new URLSearchParams(window.location.search);
console.log(window.location.search);
console.log(urlParams);
let playlistID = urlParams.get('id');

let playlist = await fetchPlaylist(playlistID);

console.log(playlist);