import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Globally mock supabase client to prevent initialization errors in isolated test environments
vi.mock('../src/supabaseClient.ts', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))
