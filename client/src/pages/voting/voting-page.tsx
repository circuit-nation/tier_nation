import { DndContext, DragOverlay, closestCenter, useDroppable, type DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useDragDrop } from '@/hooks/use-drag-drop'
import { useVoting } from '@/hooks/use-voting'
import { cn } from '@/lib/utils'
import { DriverCard } from '@/pages/voting/components/driver-card'
import { SubmitBar } from '@/pages/voting/components/submit-bar'
import { TierBoard } from '@/pages/voting/components/tier-board'

export function VotingPage() {
  const { listId } = useParams()
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState('')

  const { list, tiers, board, pool, entitiesById, selectedCount, totalCount, hasVotes, moveEntity, resetBoard, buildVotePayload } =
    useVoting(listId)

  const { sensors, onDragEnd } = useDragDrop(moveEntity)

  const { setNodeRef: setPoolRef, isOver: isPoolOver } = useDroppable({
    id: 'pool-drop',
  })

  const activeEntity = activeEntityId ? entitiesById[activeEntityId] : undefined

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEntityId(String(event.active.id))
  }

  const handleDragEnd = (event: Parameters<typeof onDragEnd>[0]) => {
    onDragEnd(event)
    setActiveEntityId(null)
  }

  const handleSubmit = () => {
    const payload = buildVotePayload('mock-user')
    console.log('Mock POST /vote payload', payload)

    const submittedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    setSubmitMessage(`Submitted ${payload.length} vote placements at ${submittedAt}`)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveEntityId(null)}
    >
      <div className="space-y-4">
        <section className="">
          <div className="mb-4">
            <p className="text-sm font-semibold tracking-[0.18em] text-foreground sm:text-base">{list.name}</p>
          </div>

          <TierBoard tiers={tiers} board={board} entitiesById={entitiesById} />

          <section
            ref={setPoolRef}
            className={cn(
              'mt-4 rounded-lg border border-border/90 p-3 transition-all sm:p-4',
              isPoolOver && 'border-primary/45 ring-2 ring-ring/45',
            )}
          >
            <div className="flex flex-wrap flex-row items-center gap-6">
              {pool.map((driver) => (
                <DriverCard key={driver.id} entity={driver} source="POOL" className="w-fit" />
              ))}
            </div>
          </section>

          <div className="mt-4 flex justify-end">
            <SubmitBar
              selectedCount={selectedCount}
              totalCount={totalCount}
              disabled={!hasVotes}
              onSubmit={handleSubmit}
              onReset={resetBoard}
            />
          </div>
        </section>

        {submitMessage ? (
          <p className="rounded-xl border border-primary/35 bg-primary/12 px-3 py-2 text-xs font-medium text-primary">{submitMessage}</p>
        ) : null}
      </div>

      <DragOverlay>
        {activeEntity ? <DriverCard entity={activeEntity} source="POOL" draggable={false} className="w-24" /> : null}
      </DragOverlay>
    </DndContext>
  )
}
