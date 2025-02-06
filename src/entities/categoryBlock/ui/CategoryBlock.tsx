// Enum for Quadrants
export enum QuadrantPriority {
  UrgentImportant = 'Urgent & Important',
  ImportantNotUrgent = 'Important & Not Urgent',
  UrgentNotImportant = 'Urgent & Not Important',
  NotUrgentNotImportant = 'Not Urgent & Not Important',
}

// Colors for each quadrant
const priorityColorClasses: Record<string, string> = {
  [QuadrantPriority.UrgentImportant]: 'bg-red-500',
  [QuadrantPriority.ImportantNotUrgent]: 'bg-yellow-500',
  [QuadrantPriority.UrgentNotImportant]: 'bg-blue-500',
  [QuadrantPriority.NotUrgentNotImportant]: 'bg-green-500',
};

// CategoryBlock Component
interface CategoryBlockProps {
  title: string;
  priority: QuadrantPriority;
  tasks: string[];
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  title,
  priority,
  tasks,
}) => {
  return (
    <div
      className={`${priorityColorClasses[priority]} rounded-2xl p-6 text-white shadow-lg`}
    >
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <ul className="list-disc pl-4">
        {tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </div>
  );
};
