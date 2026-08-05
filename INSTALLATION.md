# Installation de A à Z sur un VPS OVHcloud

Guide complet, pas à pas, en partant de zéro. Comptez **30 à 45 minutes** la
première fois.

Tout se fait depuis un navigateur et un terminal. Aucune connaissance préalable
de Linux n'est nécessaire : chaque commande est donnée telle quelle, à copier.

**Sommaire**

1. [Activer et récupérer son VPS OVHcloud](#1-activer-et-récupérer-son-vps-ovhcloud)
2. [Se connecter au VPS](#2-se-connecter-au-vps)
3. [Mettre à jour et sécuriser le serveur](#3-mettre-à-jour-et-sécuriser-le-serveur)
4. [Le nom de domaine](#4-le-nom-de-domaine-fortement-recommandé)
5. [Installer Docker](#5-installer-docker)
6. [Installer l'application](#6-installer-lapplication)
7. [Vérifier que tout marche](#7-vérifier-que-tout-marche)
8. [Sauvegardes automatiques](#8-sauvegardes-automatiques)
9. [Mettre à jour l'application](#9-mettre-à-jour-lapplication)
10. [Piloter le serveur depuis un téléphone](#10-piloter-le-serveur-depuis-un-téléphone)
11. [Dépannage](#11-dépannage)

---

## 1. Activer et récupérer son VPS OVHcloud

### 1.1 Vérifier si votre VPS est déjà livré

1. Allez sur **<https://www.ovh.com/manager/>** et connectez-vous.
2. Dans le menu du haut, choisissez **Bare Metal Cloud**.
3. Dans la colonne de gauche, dépliez **Serveurs Privés Virtuels**.

Si un VPS apparaît dans la liste, il est actif : passez au point 1.3.

### 1.2 Si vous n'avez pas encore de VPS

Commandez-le sur **<https://www.ovhcloud.com/fr/vps/>**.

Au moment de la commande :

| Réglage | Choix conseillé |
|---|---|
| Distribution | **Ubuntu Server** (dernière version LTS proposée) |
| Modèle | Le plus petit suffit largement (2 Go de RAM confortable) |
| Options | Aucune n'est nécessaire |

La livraison prend de quelques minutes à quelques heures. Vous recevez un
**e-mail de livraison** : ne le supprimez pas, il contient tout.

### 1.3 Récupérer vos identifiants

L'e-mail de livraison OVHcloud contient :

- **L'adresse IPv4 de votre VPS** — notez-la, elle servira partout. Elle est
  aussi visible dans le manager, sur la page de votre VPS.
- **Votre nom d'utilisateur** — OVHcloud crée un compte nommé d'après le
  système choisi. Avec Ubuntu, c'est **`ubuntu`**.
- **Un lien sécurisé vers un mot de passe temporaire** — cliquez dessus pour
  l'afficher. Ce lien est à usage unique et expire : ouvrez-le au moment où
  vous en avez besoin.

> **À savoir :** chez OVHcloud, le compte `root` est **désactivé par défaut**.
> Vous vous connectez avec `ubuntu` et vous passez les commandes
> d'administration avec `sudo`. C'est normal, et c'est plus sûr.

### 1.4 En cas de blocage : la console KVM

Si vous n'arrivez plus à vous connecter en SSH, OVHcloud fournit un accès écran
directement dans le navigateur, qui ne dépend pas du réseau ni de SSH :

Manager → onglet **Accueil** → section **Votre VPS** → bouton **`...`** à côté
du nom du VPS → **KVM**.

C'est votre filet de sécurité. Gardez-le en tête.

---

## 2. Se connecter au VPS

Remplacez partout `VOTRE_IP` par l'adresse IPv4 de votre VPS.

### Depuis Windows

Ouvrez le **Terminal Windows** (touche Windows, tapez « Terminal ») puis :

```bash
ssh ubuntu@VOTRE_IP
```

### Depuis un Mac

Ouvrez **Terminal** (Cmd + Espace, tapez « Terminal ») puis la même commande.

### Depuis un téléphone

Installez une application SSH : **Termius** (iOS et Android) ou **JuiceSSH**
(Android). Créez un hôte avec l'IP, l'utilisateur `ubuntu` et le mot de passe.

### Premier échange

```
The authenticity of host '...' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

Tapez **`yes`** puis Entrée. C'est normal à la première connexion.

Saisissez ensuite le mot de passe temporaire. **Rien ne s'affiche pendant la
frappe du mot de passe** — pas d'étoiles, pas de points. C'est voulu. Tapez et
validez.

Le système vous demande immédiatement de **changer ce mot de passe** :

1. Ressaisissez le mot de passe temporaire (« Current password »).
2. Choisissez un nouveau mot de passe long, deux fois.

**La session se ferme automatiquement après le changement.** C'est normal.
Reconnectez-vous avec le nouveau mot de passe :

```bash
ssh ubuntu@VOTRE_IP
```

Vous êtes en place quand l'invite ressemble à `ubuntu@vpsXXXXX:~$`.

---

## 3. Mettre à jour et sécuriser le serveur

### 3.1 Mettre à jour

```bash
sudo apt update && sudo apt upgrade -y
```

La première fois, `sudo` redemande votre mot de passe. Si un écran bleu propose
de redémarrer des services, validez **`<Ok>`** avec Entrée.

Si un message signale qu'un redémarrage est nécessaire :

```bash
sudo reboot
```

Attendez une minute, puis reconnectez-vous.

### 3.2 Activer le pare-feu

⚠️ **Respectez l'ordre des commandes.** Autoriser SSH **avant** d'activer le
pare-feu, sinon vous vous coupez l'accès à votre propre serveur.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

À la question `Command may disrupt existing ssh connections. Proceed?`,
répondez **`y`**.

Vérification :

```bash
sudo ufw status
```

Vous devez voir `Status: active` et les trois règles.

### 3.3 Se connecter par clé plutôt que par mot de passe (recommandé)

Plus pratique — plus de mot de passe à saisir — et nettement plus sûr.

**Sur votre ordinateur** (pas sur le VPS), dans un nouveau terminal :

```bash
ssh-keygen -t ed25519
```

Validez trois fois par Entrée. Puis :

```bash
ssh-copy-id ubuntu@VOTRE_IP
```

Saisissez votre mot de passe une dernière fois. Testez ensuite :

```bash
ssh ubuntu@VOTRE_IP
```

Si vous entrez sans mot de passe, c'est en place.

> Ne désactivez l'authentification par mot de passe qu'une fois la connexion
> par clé **vérifiée**, et gardez la console KVM en tête si vous le faites.

---

## 4. Le nom de domaine (fortement recommandé)

Sans domaine, le site répond en HTTP simple sur l'IP : **votre mot de passe et
le contenu de vos études circulent en clair sur le réseau.** Pour des données
de recherche clinique, ce n'est pas acceptable durablement.

Avec un domaine, Caddy obtient et renouvelle un certificat HTTPS tout seul,
gratuitement. Coût : une dizaine d'euros par an.

### 4.1 Acheter le domaine

Chez OVHcloud (<https://www.ovhcloud.com/fr/domains/>) ou n'importe quel autre
bureau d'enregistrement.

### 4.2 Le faire pointer vers le VPS

Si le domaine est chez OVHcloud : Manager → **Web Cloud** → **Noms de domaine**
→ votre domaine → onglet **Zone DNS**.

Un domaine fraîchement acheté possède déjà des enregistrements qui pointent vers
la page de parking d'OVHcloud. Il faut les **modifier**, pas seulement en
ajouter.

| Type | Sous-domaine | Cible |
|---|---|---|
| **A** | *(vide)* | l'**IPv4** de votre VPS |
| **AAAA** | *(vide)* | l'**IPv6** de votre VPS |
| **A** | `www` | l'**IPv4** de votre VPS |
| **AAAA** | `www` | l'**IPv6** de votre VPS |

> ⚠️ **Ne négligez pas les enregistrements AAAA.** S'ils continuent de pointer
> vers OVHcloud, les appareils qui préfèrent l'IPv6 — un téléphone en 5G, par
> exemple — tomberont sur la page de parking, et la délivrance du certificat
> peut échouer. C'est l'erreur la plus fréquente à cette étape.
>
> Vous trouvez l'IPv6 de votre VPS avec `ip -6 addr show` (ou dans le manager).

`www.mondomaine.fr` redirige automatiquement vers `mondomaine.fr` : les deux
écritures fonctionnent, une seule adresse fait autorité.

La propagation prend de quelques minutes à quelques heures. Pour vérifier
depuis le VPS :

```bash
getent hosts mondomaine.fr
```

Quand cette commande affiche l'IP de votre VPS, c'est prêt. Tant qu'elle ne
renvoie rien, la propagation est en cours : patientez et réessayez.

---

## 5. Installer Docker

Une seule commande, depuis le VPS :

```bash
curl -fsSL https://get.docker.com | sh
```

Puis autorisez votre utilisateur à piloter Docker sans `sudo` :

```bash
sudo usermod -aG docker $USER
```

**Déconnectez-vous et reconnectez-vous** pour que ce changement prenne effet :

```bash
exit
```
```bash
ssh ubuntu@VOTRE_IP
```

Vérification :

```bash
docker run --rm hello-world
```

Un message « Hello from Docker! » confirme que tout est en place.

---

## 6. Installer l'application

### 6.1 Récupérer le code

```bash
cd ~
git clone https://github.com/Torkor29/GESTIONPROJET.git
cd GESTIONPROJET
```

> Le dépôt est **public** : le clonage ne demande aucun identifiant. Si vous
> préférez le rendre privé (GitHub → Settings → General → Danger Zone →
> Change visibility), il faudra alors créer un jeton d'accès personnel et
> l'utiliser comme mot de passe au moment du clonage.
>
> Aucun secret n'est publié : le fichier `.env` que vous allez créer n'est
> jamais envoyé sur GitHub.

### 6.2 Créer le fichier de configuration

Générez d'abord la clé de signature des sessions :

```bash
openssl rand -hex 32
```

Une longue suite de caractères s'affiche. **Copiez-la**, elle sert à l'étape
suivante.

Créez maintenant le fichier :

```bash
cp .env.example .env
nano .env
```

`nano` est un éditeur de texte dans le terminal. Renseignez :

```bash
MOT_DE_PASSE=choisissez-ici-un-mot-de-passe-long-et-unique
SECRET_SESSION=collez-ici-la-suite-generee-juste-avant
DOMAINE=projets.mondomaine.fr
```

- `MOT_DE_PASSE` : celui que **vous** saisirez pour entrer dans l'application.
  Prenez-en un long et propre à cet outil.
- `SECRET_SESSION` : la valeur générée par `openssl`. Ne la réutilisez nulle
  part ailleurs.
- `DOMAINE` : votre domaine. **Si vous n'en avez pas encore, supprimez cette
  ligne** — l'application s'adaptera et répondra en HTTP sur l'IP.

Laissez les autres lignes telles quelles.

Pour enregistrer et quitter nano : **Ctrl + O**, Entrée, puis **Ctrl + X**.

### 6.3 Démarrer

```bash
docker compose up -d --build
```

La première construction prend **5 à 10 minutes** : Docker télécharge Node,
installe les dépendances et compile l'application. C'est normal, laissez
tourner.

Quand l'invite revient, vérifiez :

```bash
docker compose ps
```

Les deux services `app` et `caddy` doivent être à l'état `running`.

La base de données se crée toute seule au premier démarrage : il n'y a
**aucune** commande de migration à lancer.

---

## 7. Vérifier que tout marche

Ouvrez dans votre navigateur :

- avec un domaine : **`https://projets.mondomaine.fr`**
- sans domaine : **`http://VOTRE_IP`**

Vous devez voir l'écran de connexion. Saisissez le `MOT_DE_PASSE` du fichier
`.env`.

Faites ensuite un test complet, il prend deux minutes :

1. **Créez une étude** — cochez un cadre réglementaire, par exemple RIPH 2 +
   RGPD/CNIL.
2. Ouvrez l'onglet **Réglementaire** : la checklist doit être générée.
3. Onglet **Documents** : déposez un fichier, puis retéléchargez-le.
4. **Missions** : créez une mission avec une échéance.
5. **Temps** : démarrez puis arrêtez le chronomètre.
6. Testez enfin depuis votre **téléphone**.

Pour consulter les journaux à tout moment :

```bash
docker compose logs -f app
```

Quittez l'affichage avec **Ctrl + C** (cela n'arrête pas l'application).

---

## 8. Sauvegardes automatiques

**Toutes vos données tiennent dans le dossier `donnees/`** : la base SQLite et
les fichiers déposés. C'est le seul dossier à sauvegarder.

Test manuel :

```bash
./scripts/sauvegarde.sh
```

Une archive horodatée apparaît dans `sauvegardes/`.

### Automatiser chaque nuit à 3 h

```bash
crontab -e
```

Si l'éditeur est demandé, choisissez `1` (nano). Ajoutez à la fin :

```
0 3 * * * cd /home/ubuntu/GESTIONPROJET && ./scripts/sauvegarde.sh >> /home/ubuntu/sauvegarde.log 2>&1
```

Enregistrez (**Ctrl + O**, Entrée, **Ctrl + X**).

Les archives de plus de 30 jours sont supprimées automatiquement.

### Sortir les sauvegardes du serveur

> Une sauvegarde qui vit sur la machine qu'elle protège ne protège de rien.

Depuis **votre ordinateur**, pour rapatrier les archives :

```bash
scp ubuntu@VOTRE_IP:~/GESTIONPROJET/sauvegardes/*.tar.gz ~/Downloads/
```

Faites-le régulièrement, ou activez en complément l'option de sauvegarde
automatique proposée par OVHcloud dans le manager.

### Restaurer

```bash
cd ~/GESTIONPROJET
./scripts/restauration.sh sauvegardes/gestionprojet_2026-08-04_03h00.tar.gz
```

---

## 9. Mettre à jour l'application

```bash
cd ~/GESTIONPROJET
./scripts/sauvegarde.sh
git pull
docker compose up -d --build
```

La sauvegarde avant mise à jour est une habitude qui coûte dix secondes et
sauve des soirées.

---

## 10. Piloter le serveur depuis un téléphone

Deux besoins distincts, deux outils. Les deux sont gratuits.

### 10.1 Taper des commandes : Termius

**Termius** (iOS et Android) est le client SSH le plus confortable sur mobile :
clavier adapté avec les touches Ctrl/Tab/flèches, connexions enregistrées,
raccourcis de commandes.

1. Installez Termius depuis l'App Store ou le Play Store.
2. **New Host** → renseignez :
   - *Hostname* : l'IPv4 de votre VPS
   - *Username* : `ubuntu`
   - *Password* : votre mot de passe (ou importez votre clé SSH dans
     **Keychain**, plus pratique et plus sûr)
3. Touchez l'hôte pour vous connecter.

Alternatives : **Blink Shell** (iOS, payant, excellent) ou **JuiceSSH**
(Android, gratuit).

### 10.2 Voir et administrer sans ligne de commande : Cockpit

**Cockpit** est une console web d'administration développée par Red Hat,
présente dans les dépôts Ubuntu. Elle affiche dans le navigateur : charge CPU
et mémoire, espace disque, services, journaux système, mises à jour, comptes,
réseau, gestionnaire de fichiers — **et un vrai terminal intégré**.

C'est le seul outil à installer : il couvre le visuel *et* la ligne de
commande, et son interface fonctionne correctement sur écran de téléphone.

#### Installation

```bash
sudo apt update
sudo apt install -y cockpit cockpit-storaged cockpit-networkmanager cockpit-packagekit
sudo systemctl enable --now cockpit.socket
```

#### Accès

```bash
sudo ufw allow 9090/tcp
```

Ouvrez ensuite **`https://VOTRE_IP:9090`** dans le navigateur du téléphone.

> Le navigateur affiche un avertissement de sécurité : Cockpit utilise un
> certificat auto-signé. **La connexion est bien chiffrée**, c'est seulement le
> certificat qui n'est pas signé par une autorité connue. Touchez
> « Paramètres avancés » puis « Continuer ». À faire une fois par appareil.

Connectez-vous avec **`ubuntu`** et votre mot de passe système. Cochez
**« Utiliser le mot de passe pour les tâches d'administration »** pour agir en
`sudo` depuis l'interface.

#### Protéger cet accès

Cockpit publié sur Internet devient une cible de tentatives de connexion
automatisées. Deux mesures, à faire tout de suite :

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

Et surtout : un **mot de passe système long**. C'est lui qui protège l'accès.

> **Variante plus sûre, sans rien exposer.** Plutôt que d'ouvrir le port 9090,
> vous pouvez le faire transiter par le tunnel SSH. Depuis un ordinateur :
>
> ```bash
> ssh -L 9090:127.0.0.1:9090 ubuntu@VOTRE_IP
> ```
>
> puis ouvrez `https://127.0.0.1:9090` sur cet ordinateur. Termius sait faire
> la même chose (fonction *Port Forwarding*). Plus sûr, mais moins immédiat
> depuis un téléphone : à vous de choisir selon votre usage.

#### Ce que vous ferez le plus souvent dans Cockpit

| Besoin | Où |
|---|---|
| Vérifier que le serveur va bien | **Aperçu** — CPU, mémoire, disque |
| Voir pourquoi quelque chose ne marche pas | **Journaux** |
| Taper une commande | **Terminal** |
| Récupérer ou déposer un fichier | **Navigateur de fichiers** |
| Appliquer les mises à jour de sécurité | **Mises à jour logicielles** |
| Redémarrer le serveur | Bouton en haut à droite de l'**Aperçu** |

Les commandes de l'application (`docker compose ...`) se tapent dans l'onglet
**Terminal** de Cockpit, exactement comme en SSH.

### 10.3 Et pour Docker en particulier ?

Vous n'avez que deux conteneurs et un seul fichier `docker-compose.yml` : le
terminal de Cockpit suffit largement, et ajouter un outil de plus, c'est une
surface d'attaque et une maintenance de plus.

Si vous y tenez, **Portainer** est la référence maintenue pour piloter Docker
depuis une interface web. **Dockge**, souvent cité et plus léger, n'a plus
connu de version depuis mars 2025 : je ne le conseille pas pour des données de
travail.

### 10.4 Rappel : la console KVM d'OVHcloud

Manager → **Accueil** → bouton **`...`** à côté du VPS → **KVM**.

Ce n'est pas un outil du quotidien — l'affichage est rudimentaire et la saisie
peu confortable. C'est votre accès de secours quand ni SSH ni Cockpit ne
répondent plus. Elle passe par OVHcloud, pas par le réseau de votre serveur.

---

## 11. Dépannage

### « Permission denied » à la connexion SSH

Mot de passe erroné, ou mauvais nom d'utilisateur. Avec Ubuntu, c'est `ubuntu`,
pas `root`. Si le mot de passe temporaire est perdu, réinitialisez-le depuis le
manager OVHcloud, ou passez par la console **KVM**.

### La page ne s'affiche pas

```bash
docker compose ps
docker compose logs --tail 50
```

Vérifiez aussi le pare-feu :

```bash
sudo ufw status
```

Les ports 80 et 443 doivent être autorisés.

### Le certificat HTTPS ne se crée pas

Caddy a besoin que le domaine pointe **déjà** vers le VPS et que le port 80
soit joignable depuis Internet.

```bash
dig +short projets.mondomaine.fr     # doit renvoyer l'IP du VPS
docker compose logs caddy | tail -30
```

Si le DNS vient d'être modifié, attendez et relancez :

```bash
docker compose restart caddy
```

### Je me connecte, mais je reviens toujours sur l'écran de connexion

Typiquement : `DOMAINE` est renseigné dans `.env` alors que vous accédez au
site en `http://IP`. Le cookie de session n'est alors transmis qu'en HTTPS.
Accédez au site par son domaine en `https://`, ou retirez la ligne `DOMAINE`
et relancez :

```bash
docker compose up -d
```

### « no space left on device »

```bash
df -h                    # état du disque
docker system prune -a   # supprime les images inutilisées
```

### Tout redémarrer proprement

```bash
cd ~/GESTIONPROJET
docker compose down
docker compose up -d
```

Vos données ne sont pas touchées : elles vivent dans `donnees/`, en dehors des
conteneurs.

---

## Récapitulatif des commandes

Une fois installé, ces quelques commandes suffisent au quotidien :

```bash
cd ~/GESTIONPROJET

docker compose ps              # état des services
docker compose logs -f app     # journaux en direct
docker compose restart         # redémarrer
docker compose down            # arrêter
docker compose up -d           # relancer

./scripts/sauvegarde.sh        # sauvegarde manuelle
git pull && docker compose up -d --build   # mise à jour
```
