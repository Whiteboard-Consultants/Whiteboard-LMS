import { riasecQuestions } from '@/lib/riasec-data';
import {
  bgesCareerStageOptions,
  bgesFuturePlansOptions,
  bgesGraduationProgramOptions,
  bgesHigherStudiesFocusOptions,
  type BgesPreQuizFormData,
} from '@/lib/schemas/bges-pre-quiz';

export type RiasecResponses = Record<string, unknown> | null | undefined;

export type BgesPreQuizDisplay = {
  firstName?: string;
  lastName?: string;
  email?: string;
  whatsappNumber?: string;
  careerStage?: string;
  graduationProgram?: string;
  futurePlans?: string;
  higherStudiesFocus?: string;
};

export type QuizAnswerDisplay = {
  questionId: string;
  questionText: string;
  answerValue: string;
  answerText: string;
};

function labelFor(
  options: readonly { value: string; label: string }[],
  value?: string | null
): string {
  if (!value) return '—';
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getCampaignFromResponses(
  responses: RiasecResponses
): string | null {
  if (!responses || typeof responses !== 'object') return null;
  const campaign = responses._campaign;
  return typeof campaign === 'string' ? campaign : null;
}

export function getPreQuizFromResponses(
  responses: RiasecResponses
): BgesPreQuizFormData | null {
  if (!responses || typeof responses !== 'object') return null;
  const preQuiz = responses._preQuiz;
  if (!preQuiz || typeof preQuiz !== 'object') return null;
  return preQuiz as BgesPreQuizFormData;
}

export function formatPreQuizForDisplay(
  preQuiz: BgesPreQuizFormData | null
): BgesPreQuizDisplay | null {
  if (!preQuiz) return null;

  return {
    firstName: preQuiz.firstName,
    lastName: preQuiz.lastName,
    email: preQuiz.email,
    whatsappNumber: preQuiz.whatsappNumber,
    careerStage: labelFor(bgesCareerStageOptions, preQuiz.careerStage),
    graduationProgram: labelFor(
      bgesGraduationProgramOptions,
      preQuiz.graduationProgram
    ),
    futurePlans: labelFor(bgesFuturePlansOptions, preQuiz.futurePlans),
    higherStudiesFocus: preQuiz.higherStudiesFocus
      ? labelFor(bgesHigherStudiesFocusOptions, preQuiz.higherStudiesFocus)
      : '—',
  };
}

export function getQuizAnswersFromResponses(
  responses: RiasecResponses
): QuizAnswerDisplay[] {
  if (!responses || typeof responses !== 'object') return [];

  return riasecQuestions
    .map((question) => {
      const raw = responses[question.id];
      if (typeof raw !== 'string' || !raw) return null;

      const option = question.options.find((opt) => opt.value === raw);
      return {
        questionId: question.id,
        questionText: question.text,
        answerValue: raw,
        answerText: option?.text ?? raw,
      };
    })
    .filter((answer): answer is QuizAnswerDisplay => answer !== null);
}

export function isBgesCampaign(responses: RiasecResponses): boolean {
  return getCampaignFromResponses(responses) === 'bges';
}
