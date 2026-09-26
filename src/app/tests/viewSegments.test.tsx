import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const views = () =>
  within(screen.getByRole('banner')).getByRole('tablist', { name: 'View' });
const tab = (name: 'Matrix' | 'List') =>
  within(views()).getByRole('tab', { name });
const viewPanel = () => screen.getByRole('tabpanel');

describe('View segments', () => {
  it('are the tabs "Matrix" and "List" in the header, Matrix selected', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    expect(
      within(views())
        .getAllByRole('tab')
        .map((view) => view.textContent),
    ).toEqual(['Matrix', 'List']);
    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
    expect(tab('List')).toHaveAttribute('aria-selected', 'false');
  });

  it('control the view area, named by the selected tab, with the matrix in it', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    const panel = screen.getByRole('tabpanel', { name: 'Matrix' });
    expect(tab('Matrix')).toHaveAttribute('aria-controls', panel.id);
    expect(tab('List')).toHaveAttribute('aria-controls', panel.id);
    expect(
      within(panel).getByRole('group', { name: 'Task matrix' }),
    ).toBeInTheDocument();
  });

  it('→ selects List and shows List view, ← brings the matrix back', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Pay rent'] },
    });

    tab('Matrix').focus();
    await user.keyboard('{ArrowRight}');

    expect(tab('List')).toHaveAttribute('aria-selected', 'true');
    expect(tab('List')).toHaveFocus();
    expect(viewPanel()).toHaveAccessibleName('List');
    expect(
      within(viewPanel()).getByRole('button', { name: 'Do First, 1 task' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(viewPanel()).getByRole('option', { name: 'Pay rent' }),
    ).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');

    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Matrix')).toHaveFocus();
    expect(viewPanel()).toHaveAccessibleName('Matrix');
    expect(within(viewPanel()).getAllByRole('listbox').length).toBeGreaterThan(
      0,
    );
    expect(
      within(viewPanel()).queryByRole('button', { name: 'Do First, 1 task' }),
    ).not.toBeInTheDocument();
  });

  it('wrap around with the arrows', async () => {
    const { user } = await renderHomePage();

    tab('Matrix').focus();
    await user.keyboard('{ArrowLeft}');

    expect(tab('List')).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');

    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
  });

  it('switch the view on a click', async () => {
    const { user } = await renderHomePage();

    await user.click(tab('List'));

    expect(tab('List')).toHaveAttribute('aria-selected', 'true');
    expect(viewPanel()).toHaveAccessibleName('List');
  });

  it('put only the selected tab in the Tab order', async () => {
    const { user } = await renderHomePage();

    expect(tab('Matrix')).toHaveAttribute('tabindex', '0');
    expect(tab('List')).toHaveAttribute('tabindex', '-1');

    await user.click(tab('List'));

    expect(tab('Matrix')).toHaveAttribute('tabindex', '-1');
    expect(tab('List')).toHaveAttribute('tabindex', '0');

    // Tab from the selected one leaves the tabs
    tab('List').focus();
    await user.tab();
    expect(tab('Matrix')).not.toHaveFocus();
    expect(views()).not.toContainElement(document.activeElement as HTMLElement);
  });

  it('control an area that is there while the account loads', async () => {
    await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { deviceCache: 'empty', network: 'stalled' },
    });

    expect(
      screen.queryByRole('group', { name: 'Task matrix' }),
    ).not.toBeInTheDocument();
    expect(viewPanel()).toHaveAccessibleName('Matrix');
    expect(tab('Matrix')).toHaveAttribute('aria-controls', viewPanel().id);
  });

  it('scroll the page to the top at once on a switch', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Pay rent'] },
    });
    const scrollTo = jest.spyOn(window, 'scrollTo');

    await user.click(tab('List'));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });

    await user.keyboard('{ArrowLeft}');

    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
  });

  it('drop the selection and close the add field on a switch', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Pay rent'] },
    });

    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    expect(screen.getByRole('toolbar')).toBeInTheDocument();

    await user.click(tab('List'));

    expect(screen.getByRole('option', { name: 'Pay rent' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Add a task to Do First' }),
    );
    await user.keyboard('Call mom');
    expect(
      screen.getByRole('textbox', { name: 'Add task to Do First' }),
    ).toHaveValue('Call mom');

    await user.click(tab('Matrix'));

    expect(
      screen.queryByRole('textbox', { name: 'Add task to Do First' }),
    ).not.toBeInTheDocument();
  });

  it("don't scroll on a click on the selected tab", async () => {
    const { user } = await renderHomePage();
    const scrollTo = jest.spyOn(window, 'scrollTo');

    await user.click(tab('Matrix'));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  describe('with List stored on the device', () => {
    // The matrix's axis labels: List view has none
    const isMatrix = (node: Node) =>
      node instanceof Element && /Not Urgent/.test(node.textContent ?? '');

    const openStoredList = async () => {
      const page = await renderHomePage({
        tasks: { ImportantUrgent: ['Pay rent'] },
      });
      await page.user.click(tab('List'));
      const rendered: Node[] = [];
      const observer = new MutationObserver((records) =>
        records.forEach((record) => rendered.push(...record.addedNodes)),
      );
      observer.observe(document.body, { childList: true, subtree: true });
      const consoleError = jest.spyOn(console, 'error');
      const serverHtml = await page.reloadFromServer();
      rendered.push(
        ...observer.takeRecords().flatMap((r) => [...r.addedNodes]),
      );
      observer.disconnect();
      return { serverHtml, rendered, consoleError };
    };

    it('shows a loader and no selected tab until the store is read', async () => {
      const { serverHtml } = await openStoredList();

      const serverTabs = within(serverHtml).getAllByRole('tab');
      expect(serverTabs.map((view) => view.textContent)).toEqual([
        'Matrix',
        'List',
      ]);
      serverTabs.forEach((view) =>
        expect(view).toHaveAttribute('aria-selected', 'false'),
      );
      const serverPanel = within(serverHtml).getByRole('tabpanel');
      expect(within(serverPanel).getByRole('status')).toHaveTextContent(
        'Loading',
      );
      expect(serverTabs[0]).toHaveAttribute('aria-controls', serverPanel.id);
      expect(
        within(serverHtml).queryByRole('group', { name: 'Task matrix' }),
      ).not.toBeInTheDocument();
      expect(serverHtml).not.toHaveTextContent('Not Urgent');
    });

    it('opens List view at once, never the matrix, with no hydration error', async () => {
      const { rendered, consoleError } = await openStoredList();

      expect(tab('List')).toHaveAttribute('aria-selected', 'true');
      expect(tab('Matrix')).toHaveAttribute('aria-selected', 'false');
      expect(viewPanel()).toHaveAccessibleName('List');
      expect(
        within(viewPanel()).getByRole('button', { name: 'Do First, 1 task' }),
      ).toBeInTheDocument();
      expect(rendered.some(isMatrix)).toBe(false);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('has no axe violations while the loader shows', async () => {
      const { serverHtml } = await openStoredList();

      // Only the server's HTML on the page, as before hydration
      document.body.replaceChildren(serverHtml);

      const results = await axe(serverHtml);
      serverHtml.remove();
      expect(results).toHaveNoViolations();
    });
  });

  it('has no axe violations', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
