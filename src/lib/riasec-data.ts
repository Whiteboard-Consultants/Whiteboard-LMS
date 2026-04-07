/**
 * RIASEC Career Assessment Tool
 * Questions, scoring logic, and profile descriptions
 */

export interface RIASECQuestion {
  id: string;
  text: string;
  options: Array<{
    value: string;
    text: string;
    scores: {
      realistic: number;
      investigative: number;
      artistic: number;
      social: number;
      enterprising: number;
      conventional: number;
    };
  }>;
}

// 30 RIASEC Assessment Questions
export const riasecQuestions: RIASECQuestion[] = [
  {
    id: 'q1',
    text: 'I prefer work that involves:',
    options: [
      {
        value: 'building_structures',
        text: 'Building or constructing physical structures',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'analyzing_data',
        text: 'Analyzing and interpreting data',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'creative_expression',
        text: 'Creative expression and design',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'helping_people',
        text: 'Helping and supporting others',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'leading_teams',
        text: 'Leading teams and making decisions',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'organizing_tasks',
        text: 'Organizing and managing details',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q2',
    text: 'My natural talents include:',
    options: [
      {
        value: 'natural_work',
        text: 'Working with my hands and tools',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'research_problem',
        text: 'Research and problem-solving',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'artistic_talents',
        text: 'Artistic or musical abilities',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'communication',
        text: 'Communication and empathy',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'persuasion',
        text: 'Persuasion and negotiation',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'attention_detail',
        text: 'Attention to detail and accuracy',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q3',
    text: 'I enjoy learning about:',
    options: [
      {
        value: 'machines_mechanics',
        text: 'Machines and mechanics',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'science_discovery',
        text: 'Science and discovery',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'literature_arts',
        text: 'Literature and the arts',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'human_behavior',
        text: 'Human behavior and psychology',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'business_strategy',
        text: 'Business and strategy',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'numbering_systems',
        text: 'Numbering systems and databases',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q4',
    text: 'In my ideal work environment:',
    options: [
      {
        value: 'outdoors',
        text: 'Work would be outdoors or hands-on',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'laboratory',
        text: 'Work would be in a lab or research setting',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'creative_space',
        text: 'Work would be creative and expressive',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'helping_environment',
        text: 'Work would help others directly',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'dynamic_office',
        text: 'Work would be dynamic and competitive',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'structured_office',
        text: 'Work would be structured and organized',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q5',
    text: 'I feel most satisfied when:',
    options: [
      {
        value: 'building_tangible',
        text: 'Building something tangible',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'discovering_truth',
        text: 'Discovering something new',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'expressing_emotions',
        text: 'Creating something beautiful',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'making_difference',
        text: 'Making a positive difference in someone\'s life',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'closing_deals',
        text: 'Successfully closing a deal or winning',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'completing_tasks',
        text: 'Completing tasks with accuracy',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q6',
    text: 'My approach to problems is:',
    options: [
      {
        value: 'practical_fix',
        text: 'Practical - find a physical solution',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'analytical',
        text: 'Analytical - research and understand deeply',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'creative_approach',
        text: 'Creative - think outside the box',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'collaborative',
        text: 'Collaborative - involve others',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'strategic',
        text: 'Strategic - think about advantages',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'systematic',
        text: 'Systematic - follow proven methods',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q7',
    text: 'The career field I\'m most drawn to includes:',
    options: [
      {
        value: 'trades',
        text: 'Trades, construction, or engineering',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'science_tech',
        text: 'Science, technology, or IT',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'design_media',
        text: 'Design, media, or entertainment',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'healthcare_education',
        text: 'Healthcare, education, or social services',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'business_management',
        text: 'Business, management, or entrepreneurship',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'administration',
        text: 'Administration, accounting, or data entry',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q8',
    text: 'I prefer colleagues who are:',
    options: [
      {
        value: 'practical_doers',
        text: 'Practical and action-oriented',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'intellectual',
        text: 'Intellectual and curious',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'creative_expressive',
        text: 'Creative and expressive',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'compassionate',
        text: 'Compassionate and supportive',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'ambitious',
        text: 'Ambitious and driven',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'reliable_organized',
        text: 'Reliable and organized',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q9',
    text: 'I am most stressed by:',
    options: [
      {
        value: 'desk_work',
        text: 'Too much desk work or abstract thinking',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'uncertainty',
        text: 'Lack of clear answers or data',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'conformity',
        text: 'Having to conform to strict rules',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'conflict',
        text: 'Conflict or emotional tension',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'lack_autonomy',
        text: 'Lack of autonomy or control',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'disorganization',
        text: 'Disorganization or chaos',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  },
  {
    id: 'q10',
    text: 'I value work that offers:',
    options: [
      {
        value: 'practical_output',
        text: 'Visible, concrete results',
        scores: { realistic: 3, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'intellectual_growth',
        text: 'Intellectual challenge and learning',
        scores: { realistic: 0, investigative: 3, artistic: 0, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'self_expression',
        text: 'Freedom for self-expression',
        scores: { realistic: 0, investigative: 0, artistic: 3, social: 0, enterprising: 0, conventional: 0 }
      },
      {
        value: 'impact_others',
        text: 'Direct impact on others\' wellbeing',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 3, enterprising: 0, conventional: 0 }
      },
      {
        value: 'financial_success',
        text: 'Financial reward and prestige',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 3, conventional: 0 }
      },
      {
        value: 'job_security',
        text: 'Security and predictability',
        scores: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 3 }
      }
    ]
  }
];

export interface RIASECProfile {
  id: string;
  code: string;
  name: string;
  description: string;
  strengths: string[];
  careerExamples: string[];
  color: string;
}

export const riasecProfiles: Record<string, RIASECProfile> = {
  realistic: {
    id: 'realistic',
    code: 'R',
    name: 'Realistic',
    description: 'You are practical, hands-on, and results-oriented. You prefer working with tools, machines, or physical materials. You enjoy solving concrete problems and seeing tangible results.',
    strengths: ['Practical problem-solving', 'Technical skills', 'Working with hands', 'Physical coordination', 'Mechanical aptitude'],
    careerExamples: ['Electrician', 'Carpenter', 'Mechanic', 'Plumber', 'Construction Manager', 'Surveyor', 'Agricultural Specialist'],
    color: '#ef4444'
  },
  investigative: {
    id: 'investigative',
    code: 'I',
    name: 'Investigative',
    description: 'You are analytical, curious, and enjoy solving complex problems. You like research, data analysis, and understanding how things work. You prefer thinking over doing.',
    strengths: ['Analytical thinking', 'Research skills', 'Problem-solving', 'Intellectual curiosity', 'Technical understanding'],
    careerExamples: ['Scientist', 'Software Engineer', 'Data Analyst', 'Researcher', 'Mathematician', 'Lab Technician', 'Systems Analyst'],
    color: '#3b82f6'
  },
  artistic: {
    id: 'artistic',
    code: 'A',
    name: 'Artistic',
    description: 'You are creative, expressive, and intuitive. You enjoy creating something new and value self-expression. You prefer unstructured environments where you can innovate.',
    strengths: ['Creativity', 'Artistic expression', 'Imagination', 'Design thinking', 'Communication through art'],
    careerExamples: ['Graphic Designer', 'Musician', 'Writer', 'Actor', 'Architect', 'Art Director', 'Photographer'],
    color: '#ec4899'
  },
  social: {
    id: 'social',
    code: 'S',
    name: 'Social',
    description: 'You are people-oriented, empathetic, and enjoy helping others. You work well in teams and find meaning in supporting and developing others.',
    strengths: ['Interpersonal skills', 'Empathy', 'Communication', 'Team collaboration', 'Counseling ability'],
    careerExamples: ['Teacher', 'Counselor', 'Nurse', 'Social Worker', 'HR Manager', 'Coach', 'Therapist'],
    color: '#10b981'
  },
  enterprising: {
    id: 'enterprising',
    code: 'E',
    name: 'Enterprising',
    description: 'You are ambitious, persuasive, and driven by success. You enjoy leadership, entrepreneurship, and working toward goals. You like influencing and motivating others.',
    strengths: ['Leadership', 'Persuasion', 'Entrepreneurial thinking', 'Goal orientation', 'Risk-taking'],
    careerExamples: ['Manager', 'Entrepreneur', 'Sales Executive', 'CEO', 'Marketing Manager', 'Administrator', 'Public Relations'],
    color: '#f59e0b'
  },
  conventional: {
    id: 'conventional',
    code: 'C',
    name: 'Conventional',
    description: 'You are organized, detail-oriented, and prefer structure. You work well with systems, processes, and clear expectations. You\'re reliable and value accuracy.',
    strengths: ['Organization', 'Attention to detail', 'Data management', 'Process optimization', 'Reliability'],
    careerExamples: ['Accountant', 'Auditor', 'Secretary', 'Data Entry Specialist', 'Bank Teller', 'Filing Clerk', 'Office Manager'],
    color: '#8b5cf6'
  }
};

/**
 * Calculate RIASEC scores from assessment responses
 * @param responses Object mapping question IDs to selected option values
 * @returns Object with scores for each RIASEC type
 */
export function calculateRIASECScores(responses: Record<string, string>): Record<string, number> {
  const scores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0
  };

  for (const questionId in responses) {
    const selectedValue = responses[questionId];
    const question = riasecQuestions.find(q => q.id === questionId);
    
    if (question) {
      const option = question.options.find(opt => opt.value === selectedValue);
      if (option) {
        scores.realistic += option.scores.realistic;
        scores.investigative += option.scores.investigative;
        scores.artistic += option.scores.artistic;
        scores.social += option.scores.social;
        scores.enterprising += option.scores.enterprising;
        scores.conventional += option.scores.conventional;
      }
    }
  }

  return scores;
}

/**
 * Get top 3 RIASEC profiles based on scores
 * @param scores Object with scores for each RIASEC type
 * @returns Array of top 3 profile IDs
 */
export function getTopProfiles(scores: Record<string, number>): string[] {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 3).map(([profile]) => profile);
}

/**
 * Get profile details by ID
 * @param profileId RIASEC profile ID (realistic, investigative, etc.)
 * @returns Profile details
 */
export function getProfileDetails(profileId: string): RIASECProfile | null {
  return riasecProfiles[profileId] || null;
}
