### Kliento pusęs paleidimas

Prieš paleidžiant kliento pusę nustatyti `serverAddress` kintamajį `client/client.js` faile į serverio pusės adresą (default `localhost`).

`client` direktorijoje:

```
python -m http.server --bind 0.0.0.0
```

Paleidimas su custom port reikšme:

```
python -m http.server [PORT] --bind 0.0.0.0
``` 

### Serverio pusės paleidimas

`server` direktorijoje:

```
npm start
```