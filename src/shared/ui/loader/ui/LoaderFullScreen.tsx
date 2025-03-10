import cls from './Loader.module.css';

export const LoaderFullScreen = () => {
  return (
    <div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-black/50">
      <div className={cls.loader}></div>
    </div>
  );
};
