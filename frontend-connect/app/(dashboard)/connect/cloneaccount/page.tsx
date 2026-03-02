'use client'

import { useState, useEffect } from 'react'
import { accountManager } from '@/lib/stripe-account'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  User,
  MapPin,
  CreditCard,
  FileText,
  Save,
  RefreshCw
} from 'lucide-react'

// Types
interface AccountDetails {
  id: string
  type: string
  country: string
  default_currency: string
  email: string
  business_profile: {
    name: string
    url: string
    support_email: string
    support_phone: string
    support_url: string
    mcc: string
    product_description: string
  }
  business_type: string
  individual: {
    first_name: string
    last_name: string
    email: string
    phone: string
    dob: { day: number; month: number; year: number } | null
    address: {
      line1: string
      line2: string
      city: string
      state: string
      postal_code: string
      country: string
    } | null
    ssn_last_4_provided: boolean
    id_number_provided: boolean
  } | null
  company: {
    name: string
    phone: string
    tax_id_provided: boolean
    address: {
      line1: string
      line2: string
      city: string
      state: string
      postal_code: string
      country: string
    } | null
  } | null
  capabilities: Record<string, string>
  charges_enabled: boolean
  payouts_enabled: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
    pending_verification: string[]
    disabled_reason: string | null
    errors: any[]
  }
  external_accounts: any[]
  metadata: Record<string, string>
  created: number
}

// Collapsible Section Component
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  status = 'complete'
}: {
  title: string
  icon: any
  children: React.ReactNode
  defaultOpen?: boolean
  status?: 'complete' | 'incomplete' | 'error'
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const statusColors = {
    complete: 'text-green-600',
    incomplete: 'text-yellow-600',
    error: 'text-red-600'
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'complete' && <Check className={`w-4 h-4 ${statusColors.complete}`} />}
          {status === 'incomplete' && <AlertCircle className={`w-4 h-4 ${statusColors.incomplete}`} />}
          {status === 'error' && <AlertCircle className={`w-4 h-4 ${statusColors.error}`} />}
          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}

