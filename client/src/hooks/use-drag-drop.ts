import { useCallback, useRef, useState, type DragEvent, type HTMLAttributes } from 'react'

import type { BoardDestination } from '@/store/voting-store'
import { TIER_VALUES, type TierValue } from '@/types'

type MoveEntityFn = (entityId: string, toTier: BoardDestination) => void
export type NativeDraggableProps = Pick<HTMLAttributes<HTMLElement>, 'draggable' | 'onDragStart' | 'onDragEnd'>
export type NativeDropzoneProps = Pick<HTMLAttributes<HTMLElement>, 'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop'>

const DRAG_ENTITY_TYPE = 'application/x-tier-nation-entity-id'
const FALLBACK_TEXT_TYPE = 'text/plain'

const toDestination = (rawValue?: string): BoardDestination | null => {
  if (!rawValue) {
    return null
  }

  if (rawValue === 'POOL' || rawValue === 'pool-drop') {
    return 'POOL'
  }

  if (TIER_VALUES.includes(rawValue as TierValue)) {
    return rawValue as TierValue
  }

  if (!rawValue.startsWith('tier-')) {
    return null
  }

  const tier = rawValue.replace('tier-', '')

  if (!TIER_VALUES.includes(tier as TierValue)) {
    return null
  }

  return tier as TierValue
}

export function useDragDrop(moveEntity: MoveEntityFn) {
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null)
  const [overDestination, setOverDestination] = useState<BoardDestination | null>(null)
  const overDestinationRef = useRef<BoardDestination | null>(null)

  const syncOverDestination = useCallback((destination: BoardDestination | null) => {
    if (overDestinationRef.current === destination) {
      return
    }

    overDestinationRef.current = destination
    setOverDestination(destination)
  }, [])

  const onDragStart = useCallback((event: DragEvent<HTMLElement>) => {
    const entityId = event.currentTarget.dataset.entityId

    if (!entityId) {
      return
    }

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(DRAG_ENTITY_TYPE, entityId)
    event.dataTransfer.setData(FALLBACK_TEXT_TYPE, entityId)
    setActiveEntityId(entityId)
  }, [])

  const onDragEnd = useCallback(() => {
    setActiveEntityId(null)
    syncOverDestination(null)
  }, [syncOverDestination])

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLElement>) => {
      const destination = toDestination(event.currentTarget.dataset.destination)

      if (!destination) {
        return
      }

      syncOverDestination(destination)
    },
    [syncOverDestination],
  )

  const onDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      const destination = toDestination(event.currentTarget.dataset.destination)

      if (!destination) {
        return
      }

      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      syncOverDestination(destination)
    },
    [syncOverDestination],
  )

  const onDragLeave = useCallback(
    (event: DragEvent<HTMLElement>) => {
      const destination = toDestination(event.currentTarget.dataset.destination)

      if (!destination) {
        return
      }

      const relatedTarget = event.relatedTarget

      if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
        return
      }

      if (overDestinationRef.current === destination) {
        syncOverDestination(null)
      }
    },
    [syncOverDestination],
  )

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      const destination = toDestination(event.currentTarget.dataset.destination)

      if (!destination) {
        return
      }

      event.preventDefault()

      const entityId = event.dataTransfer.getData(DRAG_ENTITY_TYPE) || event.dataTransfer.getData(FALLBACK_TEXT_TYPE)

      if (!entityId) {
        setActiveEntityId(null)
        syncOverDestination(null)
        return
      }

      moveEntity(entityId, destination)
      setActiveEntityId(null)
      syncOverDestination(null)
    },
    [moveEntity, syncOverDestination],
  )

  const draggableProps: NativeDraggableProps = {
    draggable: true,
    onDragStart,
    onDragEnd,
  }

  const dropzoneProps: NativeDropzoneProps = {
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  }

  return {
    activeEntityId,
    overDestination,
    draggableProps,
    dropzoneProps,
  }
}
