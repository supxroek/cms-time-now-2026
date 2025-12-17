import { Component } from "react";
import PropTypes from "prop-types";

/**
 * ErrorBoundary Component
 * จับ Error ที่เกิดขึ้นใน Child Components
 * แสดง Fallback UI แทนที่จะ crash ทั้งหน้า
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // อัพเดท state เพื่อแสดง fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error ไปยัง error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({ errorInfo });

    // ถ้ามี onError callback ให้เรียกใช้
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // ถ้ามี custom fallback ให้ใช้
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-50 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-danger"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h3 className="text-lg font-semibold text-text-main mb-2">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-sm text-text-sub mb-4">
              {this.props.message ||
                "ไม่สามารถแสดงเนื้อหาส่วนนี้ได้ กรุณาลองใหม่อีกครั้ง"}
            </p>

            {/* Error Details (Dev mode only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-danger/5 rounded-lg p-3 mb-4 text-xs">
                <summary className="cursor-pointer text-danger font-medium">
                  รายละเอียด Error
                </summary>
                <pre className="mt-2 overflow-auto text-text-muted whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Retry Button */}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inv rounded-lg hover:bg-primary-hover transition-colors focus-ring"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              ลองใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  message: PropTypes.string,
  onError: PropTypes.func,
};

/**
 * withErrorBoundary HOC
 * ครอบ Component ด้วย ErrorBoundary
 */
export function withErrorBoundary(WrappedComponent, errorBoundaryProps = {}) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithErrorBoundary;
}