// Form Field Component
function FormField({
  label,
  required = false,
  error,
  children
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// Input Component
function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = ''
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        disabled:bg-gray-100 disabled:text-gray-500
        text-sm ${className}`}
    />
  )
}

// Select Component
function Select({
  value,
  onChange,
  options,
  disabled = false
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        disabled:bg-gray-100 disabled:text-gray-500
        text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// Main Component
export default function CloneAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [account, setAccount] = useState<AccountDetails | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Business Profile
    business_name: '',
    business_url: '',
    support_email: '',
    support_phone: '',
    product_description: '',
    mcc: '5999',

    // Business Type
    business_type: 'individual',

    // Individual
    first_name: '',
    last_name: '',
    individual_email: '',
    individual_phone: '',
    dob_day: '',
    dob_month: '',
    dob_year: '',
    ssn_last_4: '',

    // Address
    address_line1: '',
    address_line2: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country: 'US',
  })

  // Fetch account data
  const fetchAccount = async () => {
    const accountId = accountManager.getAccountId()
    if (!accountId) {
      router.push('/select-account')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/account/details', {
        headers: {
          'x-stripe-account': accountId,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch account')
      }

      const data = await response.json()
      setAccount(data)

      // Populate form
      setFormData({
        business_name: data.business_profile?.name || '',
        business_url: data.business_profile?.url || '',
        support_email: data.business_profile?.support_email || '',
        support_phone: data.business_profile?.support_phone || '',
        product_description: data.business_profile?.product_description || '',
        mcc: data.business_profile?.mcc || '5999',
        business_type: data.business_type || 'individual',
        first_name: data.individual?.first_name || '',
        last_name: data.individual?.last_name || '',
        individual_email: data.individual?.email || data.email || '',
        individual_phone: data.individual?.phone || '',
        dob_day: data.individual?.dob?.day?.toString() || '',
        dob_month: data.individual?.dob?.month?.toString() || '',
        dob_year: data.individual?.dob?.year?.toString() || '',
        ssn_last_4: '',
        address_line1: data.individual?.address?.line1 || '',
        address_line2: data.individual?.address?.line2 || '',
        address_city: data.individual?.address?.city || '',
        address_state: data.individual?.address?.state || '',
        address_postal_code: data.individual?.address?.postal_code || '',
        address_country: data.individual?.address?.country || 'US',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const accountId = accountManager.getAccountId()
    if (!accountId) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updateData: any = {
        business_type: formData.business_type,
        business_profile: {
          name: formData.business_name || undefined,
          url: formData.business_url || undefined,
          support_email: formData.support_email || undefined,
          support_phone: formData.support_phone || undefined,
          product_description: formData.product_description || undefined,
          mcc: formData.mcc || undefined,
        },
      }

      // Individual data
      if (formData.business_type === 'individual') {
        updateData.individual = {
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          email: formData.individual_email || undefined,
          phone: formData.individual_phone || undefined,
        }

        // DOB
        if (formData.dob_day && formData.dob_month && formData.dob_year) {
          updateData.individual.dob = {
            day: parseInt(formData.dob_day),
            month: parseInt(formData.dob_month),
            year: parseInt(formData.dob_year),
          }
        }

        // Address
        if (formData.address_line1) {
          updateData.individual.address = {
            line1: formData.address_line1,
            line2: formData.address_line2 || undefined,
            city: formData.address_city,
            state: formData.address_state,
            postal_code: formData.address_postal_code,
            country: formData.address_country,
          }
        }

        // SSN
        if (formData.ssn_last_4 && formData.ssn_last_4.length === 4) {
          updateData.individual.ssn_last_4 = formData.ssn_last_4
        }
      }

      const response = await fetch('/api/account/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-stripe-account': accountId,
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account')
      }

      setSuccess('Account updated successfully!')

      // Refresh data
      await fetchAccount()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading account details...</p>
        </div>
      </div>
    )
  }

  // Get requirements status
  const hasRequirements = account?.requirements?.currently_due?.length ?? 0 > 0
  const businessComplete = !!formData.business_name
  const personalComplete = !!(formData.first_name && formData.last_name)
  const addressComplete = !!(formData.address_line1 && formData.address_city && formData.address_state && formData.address_postal_code)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
        <p className="text-gray-600 mt-1">
          Update your business and personal information.
        </p>
      </div>

      {/* Account Status Banner */}
      {account && (
        <div className={`mb-6 p-4 rounded-lg border ${
          account.charges_enabled && account.payouts_enabled
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {account.charges_enabled && account.payouts_enabled ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className={`font-medium ${
                  account.charges_enabled && account.payouts_enabled
                    ? 'text-green-800'
                    : 'text-yellow-800'
                }`}>
                  {account.charges_enabled && account.payouts_enabled
                    ? 'Account is fully active'
                    : 'Account setup incomplete'}
                </p>
                <p className="text-sm text-gray-600">
                  Account ID: {account.id}
                </p>
              </div>
            </div>
            <button
              onClick={fetchAccount}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Requirements */}
          {hasRequirements && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                Required information:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {account.requirements.currently_due.map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    {req.replace(/_/g, ' ').replace(/\./g, ' > ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Type */}
        <Section
          title="Business type"
          icon={Building2}
          status={businessComplete ? 'complete' : 'incomplete'}
        >
          <div className="space-y-4">
            <FormField label="Business type" required>
              <Select
                value={formData.business_type}
                onChange={(v) => setFormData({ ...formData, business_type: v })}
                options={[
                  { value: 'individual', label: 'Individual' },
                  { value: 'company', label: 'Company' },
                  { value: 'non_profit', label: 'Non-profit' },
                ]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Select your business structure. Changing this may require additional verification.
              </p>
            </FormField>
          </div>
        </Section>

        {/* Business Profile */}
        <Section
          title="Business details"
          icon={FileText}
          status={businessComplete ? 'complete' : 'incomplete'}
        >
          <div className="space-y-4">
            <FormField label="Business name" required>
              <Input
                value={formData.business_name}
                onChange={(v) => setFormData({ ...formData, business_name: v })}
                placeholder="Your business name"
              />
            </FormField>

            <FormField label="Business website">
              <Input
                value={formData.business_url}
                onChange={(v) => setFormData({ ...formData, business_url: v })}
                placeholder="https://example.com"
                type="url"
              />
            </FormField>

            <FormField label="Product description">
              <textarea
                value={formData.product_description}
                onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                placeholder="Describe what your business sells or provides"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Support email">
                <Input
                  value={formData.support_email}
                  onChange={(v) => setFormData({ ...formData, support_email: v })}
                  placeholder="support@example.com"
                  type="email"
                />
              </FormField>

              <FormField label="Support phone">
                <Input
                  value={formData.support_phone}
                  onChange={(v) => setFormData({ ...formData, support_phone: v })}
                  placeholder="+1 (555) 123-4567"
                />
              </FormField>
            </div>

            <FormField label="Industry (MCC)">
              <Select
                value={formData.mcc}
                onChange={(v) => setFormData({ ...formData, mcc: v })}
                options={[
                  { value: '5999', label: '5999 - Miscellaneous Retail' },
                  { value: '5734', label: '5734 - Computer Software Stores' },
                  { value: '5817', label: '5817 - Digital Goods' },
                  { value: '7372', label: '7372 - Computer Programming' },
                  { value: '7379', label: '7379 - Computer Services' },
                  { value: '8999', label: '8999 - Professional Services' },
                ]}
              />
            </FormField>
          </div>
        </Section>

        {/* Personal Information */}
        {formData.business_type === 'individual' && (
          <Section
            title="Personal information"
            icon={User}
            status={personalComplete ? 'complete' : 'incomplete'}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Legal first name" required>
                  <Input
                    value={formData.first_name}
                    onChange={(v) => setFormData({ ...formData, first_name: v })}
                    placeholder="John"
                  />
                </FormField>

                <FormField label="Legal last name" required>
                  <Input
                    value={formData.last_name}
                    onChange={(v) => setFormData({ ...formData, last_name: v })}
                    placeholder="Doe"
                  />
                </FormField>
              </div>

              <FormField label="Email address">
                <Input
                  value={formData.individual_email}
                  onChange={(v) => setFormData({ ...formData, individual_email: v })}
                  placeholder="john@example.com"
                  type="email"
                />
              </FormField>

              <FormField label="Phone number">
                <Input
                  value={formData.individual_phone}
                  onChange={(v) => setFormData({ ...formData, individual_phone: v })}
                  placeholder="+1 (555) 123-4567"
                />
              </FormField>

              <FormField label="Date of birth">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={formData.dob_month}
                    onChange={(v) => setFormData({ ...formData, dob_month: v })}
                    placeholder="MM"
                    type="number"
                  />
                  <Input
                    value={formData.dob_day}
                    onChange={(v) => setFormData({ ...formData, dob_day: v })}
                    placeholder="DD"
                    type="number"
                  />
                  <Input
                    value={formData.dob_year}
                    onChange={(v) => setFormData({ ...formData, dob_year: v })}
                    placeholder="YYYY"
                    type="number"
                  />
                </div>
              </FormField>

              <FormField label="Last 4 digits of SSN">
                <Input
                  value={formData.ssn_last_4}
                  onChange={(v) => setFormData({ ...formData, ssn_last_4: v.slice(0, 4) })}
                  placeholder="••••"
                  type="password"
                />
                {account?.individual?.ssn_last_4_provided && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> SSN already provided
                  </p>
                )}
              </FormField>
            </div>
          </Section>
        )}

        {/* Address */}
        <Section
          title="Address"
          icon={MapPin}
          status={addressComplete ? 'complete' : 'incomplete'}
        >
          <div className="space-y-4">
            <FormField label="Street address" required>
              <Input
                value={formData.address_line1}
                onChange={(v) => setFormData({ ...formData, address_line1: v })}
                placeholder="123 Main St"
              />
            </FormField>

            <FormField label="Apt, suite, etc. (optional)">
              <Input
                value={formData.address_line2}
                onChange={(v) => setFormData({ ...formData, address_line2: v })}
                placeholder="Apt 4B"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" required>
                <Input
                  value={formData.address_city}
                  onChange={(v) => setFormData({ ...formData, address_city: v })}
                  placeholder="San Francisco"
                />
              </FormField>

              <FormField label="State" required>
                <Select
                  value={formData.address_state}
                  onChange={(v) => setFormData({ ...formData, address_state: v })}
                  options={[
                    { value: '', label: 'Select state' },
                    { value: 'AL', label: 'Alabama' },
                    { value: 'AK', label: 'Alaska' },
                    { value: 'AZ', label: 'Arizona' },
                    { value: 'AR', label: 'Arkansas' },
                    { value: 'CA', label: 'California' },
                    { value: 'CO', label: 'Colorado' },
                    { value: 'CT', label: 'Connecticut' },
                    { value: 'DE', label: 'Delaware' },
                    { value: 'FL', label: 'Florida' },
                    { value: 'GA', label: 'Georgia' },
                    { value: 'HI', label: 'Hawaii' },
                    { value: 'ID', label: 'Idaho' },
                    { value: 'IL', label: 'Illinois' },
                    { value: 'IN', label: 'Indiana' },
                    { value: 'IA', label: 'Iowa' },
                    { value: 'KS', label: 'Kansas' },
                    { value: 'KY', label: 'Kentucky' },
                    { value: 'LA', label: 'Louisiana' },
                    { value: 'ME', label: 'Maine' },
                    { value: 'MD', label: 'Maryland' },
                    { value: 'MA', label: 'Massachusetts' },
                    { value: 'MI', label: 'Michigan' },
                    { value: 'MN', label: 'Minnesota' },
                    { value: 'MS', label: 'Mississippi' },
                    { value: 'MO', label: 'Missouri' },
                    { value: 'MT', label: 'Montana' },
                    { value: 'NE', label: 'Nebraska' },
                    { value: 'NV', label: 'Nevada' },
                    { value: 'NH', label: 'New Hampshire' },
                    { value: 'NJ', label: 'New Jersey' },
                    { value: 'NM', label: 'New Mexico' },
                    { value: 'NY', label: 'New York' },
                    { value: 'NC', label: 'North Carolina' },
                    { value: 'ND', label: 'North Dakota' },
                    { value: 'OH', label: 'Ohio' },
                    { value: 'OK', label: 'Oklahoma' },
                    { value: 'OR', label: 'Oregon' },
                    { value: 'PA', label: 'Pennsylvania' },
                    { value: 'RI', label: 'Rhode Island' },
                    { value: 'SC', label: 'South Carolina' },
                    { value: 'SD', label: 'South Dakota' },
                    { value: 'TN', label: 'Tennessee' },
                    { value: 'TX', label: 'Texas' },
                    { value: 'UT', label: 'Utah' },
                    { value: 'VT', label: 'Vermont' },
                    { value: 'VA', label: 'Virginia' },
                    { value: 'WA', label: 'Washington' },
                    { value: 'WV', label: 'West Virginia' },
                    { value: 'WI', label: 'Wisconsin' },
                    { value: 'WY', label: 'Wyoming' },
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="ZIP code" required>
                <Input
                  value={formData.address_postal_code}
                  onChange={(v) => setFormData({ ...formData, address_postal_code: v })}
                  placeholder="94102"
                />
              </FormField>

              <FormField label="Country">
                <Select
                  value={formData.address_country}
                  onChange={(v) => setFormData({ ...formData, address_country: v })}
                  options={[
                    { value: 'US', label: 'United States' },
                  ]}
                  disabled
                />
              </FormField>
            </div>
          </div>
        </Section>

        {/* Bank Account Section (Read-only) */}
        {account?.external_accounts && account.external_accounts.length > 0 && (
          <Section
            title="Payout details"
            icon={CreditCard}
            status="complete"
            defaultOpen={false}
          >
            <div className="space-y-3">
              {account.external_accounts.map((ea: any) => (
                <div
                  key={ea.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {ea.bank_name || 'Bank Account'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ••••{ea.last4} · {ea.currency?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {ea.default_for_currency && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={fetchAccount}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg
              hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
