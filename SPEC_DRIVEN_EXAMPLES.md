# Spec-Driven Development Examples for Melhor Saúde Platform

## How to Use Spec-Driven Development Without Specify CLI

Since you don't have Python/uv installed, here's how to implement Spec-Driven Development principles manually in your React/TypeScript health platform:

## 🎯 Example 1: Enhanced Error Handling System

### Step 1: Specification (What & Why)
**Requirement**: Implement a comprehensive error handling system that provides consistent user experience across all components while maintaining detailed error logging for debugging.

**User Stories**:
- As a user, I want to see friendly error messages when something goes wrong
- As a developer, I want detailed error logs to debug issues quickly
- As a support team, I want to track error patterns to improve the platform

### Step 2: Technical Plan (How)
**Architecture**:
- Centralized error boundary with context-aware error handling
- Standardized error types and response formats
- Integration with monitoring service (Sentry)
- i18n support for error messages

**Tech Stack**:
- React Error Boundary
- Context API for error state management
- TypeScript for type safety
- i18next for internationalization

### Step 3: Implementation Tasks
1. Create error types and interfaces
2. Implement error boundary component
3. Create error context and hooks
4. Add error logging service
5. Update existing components to use new error handling
6. Add error monitoring integration
7. Create error recovery mechanisms

### Step 4: Implementation
Let me show you how to implement this:

```typescript
// 1. Error Types (src/types/errors.ts)
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userAction?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContextType {
  errors: AppError[];
  addError: (error: AppError) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
}

// 2. Error Boundary (src/components/ErrorBoundary.tsx)
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const appError: AppError = {
      code: 'COMPONENT_ERROR',
      message: error.message,
      details: { errorInfo, stack: error.stack },
      timestamp: new Date(),
      severity: 'high'
    };
    
    // Send to monitoring service
    this.props.onError?.(appError);
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// 3. Error Context (src/contexts/ErrorContext.tsx)
export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: AppError) => {
    setErrors(prev => [...prev, { ...error, id: generateId() }]);
    
    // Send to monitoring service
    if (error.severity === 'critical' || error.severity === 'high') {
      Sentry.captureException(new Error(error.message), {
        extra: error.details,
        tags: { errorCode: error.code }
      });
    }
  }, []);

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, clearError, clearAllErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

// 4. Error Hook (src/hooks/useError.ts)
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

// 5. Error Fallback Component (src/components/ErrorFallback.tsx)
export const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-lg font-medium text-gray-900 text-center mb-2">
          {t('errors.somethingWentWrong')}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {t('errors.tryAgainLater')}
        </p>
        <div className="flex space-x-3">
          <Button
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            {t('common.reload')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            {t('common.goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

## 🎯 Example 2: Performance Monitoring System

### Step 1: Specification
**Requirement**: Implement comprehensive performance monitoring to track Core Web Vitals, user interactions, and system performance metrics.

### Step 2: Technical Plan
**Metrics to Track**:
- Core Web Vitals (LCP, FID, CLS)
- Page load times
- API response times
- User interaction metrics
- Error rates

### Step 3: Implementation
```typescript
// Performance Monitoring Hook (src/hooks/usePerformance.ts)
export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    // Track Core Web Vitals
    const trackWebVitals = () => {
      if ('web-vitals' in window) {
        getCLS(setMetric);
        getFID(setMetric);
        getFCP(setMetric);
        getLCP(setMetric);
        getTTFB(setMetric);
      }
    };

    // Track custom metrics
    const trackCustomMetrics = () => {
      // Page load time
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetric('pageLoadTime', loadTime);

      // API response times
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('/api/')) {
            setMetric(`api_${entry.name}`, entry.duration);
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });
    };

    trackWebVitals();
    trackCustomMetrics();

    return () => observer?.disconnect();
  }, []);

  const setMetric = (name: string, value: number) => {
    setMetrics(prev => ({ ...prev, [name]: value }));
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value
      });
    }
  };

  return { metrics };
};
```

## 🎯 Example 3: Accessibility Enhancement

### Step 1: Specification
**Requirement**: Ensure WCAG 2.1 AA compliance across all components with comprehensive accessibility testing and user experience improvements.

### Step 2: Technical Plan
**Accessibility Features**:
- Screen reader support
- Keyboard navigation
- Color contrast compliance
- Focus management
- ARIA labels and descriptions

### Step 3: Implementation
```typescript
// Accessibility Hook (src/hooks/useAccessibility.ts)
export const useAccessibility = () => {
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    setFocusableElements(Array.from(focusable) as HTMLElement[]);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextIndex = e.shiftKey 
        ? (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length
        : (currentFocusIndex + 1) % focusableElements.length;
      
      setCurrentFocusIndex(nextIndex);
      focusableElements[nextIndex]?.focus();
    }
  }, [currentFocusIndex, focusableElements]);

  return { trapFocus, handleKeyDown };
};

