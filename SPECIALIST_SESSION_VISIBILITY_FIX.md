# Fix #1: Specialist Session Visibility

## Problem
Specialists (Especialista Geral) are only seeing bookings assigned to them via `prestador_id`, but they should also see:
1. Chat sessions that were escalated to phone calls
2. Sessions booked through chat escalation
3. Call logs they handled

## Current Implementation (INCOMPLETE)
```typescript
// src/pages/SpecialistDashboard.tsx (Lines 46-118)
const { data: prestador, error: prestadorError } = await supabase
  .from('prestadores')
  .select('id')
  .eq('user_id', profile.id)
  .single();

const { data, error: bookingsError } = await supabase
  .from('bookings')
  .select('*, profiles!bookings_user_id_fkey(name)')
  .eq('prestador_id', prestador.id)
  .order('booking_date', { ascending: true });
```

**Issue:** Only shows bookings where `prestador_id` matches. Misses sessions from:
- Chat escalations
- Direct specialist assignments
- Call logs

## Solution: Create RPC Function

### Step 1: Create Database Function
```sql
-- This RPC function should be added to migrations/
CREATE OR REPLACE FUNCTION public.get_specialist_all_sessions(
  _specialist_user_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  company_id UUID,
  company_name TEXT,
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  status TEXT,
  pillar TEXT,
  session_type TEXT,
  meeting_link TEXT,
  source TEXT,
  chat_session_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prestador_id UUID;
BEGIN
  -- Get prestador ID for this user (if exists)
  SELECT p.id INTO _prestador_id
  FROM prestadores p
  WHERE p.user_id = _specialist_user_id;

  RETURN QUERY
  -- Source 1: Direct bookings (prestador-based)
  SELECT 
    b.id,
    b.user_id,
    prof.name as user_name,
    prof.email as user_email,
    b.company_id,
    comp.company_name,
    b.booking_date::DATE,
    b.start_time::TIME,
    b.end_time::TIME,
    b.status::TEXT,
    b.pillar::TEXT,
    b.session_type::TEXT,
    b.meeting_link::TEXT,
    'direct_booking'::TEXT as source,
    NULL::UUID as chat_session_id,
    b.created_at
  FROM bookings b
  LEFT JOIN profiles prof ON prof.id = b.user_id
  LEFT JOIN companies comp ON comp.id = b.company_id
  WHERE b.prestador_id = _prestador_id
    AND b.status != 'cancelled'
  
  UNION ALL
  
  -- Source 2: Bookings from chat escalations handled by this specialist
  SELECT 
    b.id,
    b.user_id,
    prof.name as user_name,
    prof.email as user_email,
    b.company_id,
    comp.company_name,
    b.booking_date::DATE,
    b.start_time::TIME,
    b.end_time::TIME,
    b.status::TEXT,
    b.pillar::TEXT,
    b.session_type::TEXT,
    b.meeting_link::TEXT,
    'chat_escalation'::TEXT as source,
    cs.id as chat_session_id,
    b.created_at
  FROM bookings b
  INNER JOIN chat_sessions cs ON cs.session_booked_by_specialist::UUID = _specialist_user_id
  LEFT JOIN profiles prof ON prof.id = b.user_id
  LEFT JOIN companies comp ON comp.id = b.company_id
  WHERE b.status != 'cancelled'
  
  UNION ALL
  
  -- Source 3: Active chat sessions assigned to this specialist
  SELECT 
    cs.id,
    cs.user_id,
    prof.name as user_name,
    prof.email as user_email,
    ce.company_id,
    comp.company_name,
    cs.created_at::DATE as booking_date,
    NULL::TIME as start_time,
    NULL::TIME as end_time,
    cs.status::TEXT,
    cs.pillar::TEXT,
    'chat'::TEXT as session_type,
    NULL::TEXT as meeting_link,
    'phone_escalation'::TEXT as source,
    cs.id as chat_session_id,
    cs.created_at
  FROM chat_sessions cs
  LEFT JOIN profiles prof ON prof.id = cs.user_id
  LEFT JOIN company_employees ce ON ce.user_id = cs.user_id
  LEFT JOIN companies comp ON comp.id = ce.company_id
  WHERE cs.status = 'phone_escalated'
    AND cs.phone_contact_made = false
  
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_specialist_all_sessions(UUID) TO authenticated;
```

