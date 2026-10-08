export interface FeedbackBannerProps {
  readonly message: string;
  readonly testId?: string;
}

export function FeedbackBanner({
  message,
  testId = 'rejection-feedback-banner',
}: FeedbackBannerProps): JSX.Element {
  return (
    <section
      className="p-3 bg-red-950/80 border border-red-700/80 rounded-lg text-red-200 text-xs shadow"
      data-testid={testId}
    >
      <span>{message}</span>
    </section>
  );
}
