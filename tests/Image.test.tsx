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

  it('obraz z /assets/images dostaje srcset wariantów szerokości + sizes', () => {
    const { container } = render(<Image src="/assets/images/CDN.png" alt="cdn" sizes="80px" />);
    const avif = container.querySelector('source[type="image/avif"]')!;
    const webp = container.querySelector('source[type="image/webp"]')!;
    expect(avif.getAttribute('srcset')).toBe(
      '/assets/images/CDN-480.avif 480w, /assets/images/CDN-960.avif 960w, /assets/images/CDN-1600.avif 1600w',
    );
    expect(webp.getAttribute('srcset')).toContain('/assets/images/CDN-960.webp 960w');
    expect(avif.getAttribute('sizes')).toBe('80px');
  });

  it('znana szerokość slotu → domyślny sizes; inne lokalne obrazy bez wariantów', () => {
    const { container } = render(
      <>
        <Image src="/assets/images/CDN.png" alt="cdn" width={600} height={400} />
        <Image src="/assets/team/osoba.png" alt="osoba" />
      </>,
    );
    const sources = container.querySelectorAll('source[type="image/avif"]');
    expect(sources[0].getAttribute('sizes')).toBe('(max-width: 600px) 100vw, 600px');
    expect(sources[1].getAttribute('srcset')).toBe('/assets/team/osoba.avif');
    expect(sources[1].hasAttribute('sizes')).toBe(false);
  });
});
