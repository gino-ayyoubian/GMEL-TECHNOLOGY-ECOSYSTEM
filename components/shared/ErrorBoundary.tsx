import React, { Component, ErrorInfo, ReactNode, ContextType } from 'react';
import { AppContext } from '../../contexts/AppContext';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  static contextType = AppContext;
  declare context: ContextType<typeof AppContext>;

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    if (this.context && this.context.setError) {
        // This is a generic message for unexpected UI errors.
        // Specific API errors are handled more gracefully within components.
        this.context.setError("A critical error occurred in the application. Please refresh the page if the issue persists.");
    }
  }

  render() {
    if (this.state.hasError) {
      // We render null here because the GlobalErrorDisplay will show the modal.
      // This prevents a broken UI from being displayed behind the modal.
      return null;
    }

    return this.props.children;
  }
}