### Step 2: Update Frontend Hook
Create new hook: `src/hooks/useSpecialistSessions.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SpecialistSession {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  company_id: string | null;
  company_name: string | null;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  pillar: string | null;
  session_type: string;
  meeting_link: string | null;
  source: 'direct_booking' | 'chat_escalation' | 'phone_escalation';
  chat_session_id: string | null;
  created_at: string;
}

export const useSpecialistSessions = () => {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<SpecialistSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await (supabase.rpc as any)(
        'get_specialist_all_sessions',
        { _specialist_user_id: profile.id }
      );

      if (rpcError) throw rpcError;

      setSessions(data || []);
    } catch (err) {
      console.error('[useSpecialistSessions] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchSessions();

    // Subscribe to realtime updates
    if (profile?.id) {
      const channel = supabase
        .channel('specialist-sessions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          () => {
            fetchSessions();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_sessions',
          },
          () => {
            fetchSessions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
  };
};
```

### Step 3: Update SpecialistDashboard
Replace the current session loading logic in `src/pages/SpecialistDashboard.tsx`:

```typescript
// OLD (Lines 48-118) - DELETE THIS
useEffect(() => {
  const loadSessions = async () => {
    if (!profile?.id) return;
    
    const { data: prestador } = await supabase
      .from('prestadores')
      .select('id')
      .eq('user_id', profile.id)
      .single();
    
    if (!prestador) return;
    
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_user_id_fkey(name)')
      .eq('prestador_id', prestador.id);
    
    setFilteredSessions(data || []);
  };
  loadSessions();
}, [profile?.id]);

// NEW - REPLACE WITH THIS
import { useSpecialistSessions } from '@/hooks/useSpecialistSessions';

export default function SpecialistDashboard() {
  const { profile, isEspecialistaGeral } = useAuth();
  const { escalatedChats, isLoading: chatsLoading } = useEscalatedChats();
  const { metrics, isLoading: analyticsLoading } = useSpecialistAnalytics();
  const { sessions, loading: sessionsLoading } = useSpecialistSessions(); // NEW HOOK
  const navigate = useNavigate();
  
  // Filter today's sessions
  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.booking_date === today);
  }, [sessions]);
  
  // ... rest of component
}
```

## Implementation Steps

1. **Create Migration File**
   ```bash
   # Create new migration
   supabase migration new specialist_all_sessions_function
   ```
   Then add the SQL function above to the migration file.

2. **Create Hook File**
   Create `src/hooks/useSpecialistSessions.ts` with the code above.

3. **Update Dashboard**
   Modify `src/pages/SpecialistDashboard.tsx` to use the new hook.

4. **Test Scenarios**
   - [ ] Specialist sees direct bookings (prestador assignments)
   - [ ] Specialist sees sessions booked through chat escalations
   - [ ] Specialist sees active phone-escalated chats
   - [ ] Sessions show company context
   - [ ] Realtime updates work when bookings change
   - [ ] Source indicator shows correct origin

## Benefits

1. **Complete Visibility**: Specialists see ALL sessions they're involved in
2. **Better Context**: Source field shows how session was created
3. **Company Info**: Shows which company user belongs to
4. **Realtime**: Automatically updates when sessions change
5. **Performance**: Single RPC call vs multiple queries

## Testing Checklist

```typescript
// Test as Especialista Geral user:
// 1. Check dashboard shows all session types
console.log('Sessions by source:', sessions.reduce((acc, s) => {
  acc[s.source] = (acc[s.source] || 0) + 1;
  return acc;
}, {}));

// 2. Verify company context is present
console.log('Sessions with company:', sessions.filter(s => s.company_name).length);

// 3. Test realtime updates
// - Create a booking as admin
// - Check if specialist dashboard updates automatically

// 4. Verify chat escalations appear
// - Escalate a chat to phone
// - Check if it appears in specialist dashboard
```

## Next Steps After Implementation

1. Update `PrestadorCalendar.tsx` to also use this function
2. Add source badges in calendar view
3. Show different colors for different source types
4. Add filter by source in specialist dashboard
5. Track session source in analytics

## Migration Script

Create file: `supabase/migrations/YYYYMMDDHHMMSS_specialist_all_sessions_function.sql`

```sql
-- Add the CREATE OR REPLACE FUNCTION code from Step 1 above
```

Then apply:
```bash
supabase db push
```

