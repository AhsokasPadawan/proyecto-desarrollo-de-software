export type PresentationPageId =
  | 'LANDING'
  | 'INTRODUCTION'
  | 'COMMAND'
  | 'STRATEGY'
  | 'STATE'
  | 'ADAPTERS'
  | 'METHODOLOGY';

export type PresentationViewMode = 'SLIDES_PROJECTION' | 'TEAM_STUDY_GUIDE';

export type InteractiveSimulatorId =
  | 'SOLID_GRASP_EXPLORER'
  | 'COMMAND_STACK_SIMULATOR'
  | 'STRATEGY_HYBRID_SIMULATOR'
  | 'STATE_REACT_SIMULATOR'
  | 'ADAPTERS_HOTSWAP_SIMULATOR'
  | 'METHODOLOGY_PIPELINE_SIMULATOR'
  | 'TDD_EXAMPLES_EXPLORER';

export interface SlideModalSpec {
  readonly id: string;
  readonly buttonLabel: string;
  readonly modalTitle: string;
  readonly modalSubtitle: string;
  readonly filePath?: string;
  readonly codeSnippet?: string;
  readonly keyTakeaway: string;
  readonly simulatorId?: InteractiveSimulatorId;
}

export interface SlideFocusStep {
  readonly stepIndex: number;
  readonly stepTag: string;
  readonly headline: string;
  readonly coreIdea: string;
  readonly visualBullets: readonly string[];
  readonly highlightedContracts: readonly string[];
  readonly modals: readonly SlideModalSpec[];
}

export interface ProfessorQaItem {
  readonly question: string;
  readonly answer: string;
}

export interface SpokenScriptBlock {
  readonly stepTitle: string;
  readonly whatToSay: string;
  readonly whenToClickModal: string;
}

export interface TeamStudyGuideSpec {
  readonly estimatedTime: string;
  readonly mainGoal: string;
  readonly spokenScriptByStep: readonly SpokenScriptBlock[];
  readonly interfacesCheatSheet: readonly {
    readonly name: string;
    readonly roleAndWhyItMatters: string;
  }[];
  readonly professorQuestions: readonly ProfessorQaItem[];
  readonly transitionPhraseToNextPage: string;
}

export interface PresentationSlidePage {
  readonly id: PresentationPageId;
  readonly pageNumber: number;
  readonly shortTabLabel: string;
  readonly slideTitle: string;
  readonly slideHookSubtitle: string;
  readonly icon: string;
  readonly badge: string;
  readonly focusSteps: readonly SlideFocusStep[];
  readonly nextBridgeLabel: string;
  readonly studyGuide: TeamStudyGuideSpec;
}

export interface StudentAuthor {
  readonly fullName: string;
  readonly orderNumber: number;
}

export const TEAM_MEMBERS_ALPHABETICAL: readonly StudentAuthor[] = [
  { orderNumber: 1, fullName: 'Contreras, Leonel' },
  { orderNumber: 2, fullName: 'Cristiano, Juan' },
  { orderNumber: 3, fullName: 'Gabor Delli, Roberta' },
  { orderNumber: 4, fullName: 'Gulmanelli, José' },
  { orderNumber: 5, fullName: 'Martínez Rossi, Javier' },
  { orderNumber: 6, fullName: 'Soricetti, Federico' },
];
