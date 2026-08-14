#!/bin/bash
sed -i 's/export default function EmojiPicker({ onClose, onSelectEmoji }) {/export default function EmojiPicker({ onClose, onSelectEmoji }: { onClose: () => void, onSelectEmoji: (e: any) => void }) {/' components/Emojipicker.tsx
sed -i 's/export default function GiftPicker({ onClose }) {/export default function GiftPicker({ onClose }: { onClose: () => void }) {/' components/GiftPicker.tsx
sed -i 's/const \[selectedGift, setSelectedGift\] = useState(null)/const \[selectedGift, setSelectedGift\] = useState<number | null>(null)/' components/GiftPicker.tsx
sed -i 's/targetUser.countryCode ||/ /' components/PublicProfile.tsx
