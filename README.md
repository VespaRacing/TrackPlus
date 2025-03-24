# TrackPlus
Vuoi partecipare ad aventi su pista o concederti una giornata di sfogo sul tuo bolide? TrackPlus è il sito perfetto per te! Acquista biglietti per eventi e gare, o affitta qualsiasi pista tra quelle in Italia per gareggiare con i tuoi amici, con il tuo amato bolide o con uno noleggiato. Adrenalina per tutti!

# Problema

Possibilità di prenotare piste, auto o biglietti per eventi

# Competitors

https://www.rseitalia.it/
https://www.ringspeedmotorsport.com/
https://www.kaaracing.com/

# Target

- Utenti interessati al noleggio di piste e veicoli
- Gestori delle piste interessati a registrare la propria per renderla disponibile alla prenotazione sulla piattaforma 

# Esempi Richieste E Risposte API

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

![image](https://github.com/user-attachments/assets/2b701d36-6050-433b-b84d-b9bbdf97f757)







# Requisiti Funzionali
-Gestione delle piste

Creare un database per memorizzare tutte le piste italiane con dettagli quali:
Nome, descrizione, foto, valutazioni, recensioni, posizione geografica, e altre informazioni pertinenti.
Consentire la visualizzazione e la modifica delle piste registrate da parte dei gestori pista.
Implementare un sistema per monitorare la disponibilità delle piste.

-Gestione degli utenti

Consentire la registrazione e il login per gli utenti.
Archiviare informazioni personali, come nome, email e cronologia delle prenotazioni.
Implementare due ruoli utente:
Guidatore: può visualizzare le piste e prenotarle.
Gestore pista: può aggiungere e gestire le proprie piste.

-Prenotazioni e opzioni aggiuntive

Permettere agli utenti di prenotare piste, specificando la data e l'ora.
Offrire opzioni aggiuntive durante la prenotazione, come:
Noleggio attrezzature.
Noleggio veicoli.
Generare una conferma di prenotazione visibile nel profilo dell’utente.

-Filtri, ordinamento e ricerca

Offrire strumenti di ricerca delle piste utilizzando filtri quali:
Posizione geografica, valutazioni, costo, disponibilità.
Consentire l’ordinamento delle piste in base alle preferenze dell’utente (es. prezzo crescente, migliori valutazioni).

-API pubblica

Sviluppare un’API per permettere a terze parti di:
Consultare piste disponibili.
Effettuare prenotazioni.
Ottenere dati sulle valutazioni e recensioni.

# Requisiti Non Funzionali

-Architettura client-server

Strutturare l'applicazione in componenti:
Server-side: gestione database, logica di business e API.
Client-side: interfaccia utente per web e dispositivi mobili.

-Compatibilità multipiattaforma

Garantire che l’applicazione funzioni su:
Web browser principali.
Dispositivi mobili Android e iOS.

-Sicurezza dei dati

Implementare autenticazione sicura (es. login con password hashate e OTP).
Proteggere i dati con connessioni HTTPS e crittografia.

-Scalabilità

Progettare l’infrastruttura per supportare un elevato numero di utenti e gestori pista.
Consentire un'espansione modulare del sistema.

-Affidabilità e disponibilità

Garantire un uptime del servizio superiore al 99.9%.
Implementare backup giornalieri automatici dei dati.

-Usabilità

Offrire un’interfaccia semplice e intuitiva, con tutorial per i nuovi utenti.
Garantire che l’esperienza utente sia uniforme su tutte le piattaforme.

# Requisiti di Dominio

-Gestione delle piste

Le piste devono essere identificabili univocamente nel database (ID pista).
Ogni pista può avere un proprietario registrato come gestore pista.

-Utenti

Gli utenti devono essere classificati in due categorie principali:
Guidatori che effettuano prenotazioni.
Gestori pista che amministrano la disponibilità delle piste.
Ogni utente può avere uno storico delle prenotazioni.

-Prenotazioni

Ogni prenotazione è legata a una pista, un utente, una data e un orario.
Devono essere incluse regole per evitare sovrapposizioni di prenotazioni.

-Opzioni aggiuntive

Le opzioni devono essere configurabili dai gestori pista.
Ogni opzione aggiuntiva deve avere un costo e un inventario disponibile.

-API

L’API deve fornire endpoint per accedere a:
Lista delle piste, recensioni e dettagli.
Disponibilità e opzioni di prenotazione.
Statistiche sulle valutazioni e recensioni.


# INSTALLAZIONE
-scaricare il file TrackPlus.zip
-estrarre i contenuti in una cartella
-scaricare Docker Desktop manualmente

# TEST
-avviare il file start.bat presente nella cartella estratta
-avviare un browser a scelta
-digitare nella barra di ricerca "http://localhost:8080"
-testare le funzionalità
