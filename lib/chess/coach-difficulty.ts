// ============================================================
// Coach difficulty presets shared across play and coaching flows
// ============================================================

export type CoachDifficultyId =
  | 'beginner'
  | 'amateur'
  | 'intermediate'
  | 'master'
  | 'grandmaster';

export interface CoachDifficultyOption {
  id: CoachDifficultyId;
  label: string;
  rating: number;
  description: string;
}

export const COACH_DIFFICULTIES: CoachDifficultyOption[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    rating: 400,
    description: 'Simple plans, clear threats, and very direct explanations.',
  },
  {
    id: 'amateur',
    label: 'Amateur',
    rating: 800,
    description: 'Still simple, but with more tactical and opening detail.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    rating: 1200,
    description: 'Balanced explanations with a little chess terminology.',
  },
  {
    id: 'master',
    label: 'Master',
    rating: 1800,
    description: 'Stronger positional ideas and deeper tactical awareness.',
  },
  {
    id: 'grandmaster',
    label: 'Grandmaster',
    rating: 2200,
    description: 'High-level analysis with precise strategic language.',
  },
];

export const DEFAULT_COACH_DIFFICULTY: CoachDifficultyId = 'intermediate';

export function getCoachDifficultyById(
  id: CoachDifficultyId
): CoachDifficultyOption {
  return COACH_DIFFICULTIES.find((difficulty) => difficulty.id === id) ?? COACH_DIFFICULTIES[2];
}

export function getCoachDifficultyByRating(
  rating?: number
): CoachDifficultyOption {
  if (!rating) return getCoachDifficultyById(DEFAULT_COACH_DIFFICULTY);

  if (rating < 800) return getCoachDifficultyById('beginner');
  if (rating < 1200) return getCoachDifficultyById('amateur');
  if (rating < 1800) return getCoachDifficultyById('intermediate');
  if (rating < 2200) return getCoachDifficultyById('master');
  return getCoachDifficultyById('grandmaster');
}
