import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusPing from '../../components/articles/visuals/atoms/StatusPing';

describe('StatusPing', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<StatusPing />);
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
    expect(container.querySelector('.bg-emerald-400')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<StatusPing color="rose" />);
    expect(container.querySelector('.bg-rose-500')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(<StatusPing size="sm" />);
    expect(container.firstChild).toHaveClass('w-1.5');
  });
});
