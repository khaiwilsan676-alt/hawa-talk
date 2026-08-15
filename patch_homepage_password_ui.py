import re

with open('components/HomePage.tsx', 'r') as f:
    content = f.read()

# I need to add PasswordInput component definition and the password modal to the render.
# Let's put PasswordInput near the top after imports.

password_input_comp = """
// ---------- Password Input Component (4 Digits, Numbers Only, Auto-shift) ----------
function PasswordInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInput = (index: number, inputValue: string) => {
    // Only allow numbers
    const numberValue = inputValue.replace(/[^0-9]/g, '')

    if (numberValue) {
      const newDigits = value.split('')
      newDigits[index] = numberValue.slice(-1)
      const newPassword = newDigits.join('').slice(0, 4)
      onChange(newPassword)

      // Auto-shift to next box
      if (index < 3 && numberValue) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
        />
      ))}
    </div>
  )
}
"""

content = content.replace(
"""interface HomePageProps {""",
password_input_comp + "\n" + """interface HomePageProps {"""
)

# And add the modal at the end before final div return
modal_ui = """
      {/* Room Password Modal */}
      {showRoomPasswordCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRoomPasswordCard(false)} />
          <div className="relative bg-white w-80 rounded-3xl shadow-2xl p-6 mx-4 animate-scale-up">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Locked Room</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Enter password to join</p>

            <PasswordInput value={enteredRoomPassword} onChange={setEnteredRoomPassword} />

            <button
              onClick={handleRoomPasswordSubmit}
              disabled={enteredRoomPassword.length !== 4}
              className={`w-full mt-6 py-3.5 rounded-2xl font-semibold text-white transition-all ${
                enteredRoomPassword.length === 4
                  ? 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Enter Room
            </button>

            <button
              onClick={() => {
                setShowRoomPasswordCard(false)
                setEnteredRoomPassword('')
              }}
              className="w-full mt-3 py-3 text-gray-500 font-medium text-center hover:bg-gray-50 rounded-2xl active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
"""

content = content.replace(
"""      {isSearchOpen && (""",
modal_ui + "\n" + """      {isSearchOpen && ("""
)

with open('components/HomePage.tsx', 'w') as f:
    f.write(content)
