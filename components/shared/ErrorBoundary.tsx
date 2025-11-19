import React, { Component, ErrorInfo } from 'react';
import { AppContext } from '../../contexts/AppContext';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced the incorrect constructor (which was missing `super(props)`) with a direct state property initializer. This is a more modern and concise approach that correctly initializes state and ensures `this.props` is available.
  state: State = {
    hasError: false,
  };

  public static contextType = AppContext;
  declare context: React.ContextType<typeof AppContext>;

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    if (this.context && this.context.setError) {
        // This is a generic message for unexpected UI errors.
        // Specific API errors are handled more gracefully within components.
        this.context.setError("A critical error occurred in the application. Please refresh the page if the issue persists.");
    }
  }

  public render() {
    if (this.state.hasError) {
      // We render null here because the GlobalErrorDisplay will show the modal.
      // This prevents a broken UI from being displayed behind the modal.
      return null;
    }

    return this.props.children;
  }
}
