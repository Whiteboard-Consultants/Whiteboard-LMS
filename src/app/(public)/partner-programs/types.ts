export type ProgramCategory =
  | 'free'
  | 'management'
  | 'computer-science'
  | 'finance'
  | 'marketing'
  | 'web-development';

/** RiseUpp-style goal grouping */
export type ProgramGoal = 'free' | 'degree' | 'certificate';

export type DegreeType = 'masters' | 'doctorate' | 'bachelors' | 'pg-diploma';

/** Filter applied to the program grid */
export type ProgramFilter = ProgramCategory | 'all' | 'degree' | 'certificate';

export interface PartnerProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  certificate: string;
  provider: string;
  learnPoints: string[];
  riseuppUrl: string;
  isFree: boolean;
  categories: ProgramCategory[];
  iconColor: string;
  specialization?: string;
  degreeType?: DegreeType;
}

export interface MenuNavItem {
  id: string;
  label: string;
  filter: ProgramFilter;
  type: 'goal' | 'subject';
}
