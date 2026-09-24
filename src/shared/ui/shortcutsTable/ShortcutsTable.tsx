export interface Shortcut {
  /** Keys that do the same thing, each shown on its own */
  keys: string[];
  action: string;
}

interface ShortcutsTableProps {
  shortcuts: Shortcut[];
}

/** Keys and what they do, one row per action. Renders on the server too. */
export const ShortcutsTable = ({ shortcuts }: ShortcutsTableProps) => (
  <table className="w-full text-left text-sm">
    <thead className="sr-only">
      <tr>
        <th scope="col">Keys</th>
        <th scope="col">Action</th>
      </tr>
    </thead>
    <tbody>
      {shortcuts.map(({ keys, action }) => (
        <tr
          key={keys.join()}
          className="border-t border-gray-200 dark:border-gray-700"
        >
          <th
            scope="row"
            className="py-2 pr-4 align-top font-normal whitespace-nowrap"
          >
            {keys.map((key, index) => (
              <span key={key}>
                {index > 0 && (
                  <span className="mx-1 text-gray-600 dark:text-gray-400">
                    or
                  </span>
                )}
                <kbd className="rounded border border-gray-300 bg-white px-1.5 py-0.5 font-sans text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                  {key}
                </kbd>
              </span>
            ))}
          </th>
          <td className="py-2 text-gray-700 dark:text-gray-300">{action}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
