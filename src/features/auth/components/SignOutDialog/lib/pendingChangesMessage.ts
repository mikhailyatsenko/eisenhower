/**
 * What signing out would lose. `count` is this session's unconfirmed writes,
 * null when the changes are left from an earlier visit and can't be counted.
 */
export const pendingChangesMessage = (count: number | null) => {
  if (count === 1) {
    return "1 change isn't saved to your account yet. If you sign out now, it'll be lost.";
  }
  const changes = count === null ? 'Some changes' : `${count} changes`;
  return `${changes} aren't saved to your account yet. If you sign out now, they'll be lost.`;
};
