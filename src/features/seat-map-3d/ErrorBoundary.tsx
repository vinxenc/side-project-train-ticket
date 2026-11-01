import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  fallback: ReactNode;
  onError?: () => void;
  children: ReactNode;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
