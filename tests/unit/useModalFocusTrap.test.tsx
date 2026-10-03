import { fireEvent, render, screen } from '@testing-library/react';
import React, { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';

function TrapFixture({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap({ modalRef, isOpen, onClose });
  if (!isOpen) return null;
  return (
    <div ref={modalRef} role="dialog">
      <button type="button">First</button>
      <button type="button">Last</button>
    </div>
  );
}

describe('useModalFocusTrap', () => {
  it('invokes onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<TrapFixture isOpen onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab focus from last to first element', () => {
    render(<TrapFixture isOpen onClose={vi.fn()} />);
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });

    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });

    expect(document.activeElement).toBe(first);
  });
});
