# TrackPlus
Vuoi partecipare ad aventi su pista o concederti una giornata di sfogo sul tuo bolide? TrackPlus è il sito perfetto per te! Acquista biglietti per eventi e gare, o affitta qualsiasi pista tra quelle in Italia per gareggiare con i tuoi amici, con il tuo amato bolide o con uno noleggiato. Adrenalina per tutti!

# Problema

Possibilità di prenotare piste, auto o biglietti per eventi

# Competitors

https://www.rseitalia.it/
https://www.ringspeedmotorsport.com/
https://www.kaaracing.com/

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

![image](https://github.com/user-attachments/assets/f3c6665f-f055-4dc8-b938-4f99eb78b888)
![Uploading image.png…]()






# Requisiti Funzionali

## Gestione delle piste

Creare un database che memorizzi tutte le piste italiane registrate, con informazioni dettagliate come descrizione, foto, recensioni degli utenti, posizione geografica e altre informazioni pertinenti.
## Gestione degli utenti

Creare un sistema di gestione degli utenti registrati, archiviando i dati personali, le prenotazioni attuali e la cronologia delle prenotazioni.
Consentire la creazione e gestione di profili utente con due tipi di ruoli:
Guidatore: può prenotare piste.
Gestore pista: può registrare e gestire nuove piste e la loro disponibilità.
## Prenotazioni e Opzioni Aggiuntive

Implementare un sistema di prenotazione pista con la possibilità di aggiungere opzioni, come il noleggio di attrezzature o veicoli.
## Filtri, Ordinamento e Ricerca

Consentire agli utenti di cercare piste con filtri specifici (es. posizione, disponibilità, valutazioni, costo) e di ordinarle in base alle preferenze.
## API Pubblica

Sviluppare e documentare un'API che permetta a terze parti di interagire con l’applicazione per consultare piste disponibili, effettuare prenotazioni, e altro.
# Requisiti Non Funzionali

## Architettura Client-Server

Strutturare l’applicazione in due componenti principali:
Server-side: gestione del database, logica di business delle prenotazioni e comunicazione con i client tramite chiamate HTTP.
Client-side: interfaccia utente per guidatori e gestori di piste.
## Compatibilità Multipiattaforma

Assicurare la compatibilità dell’applicazione con dispositivi mobili (Android e iOS) e piattaforma web, per offrire un’esperienza ottimale su tutte le piattaforme.
## Sicurezza dei Dati

Implementare sistemi di autenticazione e protezione dei dati degli utenti, incluse informazioni personali e storici di prenotazione.
## Scalabilità

Progettare l’infrastruttura per gestire un elevato numero di utenti e piste, consentendo espansione senza perdita di performance.
## Affidabilità e Disponibilità

Garantire la disponibilità continua del servizio e un sistema di backup dei dati per prevenire perdite accidentali.
## Usabilità e Interfaccia Utente Intuitiva

Fornire un’interfaccia utente facile da usare e intuitiva sia per i guidatori che per i gestori di piste, con un design orientato all’esperienza dell’utente.
