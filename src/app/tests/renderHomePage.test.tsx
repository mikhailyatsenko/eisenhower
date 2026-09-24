import { screen } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

const PHONE_POINTER = '(hover: none) and (pointer: coarse)';
const NARROW = '(max-width: 639px)';

describe('renderHomePage', () => {
  it('mounts the matrix with tasks stored on the device', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    expect(screen.getByText('Pay rent')).toBeInTheDocument();
  });

  it('starts on a desktop with a mouse', async () => {
    await renderHomePage();

    expect(window.matchMedia(PHONE_POINTER).matches).toBe(false);
    expect(window.matchMedia(NARROW).matches).toBe(false);
  });

  it('starts on a phone when asked', async () => {
    await renderHomePage({ viewport: { pointer: 'coarse', width: 375 } });

    expect(window.matchMedia(PHONE_POINTER).matches).toBe(true);
    expect(window.matchMedia(NARROW).matches).toBe(true);
    expect(window.innerWidth).toBe(375);
  });

  it('switches pointer and width mid-test and notifies listeners', async () => {
    const { setViewport } = await renderHomePage();
    const pointer = window.matchMedia(PHONE_POINTER);
    const onChange = jest.fn();
    pointer.addEventListener('change', onChange);

    setViewport({ pointer: 'coarse', width: 375 });

    expect(pointer.matches).toBe(true);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ matches: true }),
    );
    expect(window.matchMedia(NARROW).matches).toBe(true);
  });
});
