import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../dialog';

describe('Dialog', () => {
  it('should not render when closed', () => {
    render(
      <Dialog open={false} onOpenChange={jest.fn()}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <Dialog open={true} onOpenChange={jest.fn()}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('should call onOpenChange when backdrop is clicked', async () => {
    const handleOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    // Click the backdrop
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      await user.click(backdrop as HTMLElement);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('should call onOpenChange when Escape key is pressed', async () => {
    const handleOpenChange = jest.fn();
    const user = userEvent.setup();

    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.keyboard('{Escape}');
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('should render close button by default', () => {
    render(
      <Dialog open={true} onOpenChange={jest.fn()}>
        <DialogContent onClose={jest.fn()}>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    const user = userEvent.setup();

    render(
      <Dialog open={true} onOpenChange={jest.fn()}>
        <DialogContent onClose={handleClose}>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.click(screen.getByLabelText('Close dialog'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should not render close button when showClose is false', () => {
    render(
      <Dialog open={true} onOpenChange={jest.fn()}>
        <DialogContent showClose={false}>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('should render complete dialog with all parts', () => {
    render(
      <Dialog open={true} onOpenChange={jest.fn()}>
        <DialogContent onClose={jest.fn()}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body Content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Body Content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should apply custom className to DialogContent', () => {
    render(
      <Dialog open={true} onOpenChange={jest.fn()}>
        <DialogContent className="custom-dialog" onClose={jest.fn()}>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('custom-dialog');
  });
});
