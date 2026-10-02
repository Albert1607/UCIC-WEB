'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TeamMember } from '@/types'
import {
  TeamCategory,
  ParsedTeamMember,
  parseTeamMembers,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
} from '@/lib/team'

interface TeamSectionProps {
  initialMembers: TeamMember[]
}

const CATEGORIES: { key: TeamCategory; label: string; badge: string }[] = [
  { key: 'HOD', label: 'Head of Department', badge: 'HOD' },
  { key: 'COORS', label: 'Coordinators', badge: 'COORS' },
  { key: 'MEMBER', label: 'Members', badge: 'MEMBER' },
]

export default function TeamSection({ initialMembers }: TeamSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | TeamCategory>('ALL')

  const parsedMembers: ParsedTeamMember[] = parseTeamMembers(initialMembers)

  const hodList = parsedMembers.filter((m) => m.category === 'HOD')
  const coorsList = parsedMembers.filter((m) => m.category === 'COORS')
  const memberList = parsedMembers.filter((m) => m.category === 'MEMBER')

  const getFilteredGroups = (): { category: TeamCategory; list: ParsedTeamMember[] }[] => {
    if (selectedFilter === 'ALL') {
      const groups: { category: TeamCategory; list: ParsedTeamMember[] }[] = []
      if (hodList.length > 0) groups.push({ category: 'HOD', list: hodList })
      if (coorsList.length > 0) groups.push({ category: 'COORS', list: coorsList })
      if (memberList.length > 0) groups.push({ category: 'MEMBER', list: memberList })
      return groups
    }
    if (selectedFilter === 'HOD') return [{ category: 'HOD', list: hodList }]
    if (selectedFilter === 'COORS') return [{ category: 'COORS', list: coorsList }]
    return [{ category: 'MEMBER', list: memberList }]
  }

  const groups = getFilteredGroups()

  return (
    <div className="space-y-12">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setSelectedFilter('ALL')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            selectedFilter === 'ALL'
              ? 'bg-[var(--color-navy)] text-[var(--color-cream)] shadow-md'
              : 'bg-white/70 text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40 hover:bg-white'
          }`}
        >
          All Members ({parsedMembers.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = parsedMembers.filter((m) => m.category === cat.key).length
          const isActive = selectedFilter === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedFilter(cat.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-navy)] text-[var(--color-cream)] shadow-md'
                  : 'bg-white/70 text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40 hover:bg-white'
              }`}
            >
              {cat.badge} ({count})
            </button>
          )
        })}
      </div>

      {/* Render Categorized Groups */}
      {groups.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-[var(--color-dusty-blue)]/40">
          <p className="opacity-50 text-sm text-[var(--color-navy)] italic">
            No members in this category yet.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.category} className="space-y-6">
            {/* Category Header */}
            <div className="border-b border-[var(--color-dusty-blue)]/30 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--color-navy)] text-[var(--color-cream)]">
                    {group.category}
                  </span>
                  <h3
                    className="heading-display text-2xl text-[var(--color-navy)]"
                  >
                    {CATEGORY_LABELS[group.category]}
                  </h3>
                </div>
                <p className="text-xs opacity-60 text-[var(--color-navy)] mt-1">
                  {CATEGORY_DESCRIPTIONS[group.category]}
                </p>
              </div>
              <span className="text-xs font-semibold opacity-50 text-[var(--color-navy)]">
                {group.list.length} member{group.list.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Member Cards Grid — Scaled Down 40% (Compact 5-col on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
              {group.list.map((member) => {
                const tagLabel = member.division
                  ? `${member.category} · ${member.division}`
                  : member.category

                return (
                  <div
                    key={member.id}
                    className="group card-cream rounded-xl overflow-hidden border border-[var(--color-dusty-blue)]/40 shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo (Compact 4:5 aspect ratio) */}
                      <div className="relative aspect-[4/5] w-full bg-[var(--color-dusty-blue)]/20 overflow-hidden">
                        {member.photo_url ? (
                          <Image
                            src={member.photo_url}
                            alt={member.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
                            style={{
                              background:
                                'linear-gradient(135deg, var(--color-dusty-blue) 0%, var(--color-navy) 100%)',
                            }}
                          >
                            <div className="relative w-10 h-10 mb-1.5 opacity-30">
                              <Image
                                src="/logo-white.png"
                                alt="UCIC"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span
                              className="text-[9px] uppercase tracking-widest font-semibold opacity-75"
                              style={{ color: 'var(--color-cream)' }}
                            >
                              No Photo
                            </span>
                          </div>
                        )}
                        {/* Subtle bottom transition */}
                        <div
                          className="absolute inset-x-0 bottom-0 h-4 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(to top, var(--color-cream), transparent)',
                          }}
                        />
                      </div>

                      {/* Card Body */}
                      <div
                        className="p-3 sm:p-3.5"
                        style={{ background: 'var(--color-cream)' }}
                      >
                        {/* Tag: Category + Division */}
                        <div
                          className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5 truncate"
                          style={{ color: 'var(--color-navy)' }}
                          title={tagLabel}
                        >
                          {tagLabel}
                        </div>

                        {/* Name */}
                        <h4
                          className="heading-display text-base tracking-wide uppercase leading-tight mb-1 truncate"
                          style={{ color: 'var(--color-navy)' }}
                          title={member.name}
                        >
                          {member.name}
                        </h4>

                        {/* Specific Title / Role */}
                        <div className="mb-1.5">
                          <span
                            className="text-[10px] pill pill-dusty !py-0.5 !px-2 inline-block font-medium truncate max-w-full"
                            title={member.title}
                          >
                            {member.title}
                          </span>
                        </div>

                        {/* Bio */}
                        {member.bio && (
                          <p
                            className="text-[11px] leading-snug opacity-65 line-clamp-2 mt-1"
                            style={{ color: 'var(--color-navy)' }}
                          >
                            {member.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
