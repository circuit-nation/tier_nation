import { PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'

import type { BoardDestination } from '@/store/voting-store'
import { TIER_VALUES } from '@/types'

type MoveEntityFn = (entityId: string, toTier: BoardDestination) => void

const toDestination = (overId: string): BoardDestination | null => {
  if (overId === 'pool-drop') {
    return 'POOL'
  }

  if (!overId.startsWith('tier-')) {
    return null
  }

  const tier = overId.replace('tier-', '')

  if (!TIER_VALUES.includes(tier as (typeof TIER_VALUES)[number])) {
    return null
  }

  return tier as (typeof TIER_VALUES)[number]
}

export function useDragDrop(moveEntity: MoveEntityFn) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const entityId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null

    if (!overId) {
      return
    }

    const destination = toDestination(overId)

    if (!destination) {
      return
    }

    moveEntity(entityId, destination)
  }

  return {
    sensors,
    onDragEnd,
  }
}
