'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/api/auth';
import { AddTasksDialog } from '../components/AddTasksDialog';
import { forgetMigrationRefusalOnSignOut, startMigration } from '../model';
import type { MigrationQuestion } from '../types';

interface MigrationProps {
  /** Where the focus goes once the question is answered: the account button */
  restoreFocus: () => void;
}

/**
 * Moves the device's Matrix to the cloud when a user signs in, asking first
 * if the account has tasks of its own. Sign out, here or in another tab,
 * erases a refusal: the next sign-in offers the move again.
 */
export const Migration = ({ restoreFocus }: MigrationProps) => {
  const { user } = useAuth();
  const uid = user?.uid;
  const [question, setQuestion] = useState<MigrationQuestion | null>(null);

  useEffect(() => {
    if (!uid) return;
    const stop = startMigration(uid, setQuestion);
    return () => {
      stop();
      setQuestion(null);
      forgetMigrationRefusalOnSignOut();
    };
  }, [uid]);

  if (!question) return null;

  return (
    <AddTasksDialog
      count={question.count}
      onAdd={() => {
        setQuestion(null);
        question.add();
      }}
      onDontAdd={() => {
        setQuestion(null);
        question.refuse();
      }}
      restoreFocus={restoreFocus}
    />
  );
};
