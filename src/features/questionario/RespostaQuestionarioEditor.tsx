import { Textarea } from '@/components/ui/textarea';

export type QuestionAnswer = number | string | null;
export type QuestionAnswerType = 'escala' | 'dissertativa';

interface RespostaQuestionarioEditorProps {
  type: QuestionAnswerType;
  value: QuestionAnswer;
  onChange: (value: QuestionAnswer) => void;
  labels: {
    select: string;
    min: string;
    max: string;
    essayPlaceholder: string;
  };
}

export function RespostaQuestionarioEditor({
  type,
  value,
  onChange,
  labels,
}: RespostaQuestionarioEditorProps) {
  if (type === 'dissertativa') {
    return (
      <Textarea
        aria-label={labels.select}
        placeholder={labels.essayPlaceholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
        rows={5}
      />
    );
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{labels.select}</legend>
      <div
        className="grid grid-cols-5 gap-2"
        role="radiogroup"
        aria-label={labels.select}
      >
        {[1, 2, 3, 4, 5].map((option) => (
          <label
            key={option}
            className={`flex h-10 cursor-pointer items-center justify-center rounded-md border text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-ring ${
              value === option
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name="questionnaire-answer"
              value={option}
              checked={value === option}
              onChange={() => {
                onChange(option);
              }}
            />
            {option}
          </label>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{labels.min}</span>
        <span>{labels.max}</span>
      </div>
    </fieldset>
  );
}
