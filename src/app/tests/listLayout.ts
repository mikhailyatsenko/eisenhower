interface ListLayout {
  /** Visible height of every quadrant list, px */
  listHeight: number;
  /** Height of every task card; cards stack without gaps, px */
  rowHeight: number;
}

/**
 * jsdom doesn't lay out: every size is 0 and nothing scrolls. This gives each
 * quadrant list (`listbox`) a fixed height and each task (`option`) a row, and
 * makes `scrollTop` and `scrollTo` move the list and fire `scroll`.
 * Returns a function that puts jsdom back.
 */
export const mockListLayout = ({ listHeight, rowHeight }: ListLayout) => {
  const scrollTops = new WeakMap<Element, number>();
  const originals: {
    target: object;
    name: string;
    descriptor: PropertyDescriptor | undefined;
  }[] = [];

  const isList = (el: Element) => el.getAttribute('role') === 'listbox';
  const isTask = (el: Element) => el.getAttribute('role') === 'option';
  const tasksOf = (list: Element) =>
    Array.from(list.querySelectorAll('[role="option"]'));
  const maxScroll = (list: Element) =>
    Math.max(0, tasksOf(list).length * rowHeight - listHeight);

  const override = (
    target: object,
    name: string,
    descriptor: PropertyDescriptor,
  ) => {
    originals.push({
      target,
      name,
      descriptor: Object.getOwnPropertyDescriptor(target, name),
    });
    Object.defineProperty(target, name, { configurable: true, ...descriptor });
  };

  // jsdom's own value for anything that isn't a list or a task
  const original = (name: string, el: Element) =>
    originals.find((entry) => entry.name === name)?.descriptor?.get?.call(el) ??
    0;

  const setScrollTop = (list: Element, top: number) => {
    scrollTops.set(list, Math.min(Math.max(0, top), maxScroll(list)));
    list.dispatchEvent(new Event('scroll'));
  };

  const proto = HTMLElement.prototype;
  override(proto, 'clientHeight', {
    get(this: HTMLElement) {
      return isList(this) ? listHeight : original('clientHeight', this);
    },
  });
  override(proto, 'scrollHeight', {
    get(this: HTMLElement) {
      return isList(this)
        ? tasksOf(this).length * rowHeight
        : original('scrollHeight', this);
    },
  });
  override(Element.prototype, 'scrollTop', {
    get(this: Element) {
      return scrollTops.get(this) ?? 0;
    },
    set(this: Element, top: number) {
      if (isList(this)) setScrollTop(this, top);
    },
  });
  override(proto, 'offsetTop', {
    get(this: HTMLElement) {
      const list = this.closest('[role="listbox"]');
      if (!isTask(this) || !list) return original('offsetTop', this);
      return tasksOf(list).indexOf(this) * rowHeight;
    },
  });
  override(proto, 'offsetHeight', {
    get(this: HTMLElement) {
      if (isTask(this)) return rowHeight;
      return isList(this) ? listHeight : original('offsetHeight', this);
    },
  });
  override(Element.prototype, 'scrollTo', {
    value(this: Element, options: ScrollToOptions) {
      setScrollTop(this, options.top ?? 0);
    },
  });

  return () => {
    originals.forEach(({ target, name, descriptor }) => {
      if (descriptor) Object.defineProperty(target, name, descriptor);
      else delete (target as Record<string, unknown>)[name];
    });
  };
};
