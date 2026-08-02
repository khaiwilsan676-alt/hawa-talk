1. **Fix AI Support Back Icon:**
   - Modify `components/HawaSupport.tsx` to accept an `onBack` prop: `export default function HawaSupport({ onBack }: { onBack?: () => void })`
   - Update the back button's onClick handler: `onClick={onBack || (() => window.history.back())}`
   - Update `components/MePage.tsx` to pass the `onBack` prop to `<HawaSupport />` to return to the 'me' view: `<HawaSupport onBack={() => switchView('me')} />`

2. **Fix Keyboard White Strip:**
   - Change the wrapper `div` in `components/HawaSupport.tsx` from `h-screen` to `h-[100dvh]` to respect dynamic viewport heights (like when the mobile keyboard is open) or apply Capacitor safe area constraints if needed. Often, using `h-[100dvh]` or just updating `flex flex-col h-full absolute inset-0` fixes these layout issues. We'll update the main div className to: `flex flex-col h-[100dvh] bg-slate-50 w-full absolute inset-0 z-50` or similar to take up the full available screen without causing scroll bugs.
   - Using `h-[100dvh]` usually prevents the white strip over the keyboard on mobile browsers and PWAs.

3. **Pre-commit Checks:**
   - Run verification instructions (`pre_commit_instructions`)

4. **Live Preview:**
   - Call `start_live_preview_instructions` and provide the URL.
