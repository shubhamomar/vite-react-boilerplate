# Coding Guidelines & Best Practices

## Overview
This document contains comprehensive coding guidelines, error prevention strategies, and best practices learned from real-world development issues. **This is a living document** - every error resolution adds new guidelines to prevent future occurrences.

## 🎯 Core Principles

### 1. Test-First Development
- **Always test with real browser interactions** using Playwright MCP
- **Monitor console errors** during development and testing
- **Test file uploads and user interactions** with actual data
- **Validate across multiple viewport sizes** (320px to 2560px+)

### 2. Evidence-Based Development
- **Check console logs** before considering implementation complete
- **Use MCP tools** for research and validation
- **Document issues** and solutions for future reference
- **Real data testing** over synthetic examples

### 3. Full-Width Fluid Layouts (Critical for 2K+ Monitors)
- **ALWAYS utilize full viewport width** - no arbitrary max-width constraints
- **Progressive enhancement** for larger screens (1600px, 1920px, 2560px+)
- **Adaptive content density** - more columns/content on wider screens
- **Test on high-resolution displays** to ensure proper utilization

### 4. Planning Documentation System
- **ALWAYS create plan document** before implementation: `planned-tasks/plan-{task-name}.md`
- **USER APPROVAL REQUIRED** - never proceed without explicit user confirmation
- **DOCUMENT EVERYTHING** - planning decisions, implementation changes, lessons learned
- **SCREENSHOT DOCUMENTATION** - capture before/after across all breakpoints
- **POST-IMPLEMENTATION CHANGELOG** - create `ai-tasks/{task-name}/changelog.md`

## 🛠️ React/TypeScript/Vite Specific Patterns

### Component Development
```typescript
// ✅ Good: Proper TypeScript with error boundaries
interface ComponentProps {
  data: DataType[];
  onError?: (error: Error) => void;
}

const Component: React.FC<ComponentProps> = ({ data, onError }) => {
  const [error, setError] = useState<Error | null>(null);

  // Always handle errors gracefully
  const handleOperation = useCallback(async () => {
    try {
      // operation
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [onError]);
};

// ❌ Bad: Missing error handling and types
const Component = ({ data }) => {
  // No error boundaries, no type safety
};
```

### Full-Width Layout Patterns
```typescript
// ✅ Good: Full-width fluid layout that adapts to screen size
const DashboardLayout: React.FC = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-m3-surface">
      {/* Header: Full width with adaptive padding */}
      <header className="w-full bg-m3-surfaceContainer">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {/* Content adapts to screen size */}
        </div>
      </header>

      {/* Main: Full width with responsive grid */}
      <main className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {/* Grid expands to use available space */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 qhd:grid-cols-6 gap-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// ❌ Bad: Fixed max-width container
const BadLayout: React.FC = ({ children }) => {
  return (
    <div className="max-w-6xl mx-auto"> {/* Constrains to 1152px */}
      {children}
    </div>
  );
};
```

### State Management
```typescript
// ✅ Good: Zustand with proper TypeScript
interface StoreState {
  data: DataType[];
  loading: boolean;
  error: string | null;
  actions: {
    loadData: (file: File) => Promise<void>;
    clearError: () => void;
  };
}

// ❌ Bad: Untyped state without error handling
const useStore = create(() => ({
  data: [],
  loadData: async (file) => {
    // No error handling
  }
}));
```

### File Handling
```typescript
// ✅ Good: Proper file validation and error handling
const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) return { valid: false, error: 'No file provided' };
  if (file.size > 500 * 1024 * 1024) return { valid: false, error: 'File too large' };
  if (!['text/csv', 'text/plain'].includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  return { valid: true };
};

// ❌ Bad: No validation
const handleFile = (file: File) => {
  // Direct processing without validation
};
```

## 📚 Third-Party Library Integration Best Practices

### AG Grid Integration (Learned: 2025-01-21)

#### Module Registration
```typescript
// ✅ Good: Use AllCommunityModule for simplicity
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

// ❌ Bad: Individual modules (can cause missing feature errors)
import { ClientSideRowModelModule } from 'ag-grid-community';
ModuleRegistry.registerModules([ClientSideRowModelModule]); // Missing filtering, sorting
```

