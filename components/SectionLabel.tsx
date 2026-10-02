interface SectionLabelProps {
  letter: string
  className?: string
}

export default function SectionLabel({ letter, className = '' }: SectionLabelProps) {
  return (
    <div className={`section-label ${className}`}>
      <span className="section-label-letter">{letter}</span>
      <div className="section-label-divider" />
    </div>
  )
}
