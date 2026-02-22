import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('../src/supabaseClient.ts', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnValue({ data: null, error: null }),
    })),
  },
}))
