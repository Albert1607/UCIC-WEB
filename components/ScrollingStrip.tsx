interface ScrollingStripProps {
  text: string
}

export default function ScrollingStrip({ text }: ScrollingStripProps) {
  // Duplicate text so it scrolls seamlessly
  const doubled = `${text}  ${text}  `

  return (
    <div
      className="scrolling-strip py-3 select-none"
      style={{
        background: 'var(--color-dusty-blue)',
        color: 'var(--color-navy)',
        overflow: 'hidden',
      }}
    >
      <div className="scrolling-strip-inner">
        <span className="text-xs font-bold tracking-widest uppercase">
          {doubled}
          {doubled}
        </span>
      </div>
    </div>
  )
}
