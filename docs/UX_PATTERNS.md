# UX Patterns & Components Guide

This document outlines the consistent UX patterns and reusable components to use across the Wellness Platform.

## 📦 **Available Components**

### 1. LoadingSkeleton
**Location:** `src/components/ui/loading-skeleton.tsx`

Consistent loading states with animated skeletons.

**Usage:**
```tsx
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Card skeleton
<LoadingSkeleton variant="card" />

// Table skeleton
<LoadingSkeleton variant="table" />

// List skeleton (with custom count)
<LoadingSkeleton variant="list" count={5} />

// Stats skeleton
<LoadingSkeleton variant="stats" />

// Text skeleton
<LoadingSkeleton variant="text" count={3} />
```

**Variants:**
- `card` - Single card with title, subtitle, and content
- `table` - Full table with headers and rows
- `list` - List of items with avatars
- `stats` - Grid of 4 stat cards
- `text` - Multiple text lines

---

### 2. EmptyState
**Location:** `src/components/ui/empty-state.tsx`

Consistent empty state messaging with optional actions.

**Usage:**
```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

// Default variant (full)
<EmptyState
  icon={FileText}
  title="Nenhuma sessão encontrada"
  description="Ainda não existem sessões registadas"
  action={{
    label: "Criar sessão",
    onClick: () => handleCreate()
  }}
/>

// Compact variant (for tables/cards)
<EmptyState
  icon={CalendarIcon}
  title="Sem agendamentos"
  description="Não há agendamentos neste dia"
  variant="compact"
/>
```

**Props:**
- `icon` - Lucide icon component or React element
- `title` - Main message (required)
- `description` - Supporting text (required)
- `action` - Optional button with label and onClick
- `variant` - `'default'` (full) or `'compact'` (minimal)
- `className` - Custom styling

---

### 3. Error Handler
**Location:** `src/utils/errorHandler.ts`

Centralized error handling with consistent toast notifications.

**Usage:**
```tsx
import { handleError, showSuccess, showWarning, showInfo } from '@/utils/errorHandler';

// Error handling with toast
try {
  await someAsyncOperation();
} catch (error) {
  handleError(error, {
    title: 'Erro ao carregar dados',
    fallbackMessage: 'Não foi possível carregar os dados'
  });
}

// Success notification
showSuccess('Dados guardados', 'As alterações foram guardadas com sucesso');

// Warning notification
showWarning('Atenção', 'Esta ação não pode ser desfeita');

// Info notification
showInfo('Nova atualização', 'Dados atualizados em tempo real');
```

**handleError Options:**
- `title` - Toast title (default: "Erro")
- `fallbackMessage` - Message when error has no message
- `showToast` - Show toast notification (default: true)
- `logToConsole` - Log to console (default: true)

---

### 4. LiveIndicator
**Location:** `src/components/ui/live-indicator.tsx`

Visual indicator for real-time updates.

**Usage:**
```tsx
import { LiveIndicator } from '@/components/ui/live-indicator';

<CardHeader>
  <CardTitle className="flex items-center justify-between">
    <span>Dashboard</span>
    <LiveIndicator />
  </CardTitle>
</CardHeader>
```

Shows a pulsing green dot with "Tempo Real" text.

---

## 🎨 **Design Patterns**

### Loading States
**✅ DO:**
```tsx
if (loading) {
  return <LoadingSkeleton variant="table" />;
}
```

**❌ DON'T:**
```tsx
if (loading) {
  return <div className="animate-spin">Loading...</div>;
}
```

---

### Empty States
**✅ DO:**
```tsx
{items.length === 0 ? (
  <EmptyState
    icon={FileText}
    title="Nenhum item encontrado"
    description="Não foram encontrados itens com os filtros aplicados"
    variant="compact"
  />
) : (
  <ItemList items={items} />
)}
```

**❌ DON'T:**
```tsx
{items.length === 0 && <p>No items found</p>}
```

---

### Error Handling
**✅ DO:**
```tsx
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  setData(data);
} catch (error) {
  handleError(error, {
    title: 'Erro ao carregar',
    fallbackMessage: 'Não foi possível carregar os dados'
  });
}
```

**❌ DON'T:**
```tsx
try {
  const { data, error } = await supabase.from('table').select();
  if (error) {
    console.error(error);
    toast({ title: 'Error', description: error.message });
  }
}
```

---

### Real-time Indicators
**✅ DO:**
```tsx
<div className="flex items-center justify-between">
  <h2>Dashboard</h2>
  <LiveIndicator />
</div>
```

Use when data updates via real-time subscriptions.

---

## 📋 **Complete Example**

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { LiveIndicator } from '@/components/ui/live-indicator';
import { handleError, showSuccess } from '@/utils/errorHandler';
import { FileText } from 'lucide-react';

export const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(data || []);
    } catch (error) {
      handleError(error, {
        title: 'Erro ao carregar dados',
        fallbackMessage: 'Não foi possível carregar os dados'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-time subscription
    const subscription = supabase
      .channel('items-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items'
      }, () => {
        loadData();
        showInfo('Atualização', 'Dados atualizados em tempo real');
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Loading state
  if (loading) {
    return <LoadingSkeleton variant="table" />;
  }

  // Empty state
  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum dado encontrado"
        description="Ainda não existem dados registados"
        action={{
          label: "Criar novo",
          onClick: () => handleCreate()
        }}
      />
    );
  }

  // Data display
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dados</span>
          <LiveIndicator />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          {/* Table content */}
        </Table>
      </CardContent>
    </Card>
  );
};
```

---

## ✅ **Checklist for New Components**

- [ ] Use `LoadingSkeleton` for all loading states
- [ ] Use `EmptyState` for all empty states
- [ ] Use `handleError` for all error handling
- [ ] Add `LiveIndicator` when data updates in real-time
- [ ] Use semantic toast notifications (`showSuccess`, `showWarning`, `showInfo`)
- [ ] Provide user-friendly Portuguese error messages
- [ ] Include fallback messages for all errors
- [ ] Use `variant="compact"` for EmptyState in tables/cards

---

## 🎯 **Benefits**

✅ **Consistency** - Same UX across the entire platform  
✅ **Maintainability** - Update one component, fix everywhere  
✅ **Accessibility** - Proper ARIA labels and semantic HTML  
✅ **Performance** - Optimized skeleton loaders  
✅ **User Experience** - Clear feedback and helpful messaging
