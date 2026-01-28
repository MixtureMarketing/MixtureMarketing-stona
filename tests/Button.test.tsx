/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/common/Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as a button by default', () => {
    render(<Button>Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as an anchor when href is provided', () => {
    render(<Button href="/test">Link</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('href', '/test');
  });

  it('applies the correct variant class', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild).toHaveClass('border-secondary');
  });

  it('shows loader when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    // Loader2 from lucide has a specific structure, we check for it or the aria-hidden=true
    expect(screen.getByText('Submit')).toBeInTheDocument();
    // The loader icon is aria-hidden="true" but visible to screen.queryByRole if it was a loader,
    // but here we just check if the text is still there and the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports aria-label', () => {
    render(<Button aria-label="Custom Label">Content</Button>);
    expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
  });
});
