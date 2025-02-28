'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { CardsOnBackground } from './CardsOnBackground';
import { TextContent } from './TextContent';

export const WelcomeModal = () => {
  const [isShowModal, setIsShowModal] = useState(false);

  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowPopup', 'true');
    setIsShowModal(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowModal(!localStorage.getItem('dontShowPopup'));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    isShowModal && (
      <Modal onClose={() => setIsShowModal(false)}>
        {/* <div className="flex items-center"> */}
        {/* <div className="relative h-60 w-1/4"> */}
        <div className="absolute z-1">
          <CardsOnBackground />
        </div>
        {/* </div> */}
        {/* <div className="w-3/4 overflow-scroll text-left"> */}
        <div className="animate-from-bottom-appear relative z-2 p-6 text-center opacity-0 [animation-delay:_0.5s]">
          <TextContent />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-6">
            <button
              onClick={() => setIsShowModal(false)}
              className="hover:text-foreground cursor-pointer rounded bg-amber-500 px-4 py-2 text-sm text-nowrap text-white hover:bg-amber-600 sm:text-base"
            >
              Get Started
            </button>
            <button
              onClick={handleDontShowAgain}
              className="text-foreground/80 hover:text-foreground cursor-pointer rounded text-sm font-bold text-nowrap sm:text-base"
            >
              Don&apos;t Show This Again
            </button>
          </div>
        </div>
        {/* </div> */}
        {/* </div> */}
      </Modal>
    )
  );
};
