import {
  priorityColorClasses,
  QuadrantPriority,
} from '../model/consts/quadrantConsts';
import { QuadrantPriorityKey } from '../model/types/quadrantTypes';

interface CategoryBlockProps {
  title: string;
  priority: QuadrantPriorityKey;
  tasks: string[];
}

export const Quadrant: React.FC<CategoryBlockProps> = ({
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
export { QuadrantPriority };
