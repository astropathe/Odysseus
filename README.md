# Odysseus 

Odysseus est une extension Firefox de protection de la vie privée qui utilise une **IA sémantique locale** (`all-MiniLM-L6-v2`) pour brouiller les algorithmes de profilage publicitaire par injection de bruit.

## Fonctionnalités
- **Analyse Sémantique Locale :** Extraction vectorielle des titres de page en temps réel (En local via Transformers.js et WebAssembly).
- **Contre-poids Mathématique :** Calcul de l'inverse géométrique pour sélectionner le leurre le plus opposé dans une matrice de 80 pôles sémantiques. (le dictionnaire peut être aggrandit)
- **Obfuscation Comportementale :** Injection décalée avec un délai aléatoire "humain" pour contourner l'analyse de motifs temporels (Traffic Shape Analysis).
- **Zéro Latence :** Pré-calcul et mise en cache du dictionnaire au démarrage de l'extension pour préserver le CPU. (pas de latence dans la navigation)

## Installation (Mode Développeur)
1. Téléchargez ou clonez ce dépôt.
2. Ouvrez Firefox et accédez à `about:debugging`.
3. Cliquez sur **Ce Firefox** (This Firefox).
4. Cliquez sur **Charger un module temporaire** (Load Temporary Add-on).
5. Sélectionnez le fichier `manifest.json` à la racine du projet.

## Extension sur le store à venir
