import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast, showGlobalToast } from '../toast';

// Test component that uses the toast hook
function TestComponent() {
  const { showToast, showConfirm } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Test message', 'info')}>
        Show Toast
      </button>
      <button onClick={() => showToast('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showConfirm('Confirm this?', jest.fn())}>
        Show Confirm
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('should render children', () => {
    render(
      <ToastProvider>
        <div>Test Child</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should throw error when useToast is used outside provider', () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleSpy.mockRestore();
  });
});

describe('Toast functionality', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should show toast with message', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Toast'));

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should show success toast', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should show error toast', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should remove toast when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close notification'));

    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  it('should auto-remove toast after duration', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  it('should show confirmation dialog', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Confirm'));

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Confirm this?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup({ delay: null });

    function ConfirmTestComponent() {
      const { showConfirm } = useToast();
      return (
        <button onClick={() => showConfirm('Confirm?', onConfirm)}>
          Show Confirm
        </button>
      );
    }

    render(
      <ToastProvider>
        <ConfirmTestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Confirm'));
    await user.click(screen.getByText('Confirm'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn();
    const user = userEvent.setup({ delay: null });

    function ConfirmTestComponent() {
      const { showConfirm } = useToast();
      return (
        <button onClick={() => showConfirm('Confirm?', jest.fn(), onCancel)}>
          Show Confirm
        </button>
      );
    }

    render(
      <ToastProvider>
        <ConfirmTestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Confirm'));
    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should display multiple toasts', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Toast'));
    await user.click(screen.getByText('Show Success'));

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });
});
