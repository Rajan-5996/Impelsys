# Coding Rules

- Do not add comments to any file unless the user explicitly asks for comments in that request.
- Every source file must be between 200 and 250 lines. Never exceed 250 lines.
  - If a file would grow past 250 lines, split it into additional files/modules instead of letting it grow.
  - If a file would end up under 200 lines on its own, combine it with a closely related file rather than leaving it short.
- These rules apply to all files created or edited in this repo, in every directory (`apps/`, `packages/`, etc).

# State Management Rules

- All API calls must go through Redux Thunks (`createAsyncThunk` from `@reduxjs/toolkit`). RTK Query is not used in this app — no `createApi`, no `baseApi`, no base-query adapters.
- A thunk calls the shared `axiosInstance` (`apps/web/src/lib/axios-instance.ts`, baseURL `/api`) and lives in the relevant feature's slice file under `apps/web/src/store/`. Components dispatch the thunk with `useAppDispatch` and read the result via `useAppSelector` — never call `axios`/`fetch` directly inside a component, hook, or utility file.
- Never import `axios` or create another axios instance outside `apps/web/src/lib/axios-instance.ts` — add headers/interceptors there so every thunk picks them up automatically.
- Do not prop-drill state through multiple component layers. If a piece of state needs to be read or updated by more than one component that isn't a direct parent/child, put it in Redux (a slice under `apps/web/src/store/`) and access it with `useAppSelector`/`useAppDispatch` from `apps/web/src/store/hooks.ts` instead of passing it down through props.
- Local component state (`useState`) is fine only when the state is used exclusively by that one component and never needs to be read by a sibling, parent, or unrelated descendant.

# Color Palette

- The app's color tokens are defined once in `packages/ui/src/styles/globals.css` (`:root` and `.dark`) and exposed as Tailwind utilities via the `@theme inline` block. Never hardcode a hex/oklch color value in a component — use the Tailwind classes below so every screen stays on the same palette.
- Brand colors (constant across light/dark mode):
  - `primary` (`#283618`) / `primary-foreground` (`#fefae0`) — use via `bg-primary`, `text-primary-foreground`.
  - `secondary` (`#fefae0`) / `secondary-foreground` (`#283618`) — use via `bg-secondary`, `text-secondary-foreground`.
  - `standard` (`#606c38`) / `standard-foreground` (`#fefae0`) — use via `bg-standard`, `text-standard-foreground`.
  - `accent` (`#bc6c25`) / `accent-foreground` (`#fefae0`) — use via `bg-accent`, `text-accent-foreground`.
  - `warning` (`#dda15e`) / `warning-foreground` (`#283618`) — use via `bg-warning`, `text-warning-foreground`.
- If a new semantic color is ever needed, add it as a new `--name`/`--name-foreground` pair in `globals.css` (both `:root` and `.dark`) and register it in `@theme inline`, following the same pattern as the tokens above — don't introduce a one-off color inline in a component.
