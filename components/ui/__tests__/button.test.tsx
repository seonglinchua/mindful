import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('should render children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply default variant styles', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-primary');
  });

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-secondary');
  });

  it('should apply outline variant styles', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('border');
  });

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('hover:bg-muted');
  });

  it('should apply small size styles', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-9');
  });

  it('should apply large size styles', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-11');
  });

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('should pass through HTML button attributes', () => {
    render(<Button type="submit" name="test-button">Submit Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'test-button');
  });
});
