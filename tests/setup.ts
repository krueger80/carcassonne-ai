import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('../src/supabaseClient.ts', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    }
  }
}))
