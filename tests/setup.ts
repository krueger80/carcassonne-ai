import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Supabase client to avoid environment variable errors during tests
vi.mock('../src/supabaseClient.ts', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }
}))
