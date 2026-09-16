import { useId, useRef, useState } from 'react'
import { SERVICES_DATA } from '../data/siteData'

/**
 * Le Parc tenant intake.
 * Production path: POST /api/le-parc-inquiry (Vite proxies to the Node SMTP server).
 * Recipients are server-side MAIL_TO / MAIL_CC / MAIL_BCC.
 * Mailto is only used if that API is unreachable.
 */
export const LE_PARC_SECTION_ID = 'inquiry'
export const LE_PARC_PATH = '/CL'
export const LE_PARC_ADDRESS = '287 Park Avenue South, New York, NY 10010'
export const LE_PARC_EMAIL = 'info@clearviewglobal.com'
export const LE_PARC_PHONE = '212-920-1234'
export const LE_PARC_PHONE_HREF = 'tel:2129201234'
const INTAKE_EMAIL = LE_PARC_EMAIL
const INQUIRY_URL = '/api/le-parc-inquiry'

const SEAT_OPTIONS = [
  { value: '1-5', label: '1–5' },
  { value: '6-15', label: '6–15' },
  { value: '16-50', label: '16–50' },
  { value: '50+', label: '50+' },
]

const URGENCY_OPTIONS = [
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'planning', label: 'Planning ahead' },
]

const EMPTY = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  seats: '',
  urgency: 'this-month',
  message: '',
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

function validate(values) {
  const errors = {}
  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Enter your name.'
  }
  if (!values.company.trim()) {
    errors.company = 'Enter your company, suite, or workspace.'
  }
  if (!values.email.trim()) {
    errors.email = 'Enter a work email.'
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = 'Enter a phone number with at least 10 digits.'
  }
  if (!values.service) {
    errors.service = 'Choose a service, or “Not sure.”'
  }
  if (!values.seats) {
    errors.seats = 'Select seats or headcount.'
  }
  if (values.message.trim() && values.message.trim().length < 8) {
    errors.message = 'Add a bit more detail, or leave this blank.'
  }
  return errors
}

function buildInquiry(values) {
  const urgencyLabel = URGENCY_OPTIONS.find((item) => item.value === values.urgency)?.label || values.urgency
  const subject = `Le Parc tenant inquiry — ${values.company.trim()}`
  const message = [
    'Clearview Global — Le Parc / 287 Park Avenue South tenant inquiry',
    '',
    `Name: ${values.name.trim()}`,
    `Company / suite or workspace: ${values.company.trim()}`,
    `Email: ${values.email.trim()}`,
    `Phone: ${values.phone.trim() || '—'}`,
    `Service interest: ${values.service}`,
    `Seats / headcount: ${values.seats}`,
    `Urgency: ${urgencyLabel}`,
    '',
    'Message:',
    values.message.trim() || '—',
  ].join('\n')

  return { subject, urgencyLabel, message }
}

