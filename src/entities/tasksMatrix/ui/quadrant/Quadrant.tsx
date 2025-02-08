import { TaskPriorityKey } from '../../model/types/quadrantTypes';

interface CategoryBlockProps {
  title: string;
  priority: TaskPriorityKey;
  task: string[];
}

export const priorityColorClasses: Record<TaskPriorityKey, string> = {
  ImportantUrgent: 'bg-red-200',
  ImportantNotUrgent: 'bg-yellow-200',
  NotImportantUrgent: 'bg-blue-200',
  NotImportantNotUrgent: 'bg-green-200',
};

export const Quadrant: React.FC<CategoryBlockProps> = ({
  title,
  priority,
  task,
}) => {
  return (
    <div
      className={`${priorityColorClasses[priority]} rounded-2xl p-6 text-white shadow-lg`}
    >
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <ul className="list-disc pl-4">
        {task.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </div>
  );
};
