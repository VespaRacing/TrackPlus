# TrackPlus
Vuoi partecipare ad aventi su pista o concederti una giornata di sfogo sul tuo bolide? TrackPlus è il sito perfetto per te! Acquista biglietti per eventi e gare, o affitta qualsiasi pista tra quelle in Italia per gareggiare con i tuoi amici, con il tuo amato bolide o con uno noleggiato. Adrenalina per tutti!


Creazione profili guidatore:

Request: {
    "type": "user",
    "username": "rampinelli",
    "password": "rampinelli",
    "age": 18,
    "city": "Bergamo",
    "email": "email@gmail.com",
    "phone_number": "+39 37014 14458"
}

Response: {
  "type": "user",
  "username": "rampinelli".
  "password": "rampinelli",
  "age": 18,
  "city": "Bergamo"
  "email": "email@gmail.com",
  "phone_number": "+39 37014 14458"
}


Creazione profili piste:

Request: {
    "type": "track",
    "username": "Monza",
    "password": "monza",
    "city": "Milano"
}

Response: {
  "type": "track",
  "username": "Monza".
  "password": "monza",
  "city": "Milano"
  "images": [],
  "reviews": ["",""]
}


Eliminazione Utenti:

Request: {
  "username": "rampinellI",
  "password": "rampinelli",
}

Response: {
  "username": null,
  "password": null
}


Ricerca Delle Piste:

Request: {
  "trackName": "Monza",
}

Response: {
  "username": "Monza".
  "password": "monza",
  "city": "Milano"
  "images": [],
  "reviews": ["",""]
}


Prenotazione Piste: 

Request: {
  "name": "Monza",
  "username": "rampinelli",
  "date": "27/09/2024 - 13:00",
  "tickets_number": 1
}

Response" {
  "name": "Monza",
  "status": "ok",
  "date": "27/09/2024 - 13:00",
  "tickets_number": 1,
}


Prenotazione Veicoli: 

Request: {
  "name": "Dcuati Panigale V4s",
  "track": "Monza",
  "username": "rampinelli",
  "date": "27/09/2024 - 13:00",
  "vehicles_number": 1
}

Response" {
  "name": "Dcuati Panigale V4s",
  "track": "Monza",
  "username": "rampinelli",
  "date": "27/09/2024 - 13:00",
  "vehicles_number": 1
}
