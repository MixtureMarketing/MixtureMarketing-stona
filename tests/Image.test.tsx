import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Image from '../components/common/Image';

describe('Image Component', () => {
  const testSrc = '/test-image.webp';
  const testAlt = 'Test Alt Text';

  it('renders with correct src and alt', () => {
    render(<Image src={testSrc} alt={testAlt} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', testSrc);
    expect(img).toHaveAttribute('alt', testAlt);
  });

  it('has lazy loading by default', () => {
    render(<Image src={testSrc} alt={testAlt} />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  it('has async decoding by default', () => {
    render(<Image src={testSrc} alt={testAlt} />);
    expect(screen.getByRole('img')).toHaveAttribute('decoding', 'async');
  });

  it('allows overriding loading and decoding', () => {
    render(<Image src={testSrc} alt={testAlt} loading="eager" decoding="sync" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('decoding', 'sync');
  });

  it('applies custom className', () => {
    const customClass = 'custom-style';
    render(<Image src={testSrc} alt={testAlt} className={customClass} />);
    expect(screen.getByRole('img')).toHaveClass(customClass);
  });
});
