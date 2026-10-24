import React, { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TurnstileWidgetHandle } from '../../utils/turnstile';

const renderInvisibleTurnstile = vi.fn();
const getTurnstileToken = vi.fn();
const removeTurnstile = vi.fn();
vi.mock('../../utils/turnstile', () => ({
  renderInvisibleTurnstile: (...a: unknown[]) => renderInvisibleTurnstile(...a),
  getTurnstileToken: (...a: unknown[]) => getTurnstileToken(...a),
  removeTurnstile: (...a: unknown[]) => removeTurnstile(...a),
}));

import TurnstileWidget from '../../components/features/contact/TurnstileWidget';

beforeEach(() => {
  renderInvisibleTurnstile.mockReset();
  getTurnstileToken.mockReset();
  removeTurnstile.mockReset();
});

describe('TurnstileWidget', () => {
  it('bez defer: renderuje widget przy montowaniu (jak dotąd)', async () => {
    renderInvisibleTurnstile.mockResolvedValue('w1');
    getTurnstileToken.mockResolvedValue('tok');
    const ref = createRef<TurnstileWidgetHandle>();
    render(<TurnstileWidget ref={ref} siteKey="k" />);
    expect(renderInvisibleTurnstile).toHaveBeenCalledTimes(1);
    await expect(ref.current!.getToken()).resolves.toBe('tok');
    expect(getTurnstileToken).toHaveBeenCalledWith('w1');
  });

  it('defer: nic nie ładuje przy montowaniu; prepare() startuje raz', async () => {
    renderInvisibleTurnstile.mockResolvedValue('w1');
    const ref = createRef<TurnstileWidgetHandle>();
    render(<TurnstileWidget ref={ref} siteKey="k" defer />);
    expect(renderInvisibleTurnstile).not.toHaveBeenCalled();
    await act(async () => {
      ref.current!.prepare!();
      ref.current!.prepare!();
    });
    expect(renderInvisibleTurnstile).toHaveBeenCalledTimes(1);
  });

  it('defer: getToken() bez wcześniejszego prepare() czeka na skrypt i zwraca token', async () => {
    let resolveRender: (id: string) => void = () => undefined;
    renderInvisibleTurnstile.mockReturnValue(new Promise<string>((r) => (resolveRender = r)));
    getTurnstileToken.mockResolvedValue('tok');
    const ref = createRef<TurnstileWidgetHandle>();
    render(<TurnstileWidget ref={ref} siteKey="k" defer />);
    const token = ref.current!.getToken();
    expect(getTurnstileToken).not.toHaveBeenCalled();
    resolveRender('w9');
    await expect(token).resolves.toBe('tok');
    expect(getTurnstileToken).toHaveBeenCalledWith('w9');
  });

  it('defer: awaria loadera → TURNSTILE_NOT_READY, kolejna próba ładuje ponownie', async () => {
    renderInvisibleTurnstile
      .mockRejectedValueOnce(new Error('TURNSTILE_SCRIPT_ERROR'))
      .mockResolvedValueOnce('w2');
    getTurnstileToken.mockResolvedValue('tok');
    const ref = createRef<TurnstileWidgetHandle>();
    render(<TurnstileWidget ref={ref} siteKey="k" defer />);
    await expect(ref.current!.getToken()).rejects.toThrow('TURNSTILE_NOT_READY');
    await expect(ref.current!.getToken()).resolves.toBe('tok');
    expect(renderInvisibleTurnstile).toHaveBeenCalledTimes(2);
  });

  it('odmontowanie usuwa wyrenderowany widget', async () => {
    renderInvisibleTurnstile.mockResolvedValue('w1');
    const ref = createRef<TurnstileWidgetHandle>();
    const { unmount } = render(<TurnstileWidget ref={ref} siteKey="k" />);
    await act(async () => undefined);
    unmount();
    expect(removeTurnstile).toHaveBeenCalledWith('w1');
  });
});
