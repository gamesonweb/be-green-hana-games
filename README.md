# Rendu final mineure programmation de jeux 3D sur le Web
Sébastien Aglaé & Mike Chiappe

## Installation
```bash
npm install
```

## Lancement
```bash
npm start
```

## Espace
Fait par Sébastien Aglaé
### Controles
- Z: Monter
- S: Descendre
- Q: Tourner à gauche
- D: Tourner à droite
- Espace: Accélérer
- Shift: Ralentir
- E: Orienter le vaisseau vers la planète la plus proche

### Se qui a été fait
- Ajout d'un vaisseau avec un cockpit
- Skybox avec des étoiles
- Intégration d'un vaisseau
  - Tremblement lors de l'accélération
  - Effet de lumière devant le vaisseau (violette)
  - Dashboard
- Dialogue basique
- Intégration du systeme solaire (temporaire)
  - Orbit
  - Rotation sur lui même
  - Rotation autour du soleil
- Transition des planètes
  - Effet de fumée (GPU Particles)
  - Effet de lumière (feu lors de l'entrée dans l'atmosphère)
- Un dashboard avec les informations du vaisseau
  - Vitesse du vaisseau
  - Distance a parcourir vers la planète la plus proche
  - Nom de la planète la plus proche
  - Regime des 3 moteurs
  - L'heure réele
  - Le nombre d'fps
- Toon shader

Le dashboard fait sous figma et exporté en utilisant le plugin figma to babylonjs
https://www.figma.com/file/VDfB4SOgeenDlYsY7d6GvQ/GOW2023?type=design&node-id=0%3A1&t=iU5WZSCvmMBcvUF2-1


## Contrôles
Z: Avancer
S: Reculer
Q: Tourner à gauche
D: Tourner à droite

## Description
Le joueur incarne une femme dans un petit village de campagne.
Il peut se déplacer dans le village avec les touches ZQSD.
Le jeu fonctionne avec un modèle 2D et les collisions sont calculées une seule fois au début du jeu.