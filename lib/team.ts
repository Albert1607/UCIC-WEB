import { TeamMember } from '@/types'

export type TeamCategory = 'HOD' | 'COORS' | 'MEMBER'

export interface ParsedTeamMember extends TeamMember {
  category: TeamCategory
  division: string
  title: string
}

export const CATEGORY_LABELS: Record<TeamCategory, string> = {
  HOD: 'Head of Department (HOD)',
  COORS: 'Coordinators (COORS)',
  MEMBER: 'Members',
}

export const CATEGORY_DESCRIPTIONS: Record<TeamCategory, string> = {
  HOD: 'Executive leadership and governing board of UCIC.',
  COORS: 'Division leaders coordinating key initiatives and operations.',
  MEMBER: 'Active committee members driving projects across divisions.',
}

/**
 * Parses raw role string into structured { category, division, title }
 */
export function parseMemberRole(rawRole: string | null | undefined): {
  category: TeamCategory
  division: string
  title: string
} {
  const role = (rawRole || '').trim()
  if (!role) {
    return { category: 'MEMBER', division: '', title: 'Member' }
  }

  // Check explicit prefix: "HOD • President" or "HOD - President" or "HOD: President"
  if (/^HOD\b/i.test(role)) {
    const remainder = role.replace(/^HOD[^\w]*/i, '').trim()
    const parts = remainder.split(/[•|\-:]/).map((s) => s.trim()).filter(Boolean)
    if (parts.length > 1) {
      return { category: 'HOD', division: parts[0], title: parts.slice(1).join(' • ') }
    }
    return { category: 'HOD', division: '', title: parts[0] || 'Executive' }
  }

  // Check explicit prefix: "COORS • Creative • Coordinator" or "COOR • Creative"
  if (/^COORS?\b/i.test(role)) {
    const remainder = role.replace(/^COORS?[^\w]*/i, '').trim()
    const parts = remainder.split(/[•|\-:]/).map((s) => s.trim()).filter(Boolean)
    if (parts.length > 1) {
      return { category: 'COORS', division: parts[0], title: parts.slice(1).join(' • ') }
    }
    if (parts.length === 1) {
      return { category: 'COORS', division: parts[0], title: 'Coordinator' }
    }
    return { category: 'COORS', division: '', title: 'Coordinator' }
  }

  // Check explicit prefix: "MEMBER • Event • Staff" or "MEMBER • Event"
  if (/^MEMBER\b/i.test(role)) {
    const remainder = role.replace(/^MEMBER[^\w]*/i, '').trim()
    const parts = remainder.split(/[•|\-:]/).map((s) => s.trim()).filter(Boolean)
    if (parts.length > 1) {
      return { category: 'MEMBER', division: parts[0], title: parts.slice(1).join(' • ') }
    }
    if (parts.length === 1) {
      return { category: 'MEMBER', division: parts[0], title: 'Member' }
    }
    return { category: 'MEMBER', division: '', title: 'Member' }
  }

  // Fallback: heuristic classification from role keywords
  const lower = role.toLowerCase()
  if (
    lower.includes('president') ||
    lower.includes('secretary') ||
    lower.includes('treasurer') ||
    lower.includes('ketua') ||
    lower.includes('wakil') ||
    lower.includes('bph')
  ) {
    return { category: 'HOD', division: '', title: role }
  }

  if (
    lower.includes('coordinator') ||
    lower.includes('coor') ||
    lower.includes('head of') ||
    lower.includes('kadiv')
  ) {
    // e.g. "Coordinator ITS" -> division: "ITS", title: "Coordinator"
    const cleaned = role.replace(/coordinator/i, '').replace(/head of/i, '').trim()
    return { category: 'COORS', division: cleaned, title: role }
  }

  return { category: 'MEMBER', division: '', title: role }
}

/**
 * Formats category, division, and title into a single storage string
 */
export function formatMemberRole(
  category: TeamCategory,
  division: string,
  title: string
): string {
  const cleanTitle = (title || '').trim()
  const cleanDivision = (division || '').trim()

  if (category === 'HOD') {
    return cleanDivision
      ? `HOD • ${cleanDivision} • ${cleanTitle || 'Executive'}`
      : `HOD • ${cleanTitle || 'Executive'}`
  }

  if (category === 'COORS') {
    if (cleanDivision && cleanTitle) {
      return `COORS • ${cleanDivision} • ${cleanTitle}`
    }
    if (cleanDivision) {
      return `COORS • ${cleanDivision} • Coordinator`
    }
    return `COORS • ${cleanTitle || 'Coordinator'}`
  }

  // MEMBER
  if (cleanDivision && cleanTitle) {
    return `MEMBER • ${cleanDivision} • ${cleanTitle}`
  }
  if (cleanDivision) {
    return `MEMBER • ${cleanDivision} • Member`
  }
  return `MEMBER • ${cleanTitle || 'Member'}`
}

/**
 * Enhances team members list with parsed category, division, and title
 */
export function parseTeamMembers(members: TeamMember[]): ParsedTeamMember[] {
  return members.map((m) => {
    const parsed = parseMemberRole(m.role)
    return {
      ...m,
      ...parsed,
    }
  })
}
