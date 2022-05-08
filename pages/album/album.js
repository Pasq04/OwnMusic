import { fetchAlbum } from "../../src/middle.js";

let urlParams = new URLSearchParams(window.location.search);
console.log(window.location.search);
console.log(urlParams);
let albumID = urlParams.get('id');

let album = await fetchAlbum(albumID);

console.log(album);