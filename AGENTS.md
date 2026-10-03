<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- App images live as CDN pointers in src/assets/**/*.asset.json; import the pointer and use `.url` (accessory renders load via import.meta.glob on accfit/*.png.asset.json). Why: keeps ~400MB of images out of the repo.
- Game state is saved whole as JSON in player_progress.game_state for signed-in users, or in browser storage for guests (src/lib/game-sync.ts). Why: the service layer is mock-only, so this is what keeps progress across reloads and devices.
