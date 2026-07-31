import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessagePage from './MessagePage';
import '@testing-library/jest-dom';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe('MessagePage', () => {
  beforeEach(() => {
    // Reset body classes before each test
    document.body.className = '';
  });

  it('renders chat list initially', () => {
    render(<MessagePage />);

    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Hawa Team')).toBeInTheDocument();
    expect(screen.getByText('Hawa System')).toBeInTheDocument();
  });

  it('calls onChatOpen callback with true when chat is selected, false when unselected', () => {
    const onChatOpen = vi.fn();
    render(<MessagePage onChatOpen={onChatOpen} />);

    // Initially null, onChatOpen(false) should be called
    expect(onChatOpen).toHaveBeenCalledWith(false);

    // Click a chat
    fireEvent.click(screen.getByText('Hawa Team'));
    expect(onChatOpen).toHaveBeenCalledWith(true);

    // Click back button (using arrow-left icon)
    // We can query by role since it's a button
    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);
    expect(onChatOpen).toHaveBeenCalledWith(false);
  });

  it('adds hide-bottom-bars class when no chat is active, removes it when active', () => {
    render(<MessagePage />);

    // initially activeChat is null, body should have hide-bottom-bars
    expect(document.body.classList.contains('hide-bottom-bars')).toBe(true);

    // Click a chat
    fireEvent.click(screen.getByText('Hawa Team'));

    // Now activeChat is not null, body should NOT have hide-bottom-bars
    expect(document.body.classList.contains('hide-bottom-bars')).toBe(false);
  });

  it('shows chat header and empty state when a chat is selected', () => {
    render(<MessagePage />);

    fireEvent.click(screen.getByText('Hawa Team'));

    // The header with chat name should be visible
    const chatNames = screen.getAllByText('Hawa Team');
    expect(chatNames.length).toBeGreaterThan(0);

    // Should show "No messages yet"
    expect(screen.getByText('No messages yet')).toBeInTheDocument();

    // Back button should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
