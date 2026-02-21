import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client to prevent "supabaseUrl is required" error during tests
vi.mock('../src/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
      insert: vi.fn(() => ({ data: [], error: null })),
      update: vi.fn(() => ({ data: [], error: null })),
      delete: vi.fn(() => ({ data: [], error: null })),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => ({ data: {}, error: null })),
    })),
  },
}))
