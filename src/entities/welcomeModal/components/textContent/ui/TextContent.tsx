import { WELCOME_MODAL_TEXTS } from '../consts';

export const TextContent = () => {
  return (
    <>
      <h1 className="limitedHeight639:!hidden sm576:block mb-4 hidden text-xl font-bold sm:text-2xl lg:text-3xl">
        {WELCOME_MODAL_TEXTS.TITLE}
      </h1>
      <p className="limitedHeight639:text-sm mb-4 text-sm sm:text-base lg:text-lg">
        <strong>The Eisenhower Matrix</strong> {WELCOME_MODAL_TEXTS.DESCRIPTION}
      </p>
      <p className="limitedHeight639:!hidden sm576:block mb-4 hidden text-sm sm:text-base lg:text-lg">
        {WELCOME_MODAL_TEXTS.ADDITIONAL_INFO}
      </p>
      <ul className="limitedHeight639:text-sm mb-4 list-inside list-disc text-sm sm:text-base lg:text-lg">
        <li>{WELCOME_MODAL_TEXTS.QUADRANTS.DO_FIRST}</li>
        <li>{WELCOME_MODAL_TEXTS.QUADRANTS.SCHEDULE}</li>
        <li>{WELCOME_MODAL_TEXTS.QUADRANTS.DELEGATE}</li>
        <li>{WELCOME_MODAL_TEXTS.QUADRANTS.ELIMINATE}</li>
      </ul>
      <p className="limitedHeight639:text-sm mb-4 text-sm sm:text-base lg:text-lg">
        {WELCOME_MODAL_TEXTS.FINAL_NOTE}
      </p>
    </>
  );
};
