const client_id = '5a8e7302edf84f4c99226342b14e41b7'; //ID dell'applicazione nel server di Spotify
const redirect_uri = "http://localhost:5500/index.html"; //link del sito

let access_token; //token di accesso per eseguire le request
let refresh_token; //codice per richiedere un altro token di accesso(vedi Request 2 e 3)
let options; //opzioni per inviare le request all'API

/**
 * Funzione che genera stringhe random che contengono lettere e numeri
 * @param {number} lunghezza della stringa
 * @return {string} stringa random generata
*/

let generateRandomString = (lenght) => {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = "";

    for(let i = 0; i < lenght; i ++){
        str += characters.charAt(Math.floor(Math.random * characters.lengt));
    }

    return str;
};

//Quanfdo l'utente preme un bottone tu invii la request agli indirizzi di spotify

$.ajax('/login', (req, res) => {

})