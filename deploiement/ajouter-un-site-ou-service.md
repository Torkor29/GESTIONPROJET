# Ajouter un site ou un service sur ce serveur

Guide pratique, à suivre à chaque nouvel ajout sur la machine — un site web,
un bot, une tâche planifiée. L'objectif tient en une phrase : **ce qui existe
déjà continue de tourner sans y penser, et ce qui vient après n'est jamais
restreint par ce qui est déjà là.**

C'est l'incident du 10 août sur Comptap qui a montré ce qui casse ce principe
quand on ne le formalise pas : un script de déploiement qui suppose l'existence
d'un réseau, un conteneur qui télécharge une dépendance à chaque démarrage, un
volume dont personne ne garantit la propriété. Rien de tout ça n'est propre à
Comptap — ce sont des pièges génériques, qui referont surface pour n'importe
quel prochain service. Cette page existe pour qu'ils ne se reproduisent pas.

---

## Étape 0 — De quoi s'agit-il ?

Deux familles, qui ne se traitent pas pareil.

| | Un **site** | Un **service de fond** |
|---|---|---|
| Exemples | Vigie, Comptap, un futur site vitrine | Un bot Vinted, un bot Dofus, une tâche planifiée |
| Joignable par un nom de domaine | Oui | Non — aucune page, aucune API publique |
| Passe par le portier (`/opt/proxy`) | **Oui**, systématiquement | **Non**, jamais |
| Ports 80/443 | Jamais publiés directement — c'est le rôle du portier | Sans objet |

Un service de fond qui expose quand même une petite page d'état ou une API
d'administration se traite comme un site : dès qu'un navigateur ou un domaine
peut l'atteindre, il passe par le portier, même si son usage principal est
invisible.

---

## Étape 1 — La check-list commune, dans tous les cas

Ces règles ne sont pas des préférences de style : chacune correspond à une
panne réellement vécue sur ce serveur.

- **Un dossier dédié sous `/opt`**, propre à ce site ou service — jamais
  partagé avec un autre projet. `/opt/nom-du-service`, rien d'autre dedans.

- **Un nom de projet Compose explicite**, en tête du `docker-compose.yml` :

  ```yaml
  name: nom-du-service
  ```

  Sans lui, Compose déduit le nom du projet du nom du dossier — ce qui suffit
  déjà si le dossier est dédié, mais l'écrire élimine toute ambiguïté si le
  dossier est un jour renommé ou déplacé. C'est ce nom qui préfixe les
  conteneurs, réseaux et volumes créés : deux projets bien nommés ne peuvent
  jamais se marcher dessus.

- **Aucun port publié à l'aveugle.** Les ports 80 et 443 appartiennent au
  portier, point final. Si le service a besoin d'un port sur l'hôte (rare —
  voir plus bas), vérifiez d'abord qu'il est libre :

  ```bash
  ss -ltnp | grep <port>
  docker ps --format '{{.Names}}\t{{.Ports}}'
  ```

- **Un `.env` propre au service**, jamais partagé avec un autre projet, jamais
  commité. Les identifiants d'un service n'ont rien à faire dans le dépôt
  d'un autre.

- **Un utilisateur non root dans l'image, fixé à la construction.** Le
  `Dockerfile` crée son utilisateur applicatif une fois pour toutes
  (`useradd --uid … --create-home`), jamais à l'exécution — un conteneur qui
  redémarre ne doit dépendre d'aucune étape d'initialisation en tant que
  root.

- **Rien ne se télécharge au démarrage du conteneur.** Ni dépendance, ni
  gestionnaire de paquets, ni mise à jour. Tout ce dont l'application a
  besoin est figé dans l'image au moment de sa construction. C'est
  exactement ce qui a fait boucler Comptap le 10 août : sa commande de
  démarrage appelait `pnpm`, qui appelle corepack, qui tente de télécharger
  et de mettre en cache son binaire à chaque lancement — et échoue dès que le
  système de fichiers n'est pas accessible en écriture à cet endroit-là.
  `CMD` doit lancer l'exécutable final directement (`node dist/index.js`,
  pas `npm start`, pas `pnpm run …`).

- **La propriété d'un volume de données ne se suppose jamais, elle se
  vérifie.** Un volume nommé créé par une exécution antérieure — ou par une
  version antérieure de l'image, avec un uid différent — garde son
  propriétaire d'origine tant que personne ne le change explicitement.
  L'incident du 10 août venait de là : un volume `/data` appartenant encore à
  root, une image reconstruite tournant sous l'uid 10001, une écriture
  refusée (`EACCES`) au premier démarrage. Le script de déploiement de
  Comptap (`scripts/vps-reset-deploy.sh` dans son dépôt) corrige maintenant
  cette propriété après chaque démarrage, sans effet si elle était déjà
  correcte — reprenez ce même réflexe pour tout service qui écrit dans un
  volume nommé.

