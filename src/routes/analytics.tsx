import { createFileRoute } from '@tanstack/react-router'
import { AnalyticsDashboard } from '../pages/AnalyticsDashboard'

export const Route = createFileRoute('/analytics')({
  component: () => <AnalyticsDashboard />,
})
