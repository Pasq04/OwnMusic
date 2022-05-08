import { access_token, logout, getCurrentUserProfile, getUserTopItems, getArtist, getRecentlyPlayed, getPlaylist  } from '../../src/spotify.mjs'
import { getAlbum, getCurrentUserPlaylists, makeQuerySearch } from './spotify.mjs';

//Get Current Profile
export const fetchData = async() => {
    try{
        const { data } = await getCurrentUserProfile();
        
        return data;
    }
    catch(e){
        console.error(e);
    }
};

//Get User's Top Item
export const fetchUserTop = async(type, limit, time_range) => {
    try{
        const { data } = await getUserTopItems(type, limit, time_range);

        return data;
    }
    catch(e){
        console.error(e);
    }
}

//Get Artist
export const fetchArtist = async(id) => {
    try{
        const { data } = await getArtist(id);

        return data;
    }
    catch(e){
        console.error(e);
    }
}

//Get User's Recently Played Tracks
export const fetchRecentlyPlayedTracks = async(limit) => {
    try{
        const { data } = await getRecentlyPlayed(limit);
        
        return data;
    }
    catch(e){
        console.error(e);
    }
}

//Get Playlist
export const fetchPlaylist = async(id) => {
    try{
        const { data } = await getPlaylist(id);

        return data;
    }
    catch(e){
        console.error(e);
    }
}

//Get Album
export const fetchAlbum = async(id) => {
    try{
        const { data } = await getAlbum(id);

        return data;
    }
    catch(e){
        console.error(e);
    }
}

//Get Current User's Playlist
export const fetchUserPlaylists = async() => {
    try{
        const { data } = await getCurrentUserPlaylists();

        return data;
    }
    catch(e){
        console.error(e);
    }
}

/**
 * Make search query
 * @param {String} q 
 * @param {Array} type 
 * @param {Number} limit 
 */
export const fetchSearchData = async(q, type, limit) => {
    try{
        const { data } = await makeQuerySearch(q, type, limit);

        return data;
    }
    catch(e){
        console.error(e);
    }
}