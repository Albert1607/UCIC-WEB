import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSiteContent } from '@/lib/content'
import { createClient } from '@/lib/supabase/server'
import { TeamMember, Experience, TimelineItem } from '@/types'
import SectionLabel from '@/components/SectionLabel'
import ScrollingStrip from '@/components/ScrollingStrip'

export const metadata: Metadata = { title: 'About Us' }

export default async function AboutPage() {
  const content = await getSiteContent()
  const supabase = await createClient()

  const [{ data: teamData }, { data: expData }, { data: timelineData }] = await Promise.all([
    supabase.from('team_members').select('*').order('sort_order'),
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('timeline_items').select('*').order('sort_order'),
  ])

  const team: TeamMember[] = teamData ?? []
  const experiences: Experience[] = expData ?? []
  const timeline: TimelineItem[] = timelineData ?? []

  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <SectionLabel letter="A" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1
              className="heading-display text-6xl sm:text-7xl lg:text-8xl mb-6"
              style={{ color: 'var(--color-navy)' }}
            >
              {content['about_title'] || 'About Us'}
            </h1>
            <p
              className="text-lg leading-relaxed opacity-70 mb-8"
              style={{ color: 'var(--color-navy)' }}
            >
              {content['about_intro'] ||
                'We are the Universitas Ciputra International Community — a student-led organization dedicated to fostering international connections, cross-cultural understanding, and global opportunities within UC.'}
            </p>
          </div>
          <div
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{ height: '380px', background: 'linear-gradient(135deg, var(--color-dusty-blue) 0%, var(--color-navy) 100%)' }}
          >
            {content['about_image_url'] ? (
              <Image
                src={content['about_image_url']}
                alt={content['about_title'] || 'About Us'}
                fill
                className="img-cover object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <span className="heading-display text-8xl" style={{ color: 'var(--color-cream)' }}>UCIC</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <ScrollingStrip text={content['scrolling_strip_text'] || 'UCIC · About Us · Mission · Vision · Community ·'} />

      {/* ====== MISSION & VISION ====== */}
      <section className="py-20" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel letter="B" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2
                className="heading-section text-3xl sm:text-4xl mb-5"
                style={{ color: 'var(--color-navy)' }}
              >
                {content['about_mission_title'] || 'Our Mission'}
              </h2>
              <p
                className="text-base leading-relaxed opacity-70"
                style={{ color: 'var(--color-navy)' }}
              >
                {content['about_mission'] ||
                  'To create an inclusive community where every UC student feels at home, grows as a global citizen, and builds meaningful connections.'}
              </p>
            </div>
            <div>
              <h2
                className="heading-section text-3xl sm:text-4xl mb-5"
                style={{ color: 'var(--color-navy)' }}
              >
                {content['about_vision_title'] || 'Our Vision'}
              </h2>
              <p
                className="text-base leading-relaxed opacity-70"
                style={{ color: 'var(--color-navy)' }}
              >
                {content['about_vision'] ||
                  'A vibrant international campus community that celebrates diversity and empowers students to thrive in a global world.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== EXPERIENCES ====== */}
      {experiences.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6">
          <SectionLabel letter="C" />
          <h2
            className="heading-section text-3xl sm:text-4xl mb-10"
            style={{ color: 'var(--color-navy)' }}
          >
            What We Do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, i) => (
              <div key={exp.id} className="card-cream p-6">
                <div
                  className="heading-display text-5xl mb-3 opacity-15"
                  style={{ color: 'var(--color-navy)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                {exp.year && (
                  <span
                    className="pill pill-dusty mb-3 inline-block"
                  >
                    {exp.year}
                  </span>
                )}
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-navy)' }}>
                  {exp.title}
                </h3>
                {exp.description && (
                  <p className="text-sm opacity-60 leading-relaxed" style={{ color: 'var(--color-navy)' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====== TIMELINE ====== */}
      {timeline.length > 0 && (
        <section className="py-20" style={{ background: 'var(--color-pale-blue)' }}>
          <div className="max-w-4xl mx-auto px-6">
            <SectionLabel letter="D" />
            <h2
              className="heading-section text-3xl sm:text-4xl mb-12"
              style={{ color: 'var(--color-navy)' }}
            >
              Our Journey
            </h2>
            <div className="space-y-3">
              {timeline.map((item) => (
                <div
                  key={item.id}
                  className="timeline-bar flex items-center gap-6 p-5 cursor-default"
                >
                  <span
                    className="heading-display text-2xl min-w-[72px]"
                    style={{ color: 'var(--color-navy)', opacity: 0.7 }}
                  >
                    {item.year}
                  </span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--color-navy)' }}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-sm opacity-60 mt-0.5" style={{ color: 'var(--color-navy)' }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ScrollingStrip text={content['scrolling_strip_text'] || 'UCIC · Our Team · Meet the Members ·'} />

      {/* ====== TEAM MEMBERS ====== */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <SectionLabel letter="E" />
        <h2
          className="heading-section text-3xl sm:text-4xl mb-10"
          style={{ color: 'var(--color-navy)' }}
        >
          {content['team_section_title'] || 'Meet the Team'}
        </h2>

        {team.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {team.map((member) => (
              <div key={member.id} className="card-cream p-5 text-center">
                {/* Photo */}
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-dusty-blue), var(--color-navy))',
                  }}
                >
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="img-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span
                        className="heading-display text-2xl opacity-30"
                        style={{ color: 'var(--color-cream)' }}
                      >
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--color-navy)' }}>
                  {member.name}
                </div>
                <div
                  className="text-xs pill pill-dusty inline-block"
                  style={{ fontSize: '0.7rem' }}
                >
                  {member.role}
                </div>
                {member.bio && (
                  <p className="text-xs opacity-50 mt-2 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-navy)' }}>
                    {member.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ border: '1.5px dashed rgba(156,182,215,0.4)' }}
          >
            <p className="opacity-40 italic" style={{ color: 'var(--color-navy)' }}>
              Team members will appear here once added in the admin panel.
            </p>
          </div>
        )}
      </section>

      {/* ====== CTA ====== */}
      <section className="py-16 max-w-7xl mx-auto px-6 text-center">
        <Link href="/events" className="btn-primary">
          See Our Events
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  )
}