- **Aucune dépendance à un réseau ou un conteneur externe qui pourrait ne
  pas exister.** Un `docker-compose.yml` qui déclare un réseau externe
  obligatoire (`external: true`) empêche `docker compose up` de démarrer si
  ce réseau est absent — et une variable d'environnement vide n'est pas
  « absente » aux yeux de Compose : `${MA_VAR:-valeur_par_defaut}` retombe
  sur la valeur par défaut dès que la variable existe mais est vide, pas
  seulement quand elle n'existe pas du tout. Un service qui n'a pas besoin de
  joindre spécifiquement un autre conteneur ne déclare aucun réseau externe.
  Correction faite dans ce sens sur Comptap fin août, après avoir failli
  bloquer son propre redémarrage sur exactement ce piège.

- **`restart: unless-stopped`**, pour qu'un redémarrage du serveur relève le
  service tout seul — sans `depends_on` vers un service d'un autre projet,
  qui créerait un ordre de démarrage entre deux piles censées être
  indépendantes.

- **Si le service a un état (base, fichiers), une sauvegarde dédiée.** Un
  volume Docker n'est pas une sauvegarde. Vigie a
  `./scripts/sauvegarde.sh`, qui produit une copie cohérente même pendant que
  l'application tourne (`VACUUM INTO` plutôt qu'une copie brute d'un fichier
  SQLite en mode WAL) ; un service avec sa propre base a besoin du même
  réflexe, adapté à son moteur de stockage.

---

## Étape 2A — C'est un site (joignable par un domaine)

1. Le service publie son port sur l'hôte, **sur `0.0.0.0`** — pas sur
   `127.0.0.1`. Le portier joint la machine via une passerelle Docker
   (`extra_hosts: hote → host-gateway`, voir `proxy/docker-compose.yml`), qui
   arrive par le réseau du pont, pas par la boucle locale ; un port lié à
   `127.0.0.1` lui serait invisible.

   *Alternative plus propre, à privilégier pour un nouveau service :*
   rejoindre directement le réseau partagé `web` et ne publier aucun port,
   voir [README.md](README.md#un-service-qui-publie-encore-un-port) pour le
   modèle exact.

2. Un fichier de site, posé **hors de tout dépôt applicatif**, directement
   sur le serveur :

   ```bash
   sudo nano /opt/proxy/sites/mon-service.fr.caddy
   ```

   ```
   mon-service.fr {
   	encode zstd gzip
   	reverse_proxy hote:PORT
   }
   ```

3. Rechargement, **sans redémarrer le portier ni interrompre aucun autre
   site** :

   ```bash
   docker compose -f /opt/proxy/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
   ```

4. Vérifiez que les autres sites répondent toujours — ce n'est pas censé
   avoir bougé, mais une vérification rapide coûte dix secondes :

   ```bash
   curl -sSI https://vigie-clinique.fr/ | head -3
   curl -sSI https://comptap.fr/ | head -3
   ```

Le détail des mécanismes du portier (réseau `web`, `Caddyfile`, dépannage)
est dans [README.md](README.md).

---

## Étape 2B — C'est un service de fond (bot, worker, tâche planifiée)

Pas de portier, pas de domaine, pas de certificat. Un bot Vinted ou un bot
Dofus n'a besoin de rien de tout ça : il tourne, il parle au monde extérieur
en sortant (scraping, appels API), personne ne vient le joindre depuis
Internet.

```bash
sudo mkdir -p /opt/bot-vinted
```

Un squelette minimal, sur ce modèle :

```yaml
# /opt/bot-vinted/docker-compose.yml
name: bot-vinted

services:
  bot:
    build: .
    restart: unless-stopped
    env_file: .env
    # Aucun « ports: » — rien n'a besoin de le joindre depuis l'extérieur.
    volumes:
      - bot-vinted-data:/data   # seulement si le bot a un état à conserver

volumes:
  bot-vinted-data:
```

Ce compose n'a **aucun** réseau externe, **aucun** port, **aucune**
dépendance à quoi que ce soit d'autre sur la machine. C'est délibéré : un
service qui n'a besoin de parler à rien sur cette machine ne doit rien lui
déclarer. `docker compose up -d` dans ce dossier ne peut ni être empêché par
un autre projet, ni en empêcher un autre.

```bash
cd /opt/bot-vinted
docker compose up -d --build
docker compose logs -f     # suivre son activité
```

Si le bot a besoin d'une supervision minimale (voir s'il tourne, relancer une
tâche), une petite API d'administration reste envisageable — mais dès qu'elle
doit être atteignable depuis un navigateur ou un domaine, elle bascule dans
le cas **2A** ci-dessus : un fichier de site, un port publié sur `0.0.0.0`,
rien de plus.

---

## Étape 3 — Vérification finale, avant de considérer que c'est fait

Trois contrôles, qui valent pour un site comme pour un service de fond :

```bash
# Le nouveau service tourne, pas en boucle de redémarrage
docker ps --format '{{.Names}}\t{{.Status}}'

# Rien d'autre n'a bougé
docker ps --format '{{.Names}}\t{{.Status}}' | grep -v bot-vinted

# Si c'est un site : il répond, et les autres aussi
curl -sSI https://mon-service.fr/ | head -3
```

Un `docker compose down` dans le dossier du nouveau service ne doit avoir
**aucun** effet visible sur `docker ps` en dehors de ce service. Si ce n'est
pas le cas, une dépendance implicite s'est glissée quelque part — c'est
justement ce que cette check-list sert à empêcher.
