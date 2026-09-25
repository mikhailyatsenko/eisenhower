import Link from 'next/link';

import {
  ADD_HINT,
  DRAG_HINT,
  MATRIX_SHORTCUTS,
} from '@/shared/consts/matrixShortcuts';
import { MATRIX_KEYS, MatrixKey, QUADRANTS } from '@/shared/consts/quadrants';
import { ShortcutsTable } from '@/shared/ui/shortcutsTable';

// What to do with a task in each quadrant
const QUADRANT_DESCRIPTIONS: Record<MatrixKey, string> = {
  ImportantUrgent: 'Tasks that need your immediate attention.',
  ImportantNotUrgent:
    'Tasks that move your goals forward. Plan a time for them.',
  NotImportantUrgent:
    'Tasks that need doing soon but not by you. Hand them off.',
  NotImportantNotUrgent: "Tasks that aren't worth your time. Drop them.",
};

const QUADRANT_DOTS: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-500',
  ImportantNotUrgent: 'bg-yellow-500',
  NotImportantUrgent: 'bg-blue-500',
  NotImportantNotUrgent: 'bg-green-500',
};

const FAQ = [
  {
    question: 'Where are my tasks stored?',
    answer:
      'Without an account, tasks are saved in this browser on this device. Clearing the site data removes them. After you sign in with Google, you can keep tasks in the cloud and see them on any device.',
  },
  {
    question: 'Is it free?',
    answer: 'Yes. There is no sign-up and no subscription.',
  },
  {
    question: 'How is urgent different from important?',
    answer:
      'Urgent tasks demand attention now, because of a deadline or someone waiting. Important tasks move your goals forward. A task can be either, both or neither.',
  },
  {
    question: 'What if everything feels urgent and important?',
    answer:
      'Ask what happens if a task waits a week. If nothing bad happens, it goes to Schedule. If someone else can do it, it goes to Delegate.',
  },
];

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section aria-labelledby={id} className="mb-10">
    <h2 id={id} className="mb-4 text-2xl font-semibold">
      {title}
    </h2>
    <div className="space-y-3 text-gray-700 dark:text-gray-300">{children}</div>
  </section>
);

// Server component: the whole text is in the HTML for readers and search
export const EisenhowerMatrixPage = () => (
  <article className="relative z-[1] mx-auto w-[calc(100%-48px)] py-12 lg:w-2/3">
    <h1 className="mb-8 text-4xl font-bold">
      The Eisenhower Matrix: prioritize tasks by urgency and importance
    </h1>

    <Section id="what-is-it" title="What is the Eisenhower Matrix?">
      <p>
        The Eisenhower Matrix is a time management tool that helps you
        prioritize tasks by urgency and importance. It sorts out the less urgent
        and important tasks, which you should either delegate or not spend much
        time on.
      </p>
      <p>
        Every task answers two questions: is it important, and is it urgent? The
        answers put it into one of four quadrants, and each quadrant tells you
        what to do with the task. Use it to manage your tasks effectively and
        focus on what truly matters.
      </p>
    </Section>

    <Section id="quadrants" title="The four quadrants">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MATRIX_KEYS.map((key) => (
          <li
            key={key}
            className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${QUADRANT_DOTS[key]}`}
              />
              {QUADRANTS[key].title}
            </h3>
            <p className="text-sm font-medium">{QUADRANTS[key].criteria}</p>
            <p className="mt-2">{QUADRANT_DESCRIPTIONS[key]}</p>
            <p className="mt-2 text-sm italic">{QUADRANTS[key].examples}</p>
          </li>
        ))}
      </ul>
      <p>
        <strong>Keep the balance:</strong> watch that Do First doesn&apos;t grow
        and Schedule doesn&apos;t run empty. A full Do First means you are
        putting out fires; time spent on Schedule is what keeps them from
        starting.
      </p>
    </Section>

    <Section id="how-to-use" title="How to use the app">
      <ul className="list-disc space-y-2 pl-5">
        <li>
          {ADD_HINT} The digits stand for the quadrants:{' '}
          {MATRIX_KEYS.map(
            (key) => `${QUADRANTS[key].shortcut} for ${QUADRANTS[key].title}`,
          ).join(', ')}
          .
        </li>
        <li>
          Click or tap a task to select it. To clear the selection, click it
          again, click any empty spot on the page, press the × in the action
          panel or press Esc.
        </li>
        <li>
          While a task is selected, the action panel at the bottom of the window
          shows what you can do with it: Complete, Edit, Move to one of the
          other quadrants, and Delete. After Complete, Delete or Move, the next
          task in the quadrant is selected, so you can keep going.
        </li>
        <li>
          Changed your mind? Press Undo in the message that follows an action,
          or Ctrl+Z (Cmd+Z on a Mac).
        </li>
        <li>{DRAG_HINT}.</li>
        <li>
          Completed tasks are listed below the matrix, where you can restore
          them or delete them permanently.
        </li>
        <li>
          Switch between the matrix and a single list with the button at the top
          of the page.
        </li>
      </ul>
      <h3 className="pt-2 font-semibold text-gray-900 dark:text-gray-100">
        On a phone
      </h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          All four quadrants fit on one screen. Tap a quadrant&apos;s title to
          open it full screen, and Back to matrix to see all four again.
        </li>
        <li>
          Tap a task to select it. The panel at the bottom of the screen has
          Complete, Edit and Delete, and under them Move to, laid out as a small
          matrix: tap the quadrant the task should go to. Tap the × next to the
          task&apos;s text, the task again or any empty spot to close the panel.
        </li>
        <li>
          To drag a task, press and hold it until it lifts, then move it to
          another place or quadrant.
        </li>
      </ul>
      <h3 className="pt-2 font-semibold text-gray-900 dark:text-gray-100">
        Keyboard
      </h3>
      <p>
        The whole matrix is one Tab stop: Tab takes you to the task you last
        selected, or to the first one; in an empty matrix, to Add a task in Do
        First. From there the keys below work. In the app, press ? to see them.
      </p>
      <ShortcutsTable shortcuts={MATRIX_SHORTCUTS} />
    </Section>

    <Section id="no-sign-up" title="No sign-up needed">
      <p>
        No sign-up: tasks stay in this browser; sign in with Google to sync.
      </p>
    </Section>

    <Section id="faq" title="FAQ">
      {FAQ.map(({ question, answer }) => (
        <div key={question}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {question}
          </h3>
          <p>{answer}</p>
        </div>
      ))}
    </Section>

    <Link
      href="/"
      className="inline-block rounded-lg bg-amber-700 px-6 py-3 font-semibold text-white hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
    >
      Open the matrix
    </Link>
  </article>
);
