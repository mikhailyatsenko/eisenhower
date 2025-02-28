export const TextContent = () => {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Welcome to Eisenhower Matrix</h1>
      <p className="mb-4">
        The Eisenhower Matrix is a time management tool that helps you
        prioritize tasks by urgency and importance, sorting out less urgent and
        important tasks which you should either delegate or not spend much time
        on.
      </p>
      <p className="mb-4">
        This application implements the Eisenhower Matrix approach to help you
        optimize your tasks and improve productivity. You can categorize your
        tasks into four quadrants:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>
          <strong>Do First:</strong> Important and Urgent tasks that need
          immediate attention.
        </li>
        <li>
          <strong>Schedule:</strong> Important but Not Urgent tasks that you can
          plan for later.
        </li>
        <li>
          <strong>Delegate:</strong> Not Important but Urgent tasks that you can
          delegate to others.
        </li>
        <li>
          <strong>Eliminate:</strong> Not Important and Not Urgent tasks that
          you can eliminate.
        </li>
      </ul>
      <p className="mb-4">
        Use this tool to manage your tasks effectively and focus on what truly
        matters.
      </p>
    </>
  );
};
