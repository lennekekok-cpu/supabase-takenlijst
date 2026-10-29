# Mijn taken — leren werken met Supabase

Een Nederlandstalige takenlijst met registratie, inloggen, uitloggen en persoonlijke taken.

## Wat doet welk bestand?

- `index.html`: de schermen en formulieren.
- `style.css`: de vormgeving op telefoon en computer.
- `app.js`: Supabase Auth en het lezen, toevoegen, afvinken en verwijderen van taken.

Supabase bewaart de gegevens in `public.tasks`. Elke taak heeft een `user_id`.
Row Level Security controleert in de database dat je alleen je eigen taken kunt benaderen.
De publishable key mag in de browser staan; er is geen geheime service_role-key opgenomen.
De browser laadt supabase-js 2.57.4 via jsDelivr.

## Website publiceren

1. Open Settings > Pages in deze repository.
2. Kies Deploy from a branch, branch main, map / (root), en klik Save.
3. Wacht op de publicatie van https://lennekekok-cpu.github.io/supabase-takenlijst/.
4. Open Supabase > Authentication > URL Configuration en zet Site URL op dat adres.

## Eerste oefening

1. Registreer met je e-mailadres en een uniek wachtwoord van minimaal 8 tekens.
2. Bevestig de e-mail en log in.
3. Voeg een taak toe en open in Supabase Table Editor de tabel tasks.
4. Bekijk hoe de taak als rij is opgeslagen. Vernieuwen van de website behoudt je taak.
5. Vink de taak af: completed verandert. Verwijderen verwijdert de rij.

## Controles

JavaScript-syntaxis en verwijzingen naar HTML-elementen zijn gecontroleerd.
RLS staat aan, de anon-rol heeft geen SELECT-rechten en de Supabase security advisor gaf geen waarschuwingen.
De volledige inlogstroom en scheiding tussen twee accounts zijn nog niet in een browser getest.
De takenroute is een browserroute (#/taken); RLS beveiligt de daadwerkelijke gegevens.
