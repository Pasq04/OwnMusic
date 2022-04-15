const express = require('express');
const axios = require('axios');
const { connected } = require('process');
const { access } = require('fs');
const { URLSearchParams } = require('url');
const { param } = require('express/lib/request');
const app = express();

const client_id = '5a8e7302edf84f4c99226342b14e41b7'; //ID dell'applicazione nel server di Spotify
const redirect_uri = "http://localhost:5500/callback"; //link del sito(endpoint: /callback)
const client_secret = "b44d22a80f464700a595a8c71ef64734";

let access_token; //token di accesso per eseguire le request
let refresh_token; //codice per richiedere un altro token di accesso(vedi Request 2 e 3)
let options; //opzioni per inviare le request all'API

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
    console.log("Request 1 iniziata");
    let state = generateRandomString(16);
    let scope = "user-read-private user-read-email";

    console.log("Sto comunicando con Spotify");
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`);
});

app.get('/callback', (req, res) => {
    console.log("Ho ricevuto qualcosa");
    const code = req.query.code || null;

    console.log("tento di inviare");
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }),
        headers: {
            "content-type": 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
        },
    })
    .then(response => {
        if (response.status === 200) {
            res.send(`<pre>${JSON. stringify(response.data,null, 2)}</pre>`);
        }    
        else{
            res.send( response);
        }
    })
    .catch(error => res.send(error));
});

/*
//Request 2: Richiesta del token di accesso
app.get('/callback', (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;

    if(state === null){ //controlla se lo state restituito è giusto
        res.redirect(`/#?error=state_mismatch`);
    }
    else{
        var authOptions = {
            data: {
              code: code,
              redirect_uri: redirect_uri,
              grant_type: 'authorization_code'
            },
            headers: {
              'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            responseType: 'json'
        };
    }

    //accesso all'API
    axios.post('https://accounts.spotify.com/api/token', authOptions)
        .then((res, body) => {
            if(res.statusCode === 200){
                console.log("accesso all'API");

                access_token = body.access_token;
                refresh_token = body.refresh_token;

                options = {
                    method: 'get',
                    headers: {
                        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) //ERRORE Invalid client_id
                    },
                    responseType: 'json'
                };

                //Uso il Token di Accesso
                console.log("Utilizzo il Token di Accesso");
                axios(options).then(body => console.log(body.headers));
            }
        })
        .catch(err => console.error(err));
});
*/
//Request 3: Richiesta di un nuovo token di accesso
app.get('/refresh-token', (req, res) => {
    refresh_token = req.query.refresh_token;

    let authOptions = {
        data: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        responseType: 'json'
    };

    //richiesta del nuovo codice di accesso
    axios.post('https://accounts.spotify.com/api/token', authOptions)
        .then((res, body) => {
            if(response.statusCode === 200){
                access_token = body.access_token;
                res.send({
                    'access_token': access_token
                });
            }
        })
        .catch(err => console.error(err));
});

//listen
console.log("Listening on 5500");
app.listen(5500);