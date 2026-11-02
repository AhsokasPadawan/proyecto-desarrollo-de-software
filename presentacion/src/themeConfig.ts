export interface ThemeStyleConfig {
  readonly appBackground: string;
  readonly topBarContainer: string;
  readonly topBarBrandText: string;
  readonly topBarSubText: string;
  readonly tabActive: string;
  readonly tabInactive: string;
  readonly modeSwitchContainer: string;
  readonly modeSwitchActive: string;
  readonly modeSwitchInactive: string;
  readonly slideCardContainer: string;
  readonly slideHeaderBorder: string;
  readonly slideBadge: string;
  readonly slideTitleText: string;
  readonly slideSubtitleText: string;
  readonly activeStepCard: string;
  readonly inactiveStepCard: string;
  readonly stepNumberActive: string;
  readonly stepNumberInactive: string;
  readonly contractPill: string;
  readonly modalTriggerButton: string;
  readonly simulatorTriggerButton: string;
  readonly footerBar: string;
  readonly primaryNavButton: string;
  readonly secondaryNavButton: string;
}

export const BOARD_EMERALD_THEME: ThemeStyleConfig = {
  appBackground: 'bg-emerald-100/65 text-zinc-900',
  topBarContainer: 'bg-emerald-950 border-b border-emerald-800 text-emerald-50 shadow-md',
  topBarBrandText: 'text-emerald-300',
  topBarSubText: 'text-emerald-200/70',
  tabActive: 'bg-emerald-400 text-emerald-950 font-extrabold shadow-sm border-emerald-300',
  tabInactive: 'bg-emerald-900/70 text-emerald-100/80 hover:bg-emerald-800 border-emerald-800',
  modeSwitchContainer: 'bg-emerald-900/60 border border-emerald-800/80',
  modeSwitchActive: 'bg-emerald-700/90 text-emerald-100 shadow-inner',
  modeSwitchInactive: 'text-emerald-400/50 hover:text-emerald-200 hover:bg-emerald-900/60',
  slideCardContainer: 'bg-white/95 border-2 border-emerald-800/25 shadow-xl rounded-2xl',
  slideHeaderBorder: 'border-b border-emerald-900/10 bg-emerald-50/50',
  slideBadge: 'bg-emerald-800 text-emerald-100 border border-emerald-700',
  slideTitleText: 'text-emerald-950',
  slideSubtitleText: 'text-emerald-900/75',
  activeStepCard:
    'bg-emerald-100/85 border-2 border-emerald-800 shadow-lg ring-2 ring-emerald-700/15',
  inactiveStepCard:
    'bg-emerald-50/40 border border-emerald-900/15 opacity-55 hover:opacity-85',
  stepNumberActive: 'bg-emerald-800 text-emerald-50 shadow-sm',
  stepNumberInactive: 'bg-emerald-200/70 text-emerald-900',
  contractPill: 'bg-emerald-950 text-emerald-200 border border-emerald-800',
  modalTriggerButton:
    'bg-emerald-900 hover:bg-emerald-800 text-emerald-50 border border-emerald-950 shadow-sm',
  simulatorTriggerButton:
    'bg-amber-400 hover:bg-amber-300 text-zinc-950 border border-amber-500 shadow-sm',
  footerBar: 'bg-emerald-950 text-emerald-50 border border-emerald-800 shadow-lg rounded-xl',
  primaryNavButton:
    'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold shadow-sm',
  secondaryNavButton:
    'bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 font-semibold',
};
