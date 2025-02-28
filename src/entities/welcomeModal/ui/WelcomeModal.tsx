'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { CardsOnBackground } from './CardsOnBackground';
import { TextContent } from './TextContent';

export const WelcomeModal = () => {
  const [isShowModal, setIsShowModal] = useState(true);

  const handleDontShowAgain = () => {
    localStorage.setItem('dontShowPopup', 'true');
    setIsShowModal(false);
  };

  useEffect(() => {
    setIsShowModal(!localStorage.getItem('dontShowPopup'));
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
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsShowModal(false)}
              className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Get Started
            </button>
            <button
              onClick={handleDontShowAgain}
              className="mt-4 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
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
