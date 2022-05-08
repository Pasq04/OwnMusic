const express = require('express');
const axios = require('axios');
const { connected } = require('process');
const { access } = require('fs');
const { URLSearchParams } = require('url');
const { param } = require('express/lib/request');
const { response } = require('express');
const { executionAsyncResource } = require('async_hooks');
const { createSecretKey } = require('crypto');
const { resolveSoa } = require('dns');
const cors = require('cors');
const app = express();

const client_id = '5a8e7302edf84f4c99226342b14e41b7'; //ID dell'applicazione nel server di Spotify
const redirect_uri = "http://localhost:5500/callback"; //link del sito(endpoint: /callback)
const client_secret = "b44d22a80f464700a595a8c71ef64734";

let access_token; //token di accesso per eseguire le request
let refresh_token; //codice per richiedere un altro token di accesso(vedi Request 2 e 3)
let options; //opzioni per inviare le request all'API
let token_type; //tipo di token(sempre "Bearer")
let expires_in; //tempo in cui è valido il token di accesso(in secondi)

app.use(express.json());

//Opzioni CORS
const corsOptions = {
    origin: '*',
    credetials: true, 
};
app.use(cors(corsOptions));

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

//Request 1: Autorizzazione dell'utente
app.get('/login', (req, res) => {
    let state = generateRandomString(16);
    let scope = "ugc-image-upload user-modify-playback-state user-read-playback-state user-read-currently-playing user-follow-modify user-follow-read user-read-recently-played user-read-playback-position user-top-read playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private app-remote-control streaming user-read-email user-read-private user-library-modify user-library-read";
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`);
});

//Request 2: Richiesta del token di accesso e accesso all'account dell'utente
app.get('/callback', (req, res) =>{
    let code = req.query.code || null;
    
    //richiesta del token di accesso
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }),
        headers: {
            Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
            "content-type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => {
        if(response.status === 200){
            //res.send(`<pre>${JSON. stringify(response.data,null, 2)}</pre>`);
            access_token = response.data.access_token;
            token_type = response.data.token_type;
            refresh_token = response.data.refresh_token;
            expires_in = response.data.expires_in;

            res.redirect(`http://localhost:5501/pages/main/main.html?${new URLSearchParams({
                access_token: access_token,
                refresh_token: refresh_token,
                expires_in: expires_in
            })}`);

        }
        else{
            res.redirect(`/?${new URLSearchParams({
                error: "invalid token"
            })}`);
        }
    })
    .catch(err => res.send(err));
});

//Request 3: richiesta di un nuovo token di accesso (Per il test eseguire prima Request 1 sennò non hai il refresh-token)
app.get("/refresh-token", (req, res) => { 
    const { refresh_token } = req.query;


    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
        },
      })
        .then(response => {
          res.send(response.data);
        })
        .catch(error => {
          res.send(error);
        });
});

//listen
console.log("Listening on 5500");
app.listen(5500);