#### Theming Configuration
```typescript
// ✅ Good: Consistent theming approach
<AgGridReact
  theme="legacy"  // Use CSS-based theming
  // ... other props
/>

// Or remove CSS imports and use new theming API
// But never mix both approaches

// ❌ Bad: Mixed theming (causes Error #239)
// Having both ag-grid.css AND theme prop without "legacy"
```

#### Modern API Usage (v32.2+)
```typescript
// ✅ Good: Modern AG Grid patterns
const gridConfig = {
  rowSelection: {
    mode: 'multiRow',
    enableClickSelection: false,
  },
  // cellSelection requires Enterprise license
  // Use basic community features only
};

// ❌ Bad: Deprecated patterns
const gridConfig = {
  rowSelection: 'multiple', // Deprecated
  suppressRowClickSelection: true, // Deprecated
  enableRangeSelection: true, // Enterprise only
};
```

### Papa Parse + Web Workers (Learned: 2025-01-21)

#### Worker Configuration
```typescript
// ✅ Good: Proper worker setup
const papaConfig: Papa.ParseConfig = {
  header: false,
  skipEmptyLines: true,
  delimiter: '',
  complete: handleComplete,
  error: handleError,
  worker: false, // Don't nest workers
  download: false, // We have the file
};

// ❌ Bad: Nested workers or missing error handling
const papaConfig = {
  // Missing error handler
  worker: true, // Nested worker in worker
};
```

#### File Processing
```typescript
// ✅ Good: Robust file processing
function handleComplete(results: Papa.ParseResult<string[]>): void {
  console.log('Parse complete:', {
    totalRows: results.data?.length || 0,
    hasErrors: (results.errors?.length || 0) > 0,
    firstRow: results.data?.[0],
  });

  // Process errors into warnings
  if (results.errors?.length) {
    for (const error of results.errors) {
      // Handle parsing errors gracefully
    }
  }
}

// ❌ Bad: Silent failures
function handleComplete(results) {
  // No logging, no error handling
}
```

## 🧪 Testing Protocols

### Browser Testing with Playwright MCP

#### File Upload Testing
```typescript
// ✅ Required: Test file uploads with real files
await page.click('[data-testid="file-upload"]');
await page.setInputFiles('input[type="file"]', '/path/to/test/file.csv');

// Verify upload success
await page.waitForSelector('[data-testid="upload-success"]');

// Check console for errors
const consoleMessages = await page.evaluate(() => console.getMessages());
const errors = consoleMessages.filter(msg => msg.type === 'error');
expect(errors).toHaveLength(0);
```

#### Console Monitoring
```typescript
// ✅ Required: Monitor console during testing
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

// After interactions, verify clean console
expect(consoleErrors).toHaveLength(0);
```

#### Responsive Testing (Updated: 2025-01-21)
```typescript
// ✅ Required: Test critical breakpoints including high-resolution displays
const breakpoints = [320, 375, 768, 1024, 1440, 1600, 1920, 2560, 3840];

for (const width of breakpoints) {
  await page.setViewportSize({ width, height: 900 });
  await page.screenshot({ path: `test-${width}px.png` });

  // Verify no horizontal scroll at 320px
  if (width === 320) {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  }

  // Verify full-width utilization on large screens
  if (width >= 1600) {
    const containerWidth = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? getComputedStyle(main).width : '0px';
    });
    // Should not be constrained by arbitrary max-width
    expect(containerWidth).not.toBe('1200px');
    expect(containerWidth).not.toBe('1152px'); // max-w-6xl
  }
}
```

## ⚠️ Common Error Patterns & Solutions

### Library Module Errors
**Pattern**: "Module not registered" or "Feature not available"
**Solution**:
- Use comprehensive module imports (e.g., `AllCommunityModule`)
- Check Community vs Enterprise feature requirements
- Verify correct module registration syntax

### Theming Conflicts
**Pattern**: Mixed theming systems causing visual issues
**Solution**:
- Choose one theming approach consistently
- Use `theme="legacy"` for CSS-based themes
- Remove conflicting CSS imports

### Worker Configuration Issues
**Pattern**: Nested workers or silent failures
**Solution**:
- Set `worker: false` in libraries when already in worker context
- Always include error handlers
- Add comprehensive logging for debugging

### Type Safety Issues
**Pattern**: Runtime errors from missing type definitions
**Solution**:
- Define proper interfaces for all data structures
- Use strict TypeScript configuration
- Add runtime validation for external data

