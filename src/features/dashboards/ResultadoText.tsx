import { useState } from 'react';

/* interface ResultadoTextProps {
  tituloHeader?: string;
  destaqueTexto?: string;
  oportunidadeTexto?: string;
  analiseTexto?: string[];
} */
export const ResultadoText: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };
  return (
    <div>
      {/*HEADER*/}
      <div className="bg-brand mx-auto w-full rounded-xl p-4">
        <button
          type="button"
          onClick={toggleAccordion}
          className="flex w-full cursor-pointer items-center gap-2 px-1 py-2 text-left"
          aria-expanded={isOpen}
        >
          <svg
            className={`bg-brand h-5 w-5 transition-transform duration-200 ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <h2 className="bg-brand text-xl font-bold">Resumo CREED.ai</h2>
        </button>
      </div>
      <div>
        {/*COLUNA ESQUERDA*/}
        <div className="mx-auto flex w-full rounded-xl p-4">
          <h2>Destaque</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio magni
            quis distinctio quas at illo nam porro amet
          </p>
        </div>
      </div>
    </div>
  );
};
