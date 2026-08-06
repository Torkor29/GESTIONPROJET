# Gestion de projet en recherche clinique

Outil personnel de gestion d'études cliniques, à héberger sur votre propre
serveur : suivi de missions, checklists réglementaires, documents, base de
connaissance, pages façon Notion et suivi du temps.

Aucun service tiers, aucun abonnement : vos données restent sur votre machine.

---

## Ce que fait l'application

| Fonction | Détail |
|---|---|
| **Études** | Un dossier par étude : acronyme, promoteur, investigateur, ID-RCB, n° CTIS, référence CPP, image de couverture |
| **Checklists réglementaires** | Générées automatiquement selon le cadre coché : RIPH 1/2/3, règlement 536/2014, MDR, IVDR, ICH E6(R3), CNIL, archivage |
| **Missions** | Vue tableau, groupée par statut ou par échéance, filtres par étude, statut et texte, commentaire, export Excel |
| **Documents** | Dépôt de fichiers classés selon les catégories d'un TMF, versions, dates, recherche |
| **Base de connaissance** | FAQ générale ou propre à une étude, classée par thème |
| **Pages** | Éditeur riche façon Notion (titres, listes, tableaux, images), sauvegarde automatique |
| **Temps** | Chronomètre en un clic ou saisie manuelle (`1h30`, `1:30`, `90min`, `1,5`), export Excel valorisé |
| **Exports** | Chaque tableau s'exporte en Excel, en CSV ou en PDF (via l'impression du navigateur) |
| **Comptes et partage** | Chacun sa session et ses modules ; une étude se partage en lecture ou en écriture, et n'est visible que de son propriétaire et des personnes conviées |

L'application est en français, s'adapte au thème clair ou sombre du système, et
fonctionne sur téléphone.

### Les checklists réglementaires

Cochez le cadre applicable à l'étude et les lignes correspondantes
apparaissent, regroupées par phase (conception, soumission, mise en place,
conduite, clôture). Chaque ligne porte sa référence réglementaire, peut être
cochée, annotée, ou marquée « sans objet » — auquel cas elle sort du calcul de
progression.

Décocher un référentiel ne détruit jamais le travail déjà fait : les lignes
cochées ou annotées sont conservées, et l'application vous le signale.

> ⚠️ **Ces checklists sont une aide au travail, pas un avis réglementaire.**
> Les textes évoluent. Chaque référentiel affiche la date à laquelle son
> contenu a été vérifié et des liens vers les sources officielles ; vérifiez
> toujours la version en vigueur auprès de l'ANSM, du CPP, de la CNIL ou de
> l'EMA avant de vous engager.
>
> Le contenu livré a été vérifié le **4 août 2026**, en tenant compte de
> l'entrée en vigueur des Principes et de l'Annexe 1 d'ICH E6(R3) le
> 23 juillet 2025, et des versions 2026 des MR-001 et MR-003 de la CNIL
> (en vigueur depuis le 23 mai 2026).
>
> Les référentiels vivent dans `src/lib/referentiels.ts` : vous pouvez les
> modifier, en ajouter, et le bouton « Actualiser depuis le référentiel »
> reporte vos changements sur une étude existante.

---

## Installation sur un VPS Ubuntu

> 📖 **Vous partez de zéro ?** Le guide [INSTALLATION.md](INSTALLATION.md)
> reprend tout pas à pas, depuis l'activation du VPS chez OVHcloud jusqu'aux
> sauvegardes automatiques, avec le dépannage. Comptez 30 à 45 minutes.
>
> Le résumé ci-dessous suffit si vous êtes déjà à l'aise avec un serveur Linux.

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
MOT_DE_PASSE=votre-cle-d-installation-longue-et-unique
SECRET_SESSION=<coller ici le résultat de : openssl rand -hex 32>
```

`MOT_DE_PASSE` est la **clé d'installation** : elle n'ouvre pas l'application,
elle autorise seulement la création du tout premier compte. Vous la saisirez
une fois, à la création de votre compte, puis vous vous connecterez avec votre
adresse et votre propre mot de passe.

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

C'est tout. Ouvrez `https://votre-domaine` : l'écran de création de compte
s'affiche. Renseignez votre nom, votre adresse, un mot de passe et la clé
d'installation. Une fois ce compte créé, l'écran d'inscription se referme —
les comptes suivants passeront par une invitation.

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
│   ├── (app)/           pages protégées : tableau de bord, études, missions,
│   │                    documents, FAQ, temps
│   ├── api/             exports Excel, dépôt et service des fichiers
│   └── connexion/       page de connexion
├── actions/             Server Actions (écritures en base)
├── components/          composants d'interface
├── db/                  schéma Drizzle et connexion SQLite
└── lib/
    ├── referentiels.ts  contenu des checklists réglementaires
    ├── requetes.ts      lectures en base
    └── …                authentification, formatage, durées, fichiers
```

**Choix techniques et raisons :**

- **SQLite** plutôt que PostgreSQL : un seul utilisateur, un seul fichier, une
  sauvegarde = une copie. Aucun serveur de base à administrer.
- **BlockNote** (MPL-2.0) pour l'éditeur : construire un éditeur de texte riche
  soi-même représente des années de travail.
- **Checklists copiées en base** au moment où le référentiel est coché : si le
  référentiel évolue plus tard, l'historique d'une étude déjà avancée ne change
  pas sous vos pieds. La mise à jour est explicite, via un bouton.
- **Migrations au démarrage** : `docker compose up` suffit, jamais de commande
  manuelle à ne pas oublier.
- **Comptes individuels** : chacun sa session, son mot de passe (haché avec
  scrypt et un sel propre) et son métier. Le jeton de session porte
  l'identifiant du compte et il est resigné à chaque connexion ; un compte
  désactivé perd l'accès immédiatement, sans attendre l'expiration du cookie.
- **Cloisonnement en un seul endroit** (`src/lib/acces.ts`) : une étude est
  accessible à son propriétaire et aux personnes conviées, et tout ce qui pend
  d'une étude suit son accès. Les vingt lectures s'y adossent, et
  l'identifiant du compte est lu dans `requetes.ts` plutôt que passé en
  paramètre — un appel qui l'oublierait ferait fuiter des données sans que
  rien ne le signale.
- **Invitations remises de la main à la main** : pas de serveur de courrier à
  configurer, et aucune adresse confiée à un tiers. Le lien se copie et
  s'envoie par ses propres moyens ; il vaut sept jours et ne sert qu'une fois.

**Deux pièges contournés, à connaître si vous reprenez le code :**

- Les Server Actions ne signalent pas les erreurs de saisie par une exception :
  en production, Next masque le message. Elles renvoient un état de formulaire.
- React 19 réinitialise un formulaire après l'exécution de son action. Le
  sélecteur de statut du tableau appelle donc l'action dans une transition, et
  non via `<form action>`, sinon l'ancien statut réapparaît à l'écran alors que
  l'enregistrement a bien eu lieu.

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
