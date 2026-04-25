import cls from './Loader.module.css';

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return <div className={`${cls.loader} ${className || ''}`}></div>;
};
