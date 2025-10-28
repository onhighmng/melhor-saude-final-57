// Mock Supabase client for demo purposes
export const supabase = {
  auth: {
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: {} } }),
    admin: {
      createUser: async () => ({ data: null, error: null }),
    }
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: (column: string) => ({ limit: (count: number) => ({ data: [], error: null }) }),
        data: [],
        error: null
      }),
      order: (column: string) => ({ 
        limit: (count: number) => ({ data: [], error: null }),
        data: [],
        error: null
      }),
      limit: (count: number) => ({ data: [], error: null }),
      data: [],
      error: null
    }),
    insert: (data: any) => ({ data: null, error: null }),
    update: (data: any) => ({ 
      eq: (column: string, value: any) => ({ data: null, error: null }) 
    }),
    delete: () => ({ 
      eq: (column: string, value: any) => ({ data: null, error: null }) 
    }),
    upsert: (data: any) => ({ data: null, error: null })
  }),
  functions: {
    invoke: async (name: string, options?: any) => ({ data: null, error: null })
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => ({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
      remove: async (paths: string[]) => ({ data: null, error: null })
    })
  }
};