'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { TextContent } from '../components/textContent';

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
      <Modal
        onClose={() => setIsShowModal(false)}
        width="2xl"
        className="!max-w-3xl overflow-hidden border-none"
      >
        <div className="animate-from-bottom-appear relative z-2 w-full overflow-y-auto text-center">
          <div className="rounded-2xl bg-white/70 shadow-2xl backdrop-blur-xl sm:p-10 dark:bg-gray-900/70">
            <TextContent />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <button
                onClick={() => setIsShowModal(false)}
                className="cursor-pointer rounded-xl bg-amber-500 px-10 py-3.5 text-sm font-black tracking-wide text-white transition-all hover:bg-amber-600 hover:shadow-lg active:scale-95 sm:text-base"
              >
                GET STARTED
              </button>
              <button
                onClick={handleDontShowAgain}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-bold text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline sm:text-base dark:text-gray-400 dark:hover:text-gray-100"
              >
                Don&apos;t Show This Again
              </button>
            </div>
          </div>
        </div>
      </Modal>
    )
  );
};
