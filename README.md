# Gestion de projet

Outil personnel de suivi d'études, de tâches et de temps, à héberger sur votre
propre serveur. Pages de contenu riche façon Notion, chronomètre, export Excel.

Aucun service tiers, aucun abonnement : vos données restent sur votre machine.

---

## Ce que fait l'application

| Fonction | Détail |
|---|---|
| **Études** | Un dossier par projet : client, couleur, tarif horaire, statut |
| **Pages** | Éditeur riche façon Notion (titres, listes, tableaux, images, code), sauvegarde automatique |
| **Tâches** | Priorité, échéance, statut, filtre « en retard », rattachées à une étude |
| **Temps** | Chronomètre en un clic ou saisie manuelle (`1h30`, `1:30`, `90min`, `1,5`) |
| **Export Excel** | Deux feuilles (détail + récapitulatif), formules de totaux, valorisation au tarif horaire |
| **Fichiers** | Images et pièces jointes stockées sur votre serveur, jamais chez un tiers |

L'application est en français, s'adapte au thème clair ou sombre du système, et
fonctionne sur téléphone.

---

## Installation sur un VPS Ubuntu

### 1. Préparer le serveur

Connectez-vous en SSH, puis installez Docker :

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Récupérer le code

```bash
git clone https://github.com/Torkor29/GESTIONPROJET.git
cd GESTIONPROJET
```

### 3. Créer le fichier de configuration

```bash
cp .env.example .env
nano .env
```

Deux valeurs à renseigner :

```bash
MOT_DE_PASSE=votre-mot-de-passe-long-et-unique
SECRET_SESSION=<coller ici le résultat de : openssl rand -hex 32>
```

Générez la clé de session avec :

```bash
openssl rand -hex 32
```

Si vous avez un nom de domaine pointant vers le serveur, ajoutez-le — Caddy
obtiendra alors le certificat HTTPS automatiquement et gratuitement :

```bash
DOMAINE=projets.mondomaine.fr
```

Sans domaine, laissez la ligne absente : le site répondra en HTTP sur l'IP du
serveur, et l'application s'adapte automatiquement (le cookie de session n'est
marqué `secure` que lorsqu'un domaine est configuré).

> **Prenez un domaine dès que possible.** Sans HTTPS, votre mot de passe et le
> contenu de vos pages circulent en clair sur le réseau. Un domaine coûte une
> dizaine d'euros par an et suffit à ce que Caddy active le chiffrement tout
> seul. En attendant, évitez les réseaux Wi-Fi publics.

### 4. Démarrer

```bash
docker compose up -d --build
```

C'est tout. Ouvrez `https://votre-domaine` et saisissez votre mot de passe.

La base de données est créée automatiquement au premier démarrage ; il n'y a
aucune commande de migration à lancer.

### 5. Ouvrir le pare-feu

```bash
sudo ufw allow 80
sudo ufw allow 443
```

---

## Utilisation courante

```bash
# Voir les journaux
docker compose logs -f app

# Redémarrer
docker compose restart

# Arrêter
docker compose down

# Mettre à jour après un changement de code
git pull && docker compose up -d --build
```

---

## Sauvegardes

**Toutes vos données tiennent dans le dossier `donnees/`** : la base SQLite et
les fichiers téléversés. C'est le seul dossier à sauvegarder.

```bash
./scripts/sauvegarde.sh
```

L'archive horodatée atterrit dans `sauvegardes/`. Les archives de plus de
30 jours sont supprimées (réglable via `CONSERVER_JOURS`).

Pour une sauvegarde automatique chaque nuit à 3 h :

```bash
crontab -e
```

puis ajoutez :

```
0 3 * * * cd /chemin/vers/GESTIONPROJET && ./scripts/sauvegarde.sh >> /var/log/gestionprojet-sauvegarde.log 2>&1
```

Pour restaurer :

```bash
./scripts/restauration.sh sauvegardes/gestionprojet_2026-08-04_03h00.tar.gz
```

> **Ne copiez jamais le fichier `.db` à la main pendant que l'application
> tourne.** La base est en mode WAL : une copie brute peut être incomplète. Le
> script utilise `VACUUM INTO`, qui produit toujours un fichier cohérent.
>
> Pensez aussi à recopier les archives **hors du serveur** — une sauvegarde qui
> vit sur la machine qu'elle protège ne protège de rien.

---

## Développement en local

```bash
npm install
cp .env.example .env    # renseignez MOT_DE_PASSE et SECRET_SESSION
npm run dev
```

L'application écoute sur http://localhost:3000. En développement, le cookie
n'est pas marqué `secure` : la connexion fonctionne en HTTP.

Après une modification du schéma dans `src/db/schema.ts` :

```bash
npm run db:generate    # génère le fichier SQL de migration
```

La migration s'applique ensuite toute seule au démarrage suivant.

---

## Architecture

```
src/
├── app/
│   ├── (app)/           pages protégées : tableau de bord, études, tâches, temps
│   ├── api/             export Excel, téléversement et service des fichiers
│   └── connexion/       page de connexion
├── actions/             Server Actions (écritures en base)
├── components/          composants d'interface
├── db/                  schéma Drizzle et connexion SQLite
└── lib/                 authentification, requêtes, formatage, durées
```

**Choix techniques et raisons :**

- **SQLite** plutôt que PostgreSQL : un seul utilisateur, un seul fichier, une
  sauvegarde = une copie. Aucun serveur de base à administrer.
- **BlockNote** (MPL-2.0) pour l'éditeur : construire un éditeur de texte riche
  soi-même représente des années de travail.
- **Migrations au démarrage** : `docker compose up` suffit, jamais de commande
  manuelle à ne pas oublier.
- **Un seul mot de passe**, pas de comptes : l'outil est mono-utilisateur.

---

## Licences

Toutes les dépendances sont sous licence libre **irrévocable** — une version
publiée sous MIT, MPL ou Apache le reste définitivement. Cet outil ne peut pas
devenir payant.

| Brique | Licence |
|---|---|
| Next.js, React, ExcelJS, better-sqlite3, Tailwind | MIT |
| BlockNote | MPL-2.0 |
| Drizzle ORM | Apache-2.0 |
| Caddy | Apache-2.0 |

Les versions sont figées dans `package-lock.json` : une mise à jour n'a lieu que
si vous la déclenchez.
