# /releases

Ce dossier contient les binaires distribués par le site.

## Convention

Un sous-dossier par application, nommé avec le même `id` que dans
`data/apps.json` :

```
releases/
  croch-plan/
    croch-plan_0.1.0_linux-x86_64.flatpak
    croch-plan_0.1.0_x64-setup.exe
    croch-plan_0.1.0_universal.dmg
  autre-app/
    ...
```

## Mettre à jour une release

1. Déposer les nouveaux binaires dans `releases/<id-app>/`.
2. Mettre à jour l'entrée correspondante dans `data/apps.json` :
   - `version`, `releaseDate`
   - la liste `downloads` (chemin `file` relatif à la racine du site,
     `size` en affichage humain)
3. Commit + push. GitHub Pages republie automatiquement.

## Attention à la taille du dépôt

GitHub recommande de garder les dépôts sous quelques Go et bloque les
fichiers de plus de 100 Mo sans Git LFS. Si les binaires (installeurs
Windows, DMG macOS, AppImage/Flatpak Linux) dépassent cette limite ou
que l'historique grossit trop vite, deux alternatives :

- **Git LFS** pour les gros binaires, en gardant ce même schéma de
  dossiers.
- **GitHub Releases** (releases par tag) pour héberger les fichiers,
  et ne garder ici que `data/apps.json` pointant vers les URLs
  `https://github.com/<org>/<repo>/releases/download/...` au lieu de
  chemins locaux — le front fonctionne à l'identique, seul le champ
  `file` change.