const express = require('express');
const axios = require('axios');
const { connected } = require('process');
const { access } = require('fs');
const { URLSearchParams } = require('url');
const { param } = require('express/lib/request');
const { response } = require('express');
const { executionAsyncResource } = require('async_hooks');
const { createSecretKey } = require('crypto');
const app = express();

const client_id = '5a8e7302edf84f4c99226342b14e41b7'; //ID dell'applicazione nel server di Spotify
const redirect_uri = "http://localhost:5500/callback"; //link del sito(endpoint: /callback)
const client_secret = "b44d22a80f464700a595a8c71ef64734";

let access_token; //token di accesso per eseguire le request
let refresh_token; //codice per richiedere un altro token di accesso(vedi Request 2 e 3)
let options; //opzioni per inviare le request all'API
let token_type; //tipo di token(sempre "Bearer")

app.use(express.json());

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
    let scope = "user-read-private user-read-email";

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
            refresh_token = response.data.refresh_token; //Fino a mo ok!!

            //utilizzo del token di accesso per accedere all'account
            axios.get("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `${token_type} ${access_token}`
                }
            })
            .then(response => {
                res.send(`<pre>${JSON. stringify(response.data,null, 2)}</pre>`);
            })
            .catch(err => res.send(err));
            
        }
        else{
            res.send(response);
        }
    })
    .catch(err => res.send(err));
});

//Request 3: richiesta di un nuovo token di accesso (Per il test eseguire prima Request 1 sennò non hai il refresh-token)
app.get("/refresh-token", (req, res) => {
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }),
        headers: {
            Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
            "content-type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => {
        if(response.status === 200){
            res.send(`<pre>${JSON. stringify(response.data,null, 2)}</pre>`);
            access_token = response.data.access_token;
        }
        else{
            res.send(response);
        }
    })
    .catch(err => res.send(err));
});

//listen
console.log("Listening on 5500");
app.listen(5500);