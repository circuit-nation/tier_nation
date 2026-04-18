import { useCallback, useEffect, useRef, useState, type DragEvent, type HTMLAttributes } from 'react'

import type { BoardDestination } from '@/store/voting-store'
import { TIER_VALUES, type TierValue } from '@/types'

type MoveEntityFn = (entityId: string, toTier: BoardDestination) => void
export type NativeDraggableProps = Pick<HTMLAttributes<HTMLElement>, 'draggable' | 'onDragStart' | 'onDrag' | 'onDragEnd'>
export type NativeDropzoneProps = Pick<HTMLAttributes<HTMLElement>, 'onDragEnter' | 'onDragOver' | 'onDragLeave' | 'onDrop'>

const DRAG_ENTITY_TYPE = 'application/x-tier-nation-entity-id'
const FALLBACK_TEXT_TYPE = 'text/plain'
const AUTO_SCROLL_EDGE_THRESHOLD = 150
const AUTO_SCROLL_MAX_STEP = 24

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
  const pointerClientYRef = useRef<number | null>(null)
  const scrollFrameRef = useRef<number | null>(null)

  const stopAutoScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = null
    }
  }, [])

  const autoScrollStep = useCallback(function step() {
    const pointerY = pointerClientYRef.current

    if (pointerY === null) {
      scrollFrameRef.current = null
      return
    }

    const viewportHeight = window.innerHeight
    const topEdge = AUTO_SCROLL_EDGE_THRESHOLD
    const bottomEdge = viewportHeight - AUTO_SCROLL_EDGE_THRESHOLD
    let delta = 0

    if (pointerY < topEdge) {
      delta = -Math.ceil(((topEdge - pointerY) / topEdge) * AUTO_SCROLL_MAX_STEP)
    } else if (pointerY > bottomEdge) {
      delta = Math.ceil(((pointerY - bottomEdge) / AUTO_SCROLL_EDGE_THRESHOLD) * AUTO_SCROLL_MAX_STEP)
    }

    if (delta === 0) {
      scrollFrameRef.current = null
      return
    }

    const scrollBefore = window.scrollY
    window.scrollBy({ top: delta, behavior: 'auto' })
    const scrollAfter = window.scrollY

    if (scrollAfter === scrollBefore) {
      scrollFrameRef.current = null
      return
    }

    scrollFrameRef.current = window.requestAnimationFrame(step)
  }, [])

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
    pointerClientYRef.current = event.clientY || null
    setActiveEntityId(entityId)
  }, [])

  const onDrag = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!activeEntityId) {
        return
      }

      if (event.clientY > 0) {
        pointerClientYRef.current = event.clientY
      }

      const pointerY = pointerClientYRef.current

      if (pointerY === null) {
        return
      }

      const nearEdge = pointerY < AUTO_SCROLL_EDGE_THRESHOLD || pointerY > window.innerHeight - AUTO_SCROLL_EDGE_THRESHOLD

      if (nearEdge) {
        if (scrollFrameRef.current === null) {
          scrollFrameRef.current = window.requestAnimationFrame(autoScrollStep)
        }
        return
      }

      stopAutoScroll()
    },
    [activeEntityId, autoScrollStep, stopAutoScroll],
  )

  const onDragEnd = useCallback(() => {
    pointerClientYRef.current = null
    stopAutoScroll()
    setActiveEntityId(null)
    syncOverDestination(null)
  }, [stopAutoScroll, syncOverDestination])

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
        pointerClientYRef.current = null
        stopAutoScroll()
        setActiveEntityId(null)
        syncOverDestination(null)
        return
      }

      moveEntity(entityId, destination)
      pointerClientYRef.current = null
      stopAutoScroll()
      setActiveEntityId(null)
      syncOverDestination(null)
    },
    [moveEntity, stopAutoScroll, syncOverDestination],
  )

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current)
      }
    }
  }, [])

  const draggableProps: NativeDraggableProps = {
    draggable: true,
    onDragStart,
    onDrag,
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
