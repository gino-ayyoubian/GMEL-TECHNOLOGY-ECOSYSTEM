interface GeminiEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function GeminiEmptyState({
  title = 'No AI output yet',
  description = 'Start by entering a prompt related to your GMEL scenario.',
  actionLabel = 'Try a new question',
  onAction,
}: GeminiEmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-700">
      <div className="font-semibold mb-1">{title}</div>
      <div className="mb-3 text-xs text-slate-500">{description}</div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
