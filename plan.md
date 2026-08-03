1. Fix real-time drops on continuous typing by modifying the `isLocalUpdate` check in `onSnapshot` and implementing a `focusedField` ref so focused fields are not overwritten by remote changes while typing, but everything else syncs.
2. Fix the restart/refresh issue where `idsData` could be incorrectly mutated via shallow copies of `defaultIdsData` by replacing `defaultIdsData` with a factory function `getDefaultIdsData()` and ensuring deep copies when setting state in `onSnapshot`.
3. Complete pre commit instructions to ensure quality.
4. Verify changes using a Playwright script and capture a video of the fix in action.
5. Submit.
