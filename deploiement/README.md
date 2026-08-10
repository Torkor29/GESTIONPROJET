# Héberger plusieurs sites sur le même serveur

Par défaut, `docker-compose.yml` à la racine du dépôt installe Vigie **seul** :
l'application et son propre Caddy, qui détient les ports 80 et 443. C'est le
plus simple, et c'est ce que décrit le README principal.

Dès qu'un deuxième site arrive sur la machine, ce montage ne tient plus : deux
programmes ne peuvent pas écouter sur le port 443. Il faut alors un **portier
unique**, séparé des sites qu'il dessert.

```
Internet ──► /opt/proxy   (Caddy seul, détient 80 et 443)
                  │
                  ├──► vigie     (pile Vigie,   aucun port publié)
                  ├──► comptap   (pile comptap, aucun port publié)
                  └──► …          un fichier par site à venir
```

Trois propriétés en découlent, et ce sont elles qui comptent :

- **Ajouter un site ne touche à aucun autre.** Un fichier dans `sites/`, un
  rechargement du proxy, c'est tout.
- **Redémarrer un site ne fait tomber personne.** Le proxy ne bouge pas.
- **Le dépôt cesse de se battre avec la configuration du serveur.** Les blocs
  propres à votre machine vivent dans `/opt/proxy/sites/`, hors de tout dépôt.

---

## Contenu de ce dossier

| Fichier | Rôle |
|---|---|
| `proxy/docker-compose.yml` | La pile du portier. À copier dans `/opt/proxy/`. |
| `proxy/Caddyfile` | Ne décrit aucun site : charge le contenu de `sites/`. |
| `proxy/sites/*.caddy` | Un fichier par site. Modèles à adapter. |

Et à la racine du dépôt :

| Fichier | Rôle |
|---|---|
| `docker-compose.derriere-proxy.yml` | Variante qui écarte le Caddy de Vigie et rattache l'application au réseau partagé. |

---

## Mise en place

### 1. Le réseau partagé

C'est par lui que le proxy joint les sites. Il est créé une fois pour toutes :

```bash
docker network create web
```

Si la commande répond que le réseau existe déjà, tout va bien.

### 2. Le portier

```bash
sudo mkdir -p /opt/proxy
sudo cp -r /chemin/vers/GESTIONPROJET/deploiement/proxy/. /opt/proxy/
```

Adaptez les fichiers de `/opt/proxy/sites/` à vos domaines, puis vérifiez la
configuration **avant** de démarrer :

```bash
docker run --rm \
  -v /opt/proxy/Caddyfile:/etc/caddy/Caddyfile:ro \
  -v /opt/proxy/sites:/etc/caddy/sites:ro \
  caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

### 3. Libérer les ports 80 et 443

Un seul programme peut les tenir. Si Vigie tournait jusque-là en mode autonome,
son Caddy les occupe encore :

```bash
docker compose -f /chemin/vers/GESTIONPROJET/docker-compose.yml down
```

### 4. Démarrer le portier

```bash
docker compose -f /opt/proxy/docker-compose.yml up -d
```

### 5. Relancer Vigie derrière lui

Noter les **deux** `-f` : le second modifie le premier, il ne le remplace pas.

```bash
docker compose \
  -f /chemin/vers/GESTIONPROJET/docker-compose.yml \
  -f /chemin/vers/GESTIONPROJET/docker-compose.derriere-proxy.yml \
  up -d --build
```

`DOMAINE` reste nécessaire dans le `.env` : il sert au drapeau `secure` du
cookie de session et aux adresses absolues des pages publiques.

---

## Ajouter un site plus tard

```bash
sudo nano /opt/proxy/sites/mon-site.fr.caddy
```

```
mon-site.fr {
	encode zstd gzip
	reverse_proxy mon-site:3000
}
```

Puis, sans redémarrer le proxy ni interrompre les autres sites :

```bash
docker compose -f /opt/proxy/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
```

La pile du nouveau site doit rejoindre le réseau `web` et **ne publier aucun
port** :

```yaml
services:
  app:
    networks:
      default: {}
      web:
        aliases: [mon-site]

networks:
  web:
    external: true
```

---

## Un service qui publie encore un port

Une pile qu'on ne veut pas modifier tout de suite peut rester joignable par le
port qu'elle publie sur la machine. Le proxy la désigne alors par `hote` :

```
reverse_proxy hote:8080
```

`hote` est déclaré dans `extra_hosts` du proxy et pointe vers la machine. C'est
préférable à l'adresse du pont Docker (`172.17.0.1`), qui n'est pas garantie
stable : elle change si le démon Docker est reconfiguré, et le site tombe alors
en 502 sans raison apparente.

---

## Dépannage

**502 sur un site.** Le proxy fonctionne mais n'atteint pas le service. Presque
toujours : le conteneur cible est arrêté ou redémarre en boucle. Vérifiez
d'abord `docker ps` — un conteneur en `Restarting` ne publie rien — puis ses
journaux. Le proxy n'est pas en cause.

**« port is already allocated » au démarrage du proxy.** Un autre conteneur
tient encore 80 ou 443. Trouvez-le :

```bash
docker ps --format '{{.Names}}\t{{.Ports}}' | grep -E ':80->|:443->'
```

**Certificat non délivré.** Le domaine doit pointer vers la machine avant que
Caddy puisse obtenir le certificat. Vérifiez l'enregistrement A, puis :

```bash
docker compose -f /opt/proxy/docker-compose.yml logs --tail 50 caddy
```

**Sur AWS, ne comparez pas l'adresse publique à `ip addr`.** L'adresse publique
d'une instance Lightsail ou EC2 est une adresse NAT : elle n'apparaît jamais sur
l'interface réseau de la machine, qui ne connaît que son adresse privée de VPC.
Un script de déploiement qui vérifie « cette machine porte-t-elle bien l'IP du
DNS ? » échouera donc toujours, y compris quand tout est correct.
