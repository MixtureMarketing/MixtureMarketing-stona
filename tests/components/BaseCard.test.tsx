import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BaseCard from '../../components/common/BaseCard';

describe('BaseCard', () => {
  it('renders children correctly', () => {
    render(<BaseCard>Test Content</BaseCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { container } = render(<BaseCard variant="glass">Glass Content</BaseCard>);
    expect(container.firstChild).toHaveClass('backdrop-blur-md');
  });

  it('applies hover effects when specified', () => {
    const { container } = render(<BaseCard hover="lift">Hover Content</BaseCard>);
    expect(container.firstChild).toHaveClass('hover:-translate-y-1');
  });

  it('supports custom padding', () => {
    const { container } = render(<BaseCard padding="lg">Large Padding</BaseCard>);
    expect(container.firstChild).toHaveClass('p-8');
  });
});
