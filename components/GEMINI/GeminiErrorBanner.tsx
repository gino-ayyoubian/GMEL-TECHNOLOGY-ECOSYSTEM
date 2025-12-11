interface GeminiErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function GeminiErrorBanner({ message, onRetry }: GeminiErrorBannerProps) {
  return (
    <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      <div className="font-semibold mb-1">Something went wrong</div>
      <div className="mb-2">
        {message ?? 'The AI service could not complete your request. Please try again.'}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