// Accessible Button Component (src/components/AccessibleButton.tsx)
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  keyboardShortcuts,
  ...props
}) => {
  const { trapFocus, handleKeyDown } = useAccessibility();

  return (
    <button
      {...props}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onKeyDown={handleKeyDown}
      className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {children}
    </button>
  );
};
```

## 🎯 Example 4: Testing Strategy

### Step 1: Specification
**Requirement**: Implement comprehensive testing strategy with unit, integration, and E2E tests covering all critical user journeys.

### Step 2: Technical Plan
**Testing Pyramid**:
- Unit Tests: 80% coverage for business logic
- Integration Tests: API and component interactions
- E2E Tests: Critical user journeys
- Visual Regression: UI consistency

### Step 3: Implementation
```typescript
// Unit Test Example (src/components/__tests__/ErrorBoundary.test.tsx)
describe('ErrorBoundary', () => {
  it('should catch errors and display fallback UI', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should log errors to monitoring service', () => {
    const mockOnError = jest.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'COMPONENT_ERROR',
        message: 'Test error',
        severity: 'high'
      })
    );
  });
});

// Integration Test Example (src/__tests__/booking-flow.integration.test.tsx)
describe('Booking Flow Integration', () => {
  it('should complete full booking journey', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BookingFlow />
        </AuthProvider>
      </BrowserRouter>
    );

    // Step 1: Select pillar
    await user.click(screen.getByText('Mental Health'));
    expect(screen.getByText('Select Topic')).toBeInTheDocument();

    // Step 2: Select topic
    await user.click(screen.getByText('Anxiety'));
    expect(screen.getByText('Pre-diagnostic Chat')).toBeInTheDocument();

    // Step 3: Complete chat
    await user.type(screen.getByRole('textbox'), 'I feel anxious about work');
    await user.click(screen.getByText('Send'));

    // Step 4: Provider assignment
    expect(screen.getByText('Provider Assigned')).toBeInTheDocument();

    // Step 5: Date selection
    await user.click(screen.getByText('Select Date'));
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });
});
```

## 🎯 Example 5: Feature Flag System

### Step 1: Specification
**Requirement**: Implement feature flag system to enable gradual feature rollouts, A/B testing, and safe deployments.

### Step 2: Technical Plan
**Features**:
- Dynamic feature toggles
- User-based feature targeting
- A/B testing support
- Rollback capabilities

### Step 3: Implementation
```typescript
// Feature Flag Hook (src/hooks/useFeatureFlag.ts)
export const useFeatureFlag = (flagName: string) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkFeatureFlag = async () => {
      try {
        const response = await fetch(`/api/feature-flags/${flagName}`, {
          headers: { 'User-ID': user?.id }
        });
        const data = await response.json();
        setIsEnabled(data.enabled);
      } catch (error) {
        console.error('Failed to fetch feature flag:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFeatureFlag();
  }, [flagName, user?.id]);

  return { isEnabled, isLoading };
};

// Feature Flag Component (src/components/FeatureFlag.tsx)
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  children,
  fallback = null
}) => {
  const { isEnabled, isLoading } = useFeatureFlag(flag);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Usage Example
<FeatureFlag flag="new-booking-flow" fallback={<OldBookingFlow />}>
  <NewBookingFlow />
</FeatureFlag>
```

## 🎯 How to Apply This to Your Project

### 1. **Start with One Feature**
Choose the most critical improvement area (e.g., Error Handling) and implement it using the spec-driven approach.

### 2. **Create Feature Specifications**
For each new feature or improvement:
- Write clear requirements and user stories
- Define technical architecture and constraints
- Break down into implementable tasks
- Implement with comprehensive testing

### 3. **Use the Constitution**
Always refer back to your `PROJECT_CONSTITUTION.md` to ensure consistency with project principles.

### 4. **Track Progress**
Use the success metrics defined in your analysis to measure improvement.

### 5. **Iterate and Improve**
Continuously refine your specifications based on user feedback and performance data.

## 🚀 Next Steps

1. **Choose Your First Feature**: Pick one improvement area from the analysis
2. **Write the Specification**: Define what you want to build and why
3. **Create the Technical Plan**: Decide how to implement it
4. **Break Down into Tasks**: Create actionable implementation steps
5. **Implement with Testing**: Build the feature with comprehensive tests
6. **Measure Success**: Track metrics and iterate based on results

This approach gives you all the benefits of Spec-Driven Development without needing the Specify CLI, and you can implement it immediately in your existing project!





