import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryProvider } from '@/components/providers/query-provider'

describe('QueryProvider', () => {
  it('renders children correctly', () => {
    render(
      <QueryProvider>
        <div>Test Child</div>
      </QueryProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('provides QueryClient context to children', () => {
    const TestComponent = () => {
      return <div>Context available</div>
    }

    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    )

    expect(screen.getByText('Context available')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <QueryProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </QueryProvider>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })
})
