import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomePage from './HomePage'

// Mock sub-components
vi.mock('./MessagePage', () => ({
  default: () => <div data-testid="message-page">Message Page</div>
}))
vi.mock('./MePage', () => ({
  default: () => <div data-testid="me-page">Me Page</div>
}))
vi.mock('./RoomPage', () => ({
  default: () => <div data-testid="room-page">Room Page</div>
}))

// Mock Firebase
vi.mock('../src/lib/firebase', () => ({
  db: {}
}))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn((_, callback) => {
    callback({ docs: [] })
    return vi.fn() // unsubscribe
  }),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn()
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Mock window innerHeight
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 })
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 600 })
  })

  it('renders popular tab by default', async () => {
    render(<HomePage />)

    // Check for Category cards rendering
    expect(screen.getByText('Honour')).toBeInTheDocument()
    expect(screen.getByText('Charm')).toBeInTheDocument()
    expect(screen.getByText('Room')).toBeInTheDocument()
  })

  it('switches to mine tab', async () => {
    render(<HomePage />)

    const mineTab = screen.getByText('Mine')
    fireEvent.click(mineTab)

    expect(screen.getByText('Create your Room')).toBeInTheDocument()
    expect(screen.getByText('Following')).toBeInTheDocument()
    expect(screen.getByText('Recent')).toBeInTheDocument()
  })

  it('navigates to different pages via bottom bar', async () => {
    render(<HomePage />)

    // Initially home is shown
    expect(screen.queryByTestId('message-page')).not.toBeInTheDocument()
    expect(screen.queryByTestId('me-page')).not.toBeInTheDocument()

    // Navigate to Message
    const messageButton = screen.getByText('Message')
    fireEvent.click(messageButton)
    expect(screen.getByTestId('message-page')).toBeInTheDocument()

    // Navigate to Me
    const meButton = screen.getByText('Me')
    fireEvent.click(meButton)
    expect(screen.getByTestId('me-page')).toBeInTheDocument()

    // Navigate back to Home
    const homeButton = screen.getByText('Home')
    fireEvent.click(homeButton)
    expect(screen.queryByTestId('message-page')).not.toBeInTheDocument()
    expect(screen.queryByTestId('me-page')).not.toBeInTheDocument()
  })
})