### Layout Constraint Issues (Added: 2025-01-21)
**Pattern**: Layouts not utilizing full screen width on large displays
**Solution**:
- Remove arbitrary `max-width` constraints
- Use percentage-based or viewport-relative units
- Implement progressive enhancement for larger screens
- Test on high-resolution displays (2K, 4K)

## 🔄 Continuous Improvement Process

### After Every Error Resolution:
1. **Document the issue** in this file
2. **Add prevention guidelines** with code examples
3. **Update testing protocols** if needed
4. **Include in design review checklist**

### Monthly Review:
- Analyze recurring patterns
- Update guidelines based on new learnings
- Share insights with team
- Refine testing automation

## 📋 Pre-Deployment Checklist

### Planning & Documentation
- [ ] **Plan document created** and user-approved (planned-tasks/plan-{task-name}.md)
- [ ] **Implementation follows approved plan** with documented deviations
- [ ] **Screenshots captured** for before/after comparison
- [ ] **Changelog created** with complete change summary (ai-tasks/{task-name}/changelog.md)

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] All components have proper error boundaries
- [ ] Console is clean (no errors/warnings)
- [ ] File upload flows tested with real files

### Library Integration
- [ ] Third-party libraries properly configured
- [ ] Module registrations complete
- [ ] Version compatibility verified
- [ ] Feature edition requirements checked

### Browser Testing
- [ ] Playwright MCP tests passing
- [ ] File interactions tested
- [ ] Console monitoring active
- [ ] Responsive behavior verified
- [ ] **Full-width layout tested on 2K+ displays**

### Performance
- [ ] Large dataset handling tested
- [ ] Worker configuration optimal
- [ ] Memory usage acceptable
- [ ] Loading states implemented

---

## 📚 Learning Log

### 2025-01-21: Full-Width Layout Requirements (CRITICAL UPDATE)
**Issues Identified**:
- Layouts constrained on high-resolution displays (2K, 4K) showing significant wasted space
- Fixed max-width containers (max-w-7xl, max-width: 1200px) limiting screen utilization
- Static grid columns not adapting to available screen real estate
- Missing progressive enhancement for larger screens (1600px+)
- User reported: 2560x1440 display showing constrained layouts with unused horizontal space

**Root Cause**:
- `designs/tokens.json` had `maxWidth: "1200px"` constraint
- Pages using `max-w-7xl mx-auto` pattern constraining to 1280px
- Grid systems stopping at 3-4 columns regardless of screen width

**Guidelines Added**:
- Full-width layout requirements and patterns with fluid containers
- High-resolution display testing protocols (320px to 3840px)
- Progressive enhancement strategies (5-8 columns on 2K+ displays)
- Container width validation in testing with Playwright MCP
- Fluid padding system using `clamp()` and viewport-relative units
- Elimination of all arbitrary max-width constraints

### 2025-01-21: AG Grid & Papa Parse Integration
**Issues Fixed**:
- AG Grid module registration errors (#200, #239)
- Deprecated API warnings (rowSelection patterns)
- Papa Parse worker configuration issues
- Console error monitoring gaps

**Guidelines Added**:
- Comprehensive AG Grid setup patterns
- Worker configuration best practices
- Enhanced browser testing protocols
- File upload testing requirements

### 2025-01-21: Planning Documentation System Implementation
**Issues Addressed**:
- Need for systematic planning and user approval workflow
- Lack of comprehensive change documentation
- Difficulty in reviewing design decisions and implementation history
- Cluttered git history with planning artifacts

**Solution Implemented**:
- Created `planned-tasks/` folder system (excluded from git via .gitignore)
- Implemented mandatory `plan-{task-name}.md` creation with user approval requirement
- Added post-implementation `ai-tasks/{task-name}/changelog.md` documentation system
- Established screenshot capture and visual documentation protocols
- Integrated planning workflow into all design rule files

**Guidelines Added**:
- Mandatory user approval process before any implementation
- Comprehensive documentation templates for plans and changelogs
- Screenshot documentation requirements across all breakpoints
- Knowledge transfer protocols for team learning
- Clean git history maintenance while preserving human-readable documentation

**Next Update**: [Date] - [New learnings from next error resolution]

---

*This document evolves with every challenge we overcome. Each error makes us stronger and our codebase more robust.*