function buildMailto(values) {
  const { subject, message } = buildInquiry(values)
  return `mailto:${INTAKE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}

function buildInquiryPayload(values, honeypot, botcheck) {
  return {
    name: values.name.trim(),
    company: values.company.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    service: values.service,
    seats: values.seats,
    urgency: values.urgency,
    message: values.message.trim(),
    website: honeypot,
    botcheck: Boolean(botcheck),
  }
}

function isUnreachable(error) {
  return error instanceof TypeError
}

async function postInquiry(payload) {
  const response = await fetch(INQUIRY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success) {
    const error = new Error(response.status === 429 ? 'too-many' : 'submit-failed')
    error.status = response.status
    throw error
  }
}

const glassCard = {
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid var(--border-md)',
  boxShadow: '0 12px 64px var(--shadow), 0 4px 24px var(--shadow)',
}

function Field({ id, label, error, hint, required, children }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label htmlFor={id} className="text-xs font-medium tracking-wide" style={{ color: 'var(--text-label)' }}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-xs leading-snug" style={{ color: 'var(--text-dim)' }}>
          {hint}
        </p>
      ) : null}
      {typeof children === 'function' ? children({ describedBy, errorId }) : children}
      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-snug" style={{ color: '#b42318' }}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

function inputClass(invalid) {
  return `le-parc-field${invalid ? ' is-invalid' : ''}`
}

export default function LeParcIntake() {
  const formId = useId()
  const formRef = useRef(null)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [mailtoHref, setMailtoHref] = useState('')
  const [failReason, setFailReason] = useState('')

  const setField = (key) => (event) => {
    const next = { ...values, [key]: event.target.value }
    setValues(next)
    if (status === 'failed') setStatus('idle')
    if (errors[key] || status === 'error') {
      const nextErrors = validate(next)
      setErrors((prev) => {
        const merged = { ...prev }
        if (nextErrors[key]) merged[key] = nextErrors[key]
        else delete merged[key]
        return merged
      })
      if (Object.keys(nextErrors).length === 0) setStatus('idle')
    }
  }

  const focusFirstError = (nextErrors) => {
    const order = ['name', 'company', 'email', 'phone', 'service', 'seats', 'urgency', 'message']
    const first = order.find((key) => nextErrors[key])
    if (!first) return
    const field = formRef.current?.querySelector(`[name="${first}"]`)
    if (field && typeof field.focus === 'function') field.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus('error')
      focusFirstError(nextErrors)
      return
    }

    const formData = new FormData(event.currentTarget)
    const honeypot = String(formData.get('website') || '').trim()
    if (honeypot || formData.get('botcheck')) {
      setStatus('success')
      return
    }

    setStatus('submitting')
    try {
      await postInquiry(buildInquiryPayload(values, honeypot, formData.get('botcheck')))
      setMailtoHref('')
      setFailReason('')
      setStatus('success')
    } catch (error) {
      if (isUnreachable(error)) {
        const href = buildMailto(values)
        setMailtoHref(href)
        setFailReason('unreachable')
        setStatus('failed')
        return
      }
      setMailtoHref('')
      setFailReason(error?.message === 'too-many' ? 'too-many' : 'submit-failed')
      setStatus('failed')
    }
  }

  const resetForm = () => {
    setValues(EMPTY)
    setErrors({})
    setStatus('idle')
    setMailtoHref('')
    setFailReason('')
  }

  const submitting = status === 'submitting'

  return (
    <div id={LE_PARC_SECTION_ID} className="le-parc-intake">
      <div className="le-parc-form-card rounded-2xl p-5 sm:p-6 md:p-8" style={glassCard}>
              {status === 'success' || status === 'mailto' ? (
                <div role="status" aria-live="polite">
                  <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-subtle)' }}>
                    {status === 'success' ? 'Inquiry sent' : 'Inquiry drafted'}
                  </p>
                  <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-title)' }}>
                    {status === 'success' ? 'Clearview has your details' : 'Your email app should open next'}
                  </h2>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-body)' }}>
                    {status === 'success'
                      ? `This went to ${INTAKE_EMAIL}. We’ll reply at the email you entered.`
                      : `The message is addressed to ${INTAKE_EMAIL} with your Le Parc details in the body. If nothing opened, use the link below.`}
                  </p>
                  {status === 'mailto' ? (
                    <a
                      href={mailtoHref}
                      className="le-parc-submit inline-flex items-center justify-center w-full px-6 rounded-lg text-sm font-semibold text-[#03060e] transition-all duration-300 hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg, #29b6ff 0%, #0d9ee0 100%)', boxShadow: '0 2px 14px rgba(41,182,255,0.3)' }}
                    >
                      Open email to Clearview
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="le-parc-submit inline-flex items-center justify-center w-full px-6 rounded-lg text-sm font-semibold text-[#03060e] transition-all duration-300 hover:brightness-110"
                      style={{
                        background: 'linear-gradient(135deg, #29b6ff 0%, #0d9ee0 100%)',
                        boxShadow: '0 2px 14px rgba(41,182,255,0.3)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Send another inquiry
                    </button>
                  )}
                  {status === 'mailto' ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="le-parc-submit mt-3 w-full text-sm font-medium"
                      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Send another inquiry
                    </button>
                  ) : null}
                </div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="relative"
                  aria-labelledby={`${formId}-heading`}
                >
                  <p className="text-xs font-medium tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-subtle)' }}>
                    Tenant intake
                  </p>
                  <h2 id={`${formId}-heading`} className="text-xl font-bold mb-1" style={{ color: 'var(--text-title)' }}>
                    Tell us how to reach you
                  </h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                    {`Required fields are marked. Submitting sends this to ${INTAKE_EMAIL}.`}
                  </p>

                  {status === 'error' ? (
                    <p role="alert" className="text-sm mb-4" style={{ color: '#b42318' }}>
                      Check the highlighted fields, then submit again.
                    </p>
                  ) : null}

                  {status === 'failed' ? (
                    <div role="alert" className="text-sm mb-4" style={{ color: '#b42318' }}>
                      <p>
                        {failReason === 'too-many'
                          ? 'Too many inquiries from this network. Wait a few minutes, then try again.'
                          : failReason === 'unreachable'
                            ? 'We couldn’t reach the inquiry service. Try again, or open an email draft.'
                            : 'We couldn’t deliver this just now. Try again in a few minutes.'}
                      </p>
                      {mailtoHref ? (
                        <a href={mailtoHref} className="inline-block mt-2 font-semibold" style={{ color: '#176fb4' }}>
                          Open email to Clearview
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id={`${formId}-name`} label="Name" required error={errors.name}>
                      {({ describedBy }) => (
                        <input
                          id={`${formId}-name`}
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={values.name}
                          onChange={setField('name')}
                          className={inputClass(errors.name)}
                          aria-required="true"
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={describedBy}
                        />
                      )}
                    </Field>
                    <Field id={`${formId}-company`} label="Company / suite or workspace" required error={errors.company}>
                      {({ describedBy }) => (
                        <input
                          id={`${formId}-company`}
                          name="company"
                          type="text"
                          autoComplete="organization"
                          placeholder="Firm name, suite, or desk"
                          value={values.company}
                          onChange={setField('company')}
                          className={inputClass(errors.company)}
                          aria-required="true"
                          aria-invalid={Boolean(errors.company)}
                          aria-describedby={describedBy}
                        />
                      )}
                    </Field>
                    <Field id={`${formId}-email`} label="Email" required error={errors.email}>
                      {({ describedBy }) => (
                        <input
                          id={`${formId}-email`}
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={values.email}
                          onChange={setField('email')}
                          className={inputClass(errors.email)}
                          aria-required="true"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={describedBy}
                        />
                      )}
                    </Field>
                    <Field id={`${formId}-phone`} label="Phone" error={errors.phone}>
                      {({ describedBy }) => (
                        <input
                          id={`${formId}-phone`}
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={values.phone}
                          onChange={setField('phone')}
                          className={inputClass(errors.phone)}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={describedBy}
                        />
                      )}
                    </Field>
                    <Field id={`${formId}-service`} label="Service interest" required error={errors.service}>
                      {({ describedBy }) => (
                        <select
                          id={`${formId}-service`}
                          name="service"
                          value={values.service}
                          onChange={setField('service')}
                          className={inputClass(errors.service)}
                          aria-required="true"
                          aria-invalid={Boolean(errors.service)}
                          aria-describedby={describedBy}
                        >
                          <option value="">Select a service</option>
                          {SERVICES_DATA.map((service) => (
                            <option key={service.title} value={service.title}>
                              {service.title}
                            </option>
                          ))}
                          <option value="Not sure — help me choose">Not sure — help me choose</option>
                        </select>
                      )}
                    </Field>
                    <Field id={`${formId}-seats`} label="Seats / headcount" required error={errors.seats}>
                      {({ describedBy }) => (
                        <select
                          id={`${formId}-seats`}
                          name="seats"
                          value={values.seats}
                          onChange={setField('seats')}
                          className={inputClass(errors.seats)}
                          aria-required="true"
                          aria-invalid={Boolean(errors.seats)}
                          aria-describedby={describedBy}
                        >
                          <option value="">Select a range</option>
                          {SEAT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                  </div>

                  <fieldset className="mt-5">
                    <legend className="text-xs font-medium tracking-wide mb-2" style={{ color: 'var(--text-label)' }}>
                      Urgency
                    </legend>
                    <div className="le-parc-urgency">
                      {URGENCY_OPTIONS.map((option) => {
                        const selected = values.urgency === option.value
                        return (
                          <label
                            key={option.value}
                            className="le-parc-urgency-option"
                            style={{
                              color: selected ? '#0b3d66' : 'var(--text-muted)',
                              background: selected ? 'rgba(41,182,255,0.16)' : 'transparent',
                              borderColor: selected ? 'rgba(41,182,255,0.45)' : 'var(--border-card)',
                            }}
                          >
                            <input
                              type="radio"
                              name="urgency"
                              value={option.value}
                              checked={selected}
                              onChange={setField('urgency')}
                            />
                            {option.label}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-5">
                    <Field id={`${formId}-message`} label="What do you need?" error={errors.message}>
                      {({ describedBy }) => (
                        <textarea
                          id={`${formId}-message`}
                          name="message"
                          rows={4}
                          value={values.message}
                          onChange={setField('message')}
                          className={inputClass(errors.message)}
                          aria-invalid={Boolean(errors.message)}
                          aria-describedby={describedBy}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="le-parc-honeypot" hidden aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                    <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="le-parc-submit mt-6 w-full px-6 rounded-lg text-sm font-semibold text-[#03060e] transition-all duration-300 hover:brightness-110 disabled:opacity-70"
                    style={{
                      background: 'linear-gradient(135deg, #29b6ff 0%, #0d9ee0 100%)',
                      boxShadow: '0 2px 14px rgba(41,182,255,0.3)',
                      border: 'none',
                      cursor: submitting ? 'wait' : 'pointer',
                    }}
                  >
                    {submitting ? 'Sending…' : 'Send inquiry'}
                  </button>
                </form>
              )}
      </div>
    </div>
  )
}
