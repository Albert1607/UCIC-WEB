'use client'

import { useState, useCallback } from 'react'
import { FormField, FieldOption } from '@/types'

interface FormRendererProps {
  fields: FormField[]
  onSubmit: (answers: Record<string, unknown>) => Promise<{ error?: string }>
  submitting?: boolean
}

export default function FormRenderer({ fields, onSubmit, submitting: externalSubmitting }: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const setValue = useCallback((fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.field_type === 'section_header') return
      if (!field.required) return
      const val = answers[field.id]
      if (val === undefined || val === null || val === '') {
        newErrors[field.id] = 'This field is required.'
      }
      if (field.field_type === 'checkboxes' && Array.isArray(val) && val.length === 0) {
        newErrors[field.id] = 'Please select at least one option.'
      }
    })
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    setSubmitError('')
    const result = await onSubmit(answers)
    setSubmitting(false)
    if (result.error) {
      setSubmitError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div
        className="card-cream p-10 text-center max-w-lg mx-auto"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(156,182,215,0.2)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-navy)' }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2
          className="heading-display text-3xl mb-3"
          style={{ color: 'var(--color-navy)' }}
        >
          You&apos;re Registered!
        </h2>
        <p className="opacity-60 text-sm leading-relaxed" style={{ color: 'var(--color-navy)' }}>
          Thank you for signing up. We look forward to seeing you!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto" noValidate>
      {fields.map((field) => (
        <div key={field.id}>
          {field.field_type === 'section_header' ? (
            <div className="mt-6 mb-2">
              <div
                className="font-bold text-base border-b pb-2"
                style={{
                  color: 'var(--color-navy)',
                  borderColor: 'rgba(156,182,215,0.4)',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                }}
              >
                {field.label}
              </div>
              {field.help_text && (
                <p className="form-help mt-1">{field.help_text}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="form-label" htmlFor={field.id}>
                {field.label}
                {field.required && (
                  <span className="ml-1" style={{ color: '#8b2424' }}>*</span>
                )}
              </label>
              {field.help_text && (
                <p className="form-help mb-2">{field.help_text}</p>
              )}
              <FieldInput
                field={field}
                value={answers[field.id]}
                onChange={(val) => setValue(field.id, val)}
              />
              {errors[field.id] && (
                <p className="form-error">{errors[field.id]}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {submitError && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: 'rgba(220,80,80,0.08)', color: '#8b2424', border: '1px solid rgba(220,80,80,0.2)' }}
        >
          {submitError}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting || externalSubmitting}
          className="btn-primary w-full justify-center"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Submitting…' : 'Submit Registration'}
        </button>
      </div>
    </form>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: unknown
  onChange: (val: unknown) => void
}) {
  const strVal = (value as string) ?? ''
  const arrVal = Array.isArray(value) ? (value as string[]) : []

  switch (field.field_type) {
    case 'short_text':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <input
          id={field.id}
          type={field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : 'text'}
          className="form-input"
          placeholder={field.placeholder ?? ''}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'long_text':
      return (
        <textarea
          id={field.id}
          className="form-input"
          rows={4}
          placeholder={field.placeholder ?? ''}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      )

    case 'date':
      return (
        <input
          id={field.id}
          type="date"
          className="form-input"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'dropdown':
      return (
        <select
          id={field.id}
          className="form-input"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{field.placeholder || 'Select an option'}</option>
          {(field.options ?? []).map((opt: FieldOption) => (
            <option key={opt.id} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      )

    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((opt: FieldOption) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-colors"
              style={{
                background: strVal === opt.label ? 'rgba(156,182,215,0.15)' : 'transparent',
                border: '1.5px solid',
                borderColor: strVal === opt.label ? 'var(--color-dusty-blue)' : 'rgba(156,182,215,0.3)',
              }}
            >
              <input
                type="radio"
                name={field.id}
                value={opt.label}
                checked={strVal === opt.label}
                onChange={() => onChange(opt.label)}
                className="accent-[var(--color-navy)]"
              />
              <span className="text-sm" style={{ color: 'var(--color-navy)' }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )

    case 'checkboxes':
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((opt: FieldOption) => {
            const checked = arrVal.includes(opt.label)
            return (
              <label
                key={opt.id}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-colors"
                style={{
                  background: checked ? 'rgba(156,182,215,0.15)' : 'transparent',
                  border: '1.5px solid',
                  borderColor: checked ? 'var(--color-dusty-blue)' : 'rgba(156,182,215,0.3)',
                }}
              >
                <input
                  type="checkbox"
                  value={opt.label}
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...arrVal, opt.label])
                    } else {
                      onChange(arrVal.filter((v) => v !== opt.label))
                    }
                  }}
                  className="accent-[var(--color-navy)]"
                />
                <span className="text-sm" style={{ color: 'var(--color-navy)' }}>
                  {opt.label}
                </span>
              </label>
            )
          })}
        </div>
      )

    case 'yes_no':
      return (
        <div className="flex gap-3">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className="flex-1 py-2.5 rounded-pill text-sm font-semibold transition-colors"
              style={{
                background: strVal === opt ? 'var(--color-navy)' : 'transparent',
                color: strVal === opt ? 'var(--color-cream)' : 'var(--color-navy)',
                border: '1.5px solid',
                borderColor: strVal === opt ? 'var(--color-navy)' : 'rgba(156,182,215,0.4)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )

    case 'file_upload':
      return (
        <input
          id={field.id}
          type="file"
          className="form-input"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      )

    default:
      return null
  }
}
