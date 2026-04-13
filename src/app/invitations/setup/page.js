'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams,useParams, useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { TriangleAlert } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { isEmpty, isLength, contains } from "validator"
import  supabase  from '../../../config/supabaseClient'

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupPageContent />
    </Suspense>
  )
}

function SignupPageFallback() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-linear-to-br from-core/55 to-army/50 relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=1000&fit=crop"
          alt="Team working together"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-core/40 to-army/10"></div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto max-h-svh">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image 
              className="dark:invert w-8 h-8" 
              src="/logo.png" 
              alt="Nexshelf" 
              width={32} 
              height={32}
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-core border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignupPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [companyData, setCompanyData] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [caseType, setCaseType] = useState(null) // 'no-invite', 'confirm-failed', 'success'
  const [hasValidated, setHasValidated] = useState(false)

  // console.log(window.location.origin)

  useEffect(() => {
    if (hasValidated) return // Prevent multiple runs

    const validateUser = async () => {
      try {
        const emailParam = searchParams.get('email')
        const errorParam = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        
        // Parse hash fragment for error parameters (from Supabase redirects)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const hashError = hashParams.get('error')
        const hashErrorCode = hashParams.get('error_code')
        const hasError = errorParam || hashError

        console.log('Validation parameters:', { emailParam, errorParam, errorCode, hashError, hashErrorCode })

        // STEP 1: Get the current session first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        const hasSession = !sessionError && sessionData?.session?.user
        
        if (!hasSession) {
          // NO SESSION CASES
          
          // Case A: No session, no error, no email → "Not invited"
          if (!hasError && !emailParam) {
            setError('You have not been invited by any company.')
            setCaseType('no-invite')
            setLoading(false)
            setHasValidated(true)
            return
          }
          
          // Case B: No session, no error but email exists → "Not invited"
          if (emailParam && !hasError) {
            setError('You have not been invited by any company.')
            setCaseType('no-invite')
            setLoading(false)
            setHasValidated(true)
            return
          }
          
          // Case C: No session but error and error code exists → Show email input form
        if (hasError && emailParam && (errorCode === 'otp_expired' || hashErrorCode === 'otp_expired')) {
          setUserEmail(emailParam)
          setCaseType('continue-onboarding')
          setLoading(false)
          setHasValidated(true)
          return
        } else if (hasError) {
          setError('System failure, contact your inviting company.')
          setCaseType('error')
          setLoading(false)
          setHasValidated(true)
          return
        }
      }

        // STEP 2: User HAS SESSION -  Check if user exists in public.users table
        const user = sessionData&& sessionData.session.user
        setUserEmail(user.email)

        const { data: publicUserData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (userError) {
          console.error('Error checking public.users:', userError)
          setError('An error occurred. Please contact your administrator.')
          setCaseType('error')
          setLoading(false)
          setHasValidated(true)
          return
        }

        // Case: User not in public.users table → Show signup form
        if (!publicUserData) {
          const metadata = user.user_metadata
          if (metadata?.company_id && metadata?.company_name) {
            const companyInfo = {
              id: metadata.company_id,
              name: metadata.company_name,
              logo_url: metadata.logo_url,
              invited_by: metadata.invited_by,
              invite_id: metadata.invite_id
            }
            setCompanyData(companyInfo)
            setUserEmail(user.email)
            setCaseType('success')
            setLoading(false)
            setHasValidated(true)
            return
          } else {
            setError('Company information not found. Please contact your administrator.')
            setCaseType('error')
            setLoading(false)
            setHasValidated(true)
            return
          }
        }

        // User already signed up - direct to login
        setError('You\'ve been successfully signed up. Log in to check your invite status.')
        setCaseType('already-signed-up')
        setLoading(false)
        setHasValidated(true)

      } catch (err) {
        console.error('Error in validation:', err)
        setError('An unexpected error occurred.')
        setCaseType('error')
        setLoading(false)
        setHasValidated(true)
      }
    }

    validateUser()
  }, [hasValidated])

  return (
    <div className="grid min-h-svh font-WixMade lg:grid-cols-2">
      {/* Left Side - Company Logo/Image (Always visible, fallback to default if no companyData) */}
      <div className="bg-linear-to-br from-core/55 to-army/50 relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center overflow-hidden">
        {companyData?.logo_url ? (
          <div className="relative z-10 flex flex-col items-center gap-6 px-6">
            <img
              src={companyData.logo_url}
              alt={companyData.name}
              className="w-24 h-24 object-contain drop-shadow-lg"
            />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">{companyData.name}</h2>
              <p className="text-white/80">Welcome to Nexshelf Pro</p>
            </div>
          </div>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000&h=1000&fit=crop"
            alt="Team working together"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-core/40 to-army/10"></div>
      </div>

      {/* Right Side - Form or Error */}
      <div className="flex flex-col gap-4 p-6 md:p-10 overflow-y-auto max-h-svh">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Image 
              className="dark:invert w-8 h-8" 
              src="/logo.png" 
              alt="Nexshelf" 
              width={32} 
              height={32}
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-core border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {!loading && error && (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="text-army mb-2">
                  <TriangleAlert className="size-20" />
                </div>
                <div className="bg-core/10 border-2 border-core/30 rounded-lg p-6 text-center">
                  <p className="text-core font-semibold mb-2">Access Required</p>
                  <p className="text-core/80 text-sm">{error}</p>
                </div>
                <a href="/" className="text-core hover:underline text-sm font-medium">
                  Back to Home
                </a>
              </div>
            )}
            
            {!loading && !error && caseType === 'success' && (
              <SignupForm companyData={companyData} userEmail={userEmail} />
            )}
            
            {!loading && caseType === 'continue-onboarding' && (
              <ContinueOnboardingForm userEmail={userEmail} />
            )}

            {!loading && caseType === 'reset-password' && (
              <ResetPasswordForm userEmail={userEmail} />
            )}
            
            {!loading && caseType === 'reset-password-input' && (
              <EmailResetForm />
            )}
            
            {!loading && caseType === 'already-signed-up' && (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="text-army mb-2">
                  <TriangleAlert className="size-20" />
                </div>
                <div className="bg-core/10 border-2 border-core/30 rounded-lg p-6 text-center">
                  <p className="text-core font-semibold mb-2">Already Signed Up</p>
                  <p className="text-core/80 text-sm">{error}</p>
                </div>
                <a href="/accounts/login" className="text-core hover:underline text-sm font-medium">
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





//SIGNUP FORM COMPONENT
//=====================




export function SignupForm({
  className,
  companyData,
  userEmail,
  ...props
}) {
  const [formData, setFormData] = useState({
    username: '@',
    handle: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [usernameExists, setUsernameExists] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounceTimer = useRef(null)

  const message = {
    usernameError: 'username is required',
    passwordError: 'password must have at least 8 characters that includes at least one number, one uppercase letter, and one special character',
    validateError: 'password does not match',
    usernameExistsError: 'username already exists',
  }

  const rules = {
    length: isLength(formData.password, { min: 8 }),
    number: contains(formData.password, '0') || contains(formData.password, '1') || contains(formData.password, '2') || contains(formData.password, '3') || contains(formData.password, '4') || contains(formData.password, '5') || contains(formData.password, '6') || contains(formData.password, '7') || contains(formData.password, '8') || contains(formData.password, '9'),
    uppercase: /[A-Z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }

  const allValid = Object.values(rules).every(Boolean)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || isEmpty(usernameToCheck) || usernameToCheck === '@') {
      setUsernameExists(null)
      setCheckingUsername(false)
      return
    }

    setCheckingUsername(true)
    
    try {
      const { data: existing, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", usernameToCheck.toLowerCase())
        .maybeSingle()

      if (error) {
        console.error("Error checking username:", error)
        setUsernameExists(null)
      } else {
        setUsernameExists(existing ? true : false)
      }
    } catch (err) {
      console.error("Unexpected error checking username:", err)
      setUsernameExists(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (e) => {
    const inputValue = e.target.value.toLowerCase()
    const cleanValue = inputValue.replace(/[^a-z0-9_$]/g, '')
    const stateValue = `@${cleanValue}`
    setFormData(prev => ({ ...prev, username: stateValue }))
    setError('')

    if (!cleanValue) {
      setUsernameExists(null)
      setCheckingUsername(false)
      return
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      checkUsernameAvailability(stateValue)
    }, 500)
  }

  // Helper function: Verify staff record was created by backend trigger
  const verifyStaffRecord = async (userId, maxAttempts = 10, delayMs = 2000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data: staff, error } = await supabase
          .from('staff_lite')
          .select('company')
          .eq('staff_id', userId)
          .single()

        if (!error && staff) {
          console.log(`✓ Staff record verified on attempt ${attempt}:`, staff)
          return staff
        }

        // Wait before retrying (except on last attempt)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      } catch (err) {
        console.error(`Attempt ${attempt}: Error verifying staff record:`, err)
      }
    }

    throw new Error('Staff record verification timeout: Backend trigger did not complete in time')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Full validation
    if (isEmpty(formData.username) || formData.username === '@') {
      setError(message.usernameError)
      return
    }

    if (usernameExists) {
      setError(message.usernameExistsError)
      return
    }

    if (!allValid) {
      setError(message.passwordError)
      return
    }

    if (isEmpty(formData.confirmPassword) || formData.confirmPassword !== formData.password) {
      setError(message.validateError)
      return
    }

    setIsSubmitting(true)

    try {
      const handle = formData.username.substring(1)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Failed to get user information')
        setIsSubmitting(false)
        return
      }




      const handleCompleteUser = async () => {
          setIsSubmitting(true)
          setError(null)

          const { data, error: rpcError } = await supabase.functions.invoke(
            'complete-user-profile',
            {
              body: {
                password: formData.password,
                username: formData.username,
                handle: handle,
                email: userEmail,
                invited_by: companyData?.invited_by,
                company: companyData?.id,
                company_invite:true,
                invite_id: companyData?.invite_id
              },
            }
          )

          if (rpcError) {
            console.error('Error:', rpcError)
            setError(rpcError.message || 'Failed to complete your profile')
            setIsSubmitting(false)
            return
          }

          // Success
          await supabase.auth.refreshSession() // So new metadata appears
          
          // ✅ Verify handle was saved and redirect
          const { data: { session } } = await supabase.auth.getSession()
          const verifiedHandle = session?.user?.user_metadata?.handle

          if (!verifiedHandle) {
            console.error('Handle not found after save')
            setError('Profile handle was not saved. Please refresh and try again.')
            setIsSubmitting(false)
            return
          }

          // ✅ Redirect to dashboard using saved handle
          router.push(`/users/${verifiedHandle}/company-invites/${companyData?.invite_id}`)
          

      }

      await handleCompleteUser()

    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err.message || 'An error occurred while setting up your profile. Please refresh and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        {/* Company Acceptance Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-4">
          {companyData?.logo_url && (
            <img
              src={companyData.logo_url}
              alt={companyData.name}
              className="w-16 h-16 object-contain lg:hidden"
            />
          )}
          <div className="space-y-1 w-full">
            <div className="text-lg font-semibold text-muted-foreground">
              Sign up and Accept Invitation <br /> from
              <span className="text-lg mr-2 font-semibold text-army">
                {companyData?.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Setup your credentials to complete your sign up on Nexshelf Pro
            </p>
          </div>
        </div>

        {/* User Email Display */}
        <div className="bg-muted px-3 py-3 rounded text-sm mb-2">
          <p className="text-muted-foreground text-xs mb-1">Email</p>
          <p className="font-medium">{userEmail}</p>
        </div>

        {/* Username Input */}
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">@ </span>
                <Input 
                  id="username" 
                  name="username"
                  className="pl-6" 
                  value={formData.username.replace('@', '')}
                  onChange={handleUsernameChange}
                  type="text" 
                  placeholder="your_username"
                  autoComplete="username"
                />
                {checkingUsername && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    <div className="animate-spin h-4 w-4 border-2 border-core border-t-transparent rounded-full"></div>
                  </span>
                )}
                {!checkingUsername && formData.username && formData.username !== '@' && usernameExists === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</div>
                )}
              </div>
              <FieldDescription className="text-xs ml-1">
                {error === message.usernameError && (
                  <span className="text-core">{error}</span>
                )}
                {error === message.usernameExistsError && (
                  <span className="text-core">{error}</span>
                )}
                {!error && formData.username && formData.username !== '@' && !checkingUsername && usernameExists === false && (
                  <span className="text-army">username is available</span>
                )}
                {!error && formData.username && formData.username !== '@' && !checkingUsername && usernameExists === true && (
                  <span className="text-core">username already taken</span>
                )}
              </FieldDescription>
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input 
                id="password" 
                name="password"
                type="password"
                placeholder="•••••••••"
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <div className="text-xs space-y-1 mt-2">
                <div className={rules.length ? 'text-army' : 'text-gray-400'}>
                  ✓ At least 8 characters
                </div>
                <div className={rules.number ? 'text-army' : 'text-gray-400'}>
                  ✓ At least one number
                </div>
                <div className={rules.uppercase ? 'text-army' : 'text-gray-400'}>
                  ✓ At least one uppercase letter
                </div>
                <div className={rules.special ? 'text-army' : 'text-gray-400'}>
                  ✓ At least one special character (!@#$%^&*)
                </div>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input 
                id="confirm-password" 
                name="confirmPassword"
                type="password"
                placeholder=""
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </Field>

            {/* Error Message */}
            {error && (
              <div className="bg-core/10 border-2 border-core/30 rounded-lg p-4 flex gap-3 items-start">
                <TriangleAlert className="w-5 h-5 text-army shrink-0 mt-0.5" />
                <p className="text-core text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Field>
              <Button 
                type="submit"
                disabled={isSubmitting || usernameExists === true || !allValid || formData.confirmPassword !== formData.password}
                className="bg-core hover:bg-core/90 text-white font-normal w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing up...' : 'Sign up to Accept Invite'}
              </Button>
            </Field>

            <FieldSeparator>or</FieldSeparator>

            {/* Alternative SignIn Link */}
            <FieldDescription className="px-6 text-center">
              Already have an account? <a href="/accounts/login" className="text-core hover:underline font-semibold">Sign in</a>
            </FieldDescription>
      </FieldGroup>
    </form>
  )
}












export function ContinueOnboardingForm({ userEmail }) {
  const [isSending, setIsSending] = useState(false)
  const [sentSuccessfully, setSentSuccessfully] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async () => {
    setIsSending(true)
    setError('')

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/invitations/setup?email=${encodeURIComponent(userEmail)}`
        }
      })
      
      if (otpError) throw otpError
      setSentSuccessfully(true)
    } catch (err) {
      console.error('Error sending OTP:', err)
      setError('Failed to send verification code. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (sentSuccessfully) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-army mb-2">
          <TriangleAlert className="size-20" />
        </div>
        <div className="bg-core/10 border-2 border-core/30 rounded-lg p-6 text-center">
          <p className="text-core font-semibold mb-2">Verification Code Sent</p>
          <p className="text-core/80 text-sm">We've sent a verification code to {userEmail}</p>
          <p className="text-core/80 text-sm mt-3">Please check your email to continue with your onboarding.</p>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-6">
      <FieldGroup>
        <div className="mb-6">
          <h2 className="text-lg text-center font-bold text-army mb-2">Continue Your Onboarding</h2>
          <p className="text-gray-600 text-sm">Your invitation has expired. Click the button below to generate a new verification code and continue onboarding.</p>
        </div>

        {/* Expired Warning */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex gap-3 items-start">
          <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-semibold">Your one-time session has expired</p>
            <p className="text-amber-700 text-xs mt-1">Generate a new session to continue onboarding.</p>
          </div>
        </div>

        {/* Email Display */}
        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input 
            type="email"
            value={userEmail}
            className="bg-gray-50"
            disabled
          />
        </Field>

        {/* Error Message */}
        {error && (
          <div className="bg-core/10 border-2 border-core/30 rounded-lg p-4 flex gap-3 items-start">
            <TriangleAlert className="w-5 h-5 text-army shrink-0 mt-0.5" />
            <p className="text-core text-sm">{error}</p>
          </div>
        )}

        {/* Send OTP Button */}
        <Field>
          <Button 
            type="button"
            onClick={handleSendOTP}
            disabled={isSending}
            className="bg-core hover:bg-core/90 text-white font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Get Link'}
          </Button>
        </Field>

        {/* Alternative SignIn Link */}
        <FieldDescription className="px-6 text-center">
          Already have an account? <a href="/accounts/login" className="text-core hover:underline font-semibold">Sign in</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}

export function ResetPasswordForm({ userEmail }) {
  const [isSending, setIsSending] = useState(false)
  const [sentSuccessfully, setSentSuccessfully] = useState(false)
  const [error, setError] = useState('')

  const handleSendResetEmail = async () => {
    setIsSending(true)
    setError('')

    try {
      await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/invitations/setup?email=${encodeURIComponent(userEmail)}`
      })
      setSentSuccessfully(true)
    } catch (err) {
      console.error('Error sending reset email:', err)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (sentSuccessfully) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-army mb-2">
          <TriangleAlert className="size-20" />
        </div>
        <div className="bg-core/10 border-2 border-core/30 rounded-lg p-6 text-center">
          <p className="text-core font-semibold mb-2">Reset Email Sent</p>
          <p className="text-core/80 text-sm">We've sent a password reset link to {userEmail}</p>
          <p className="text-core/80 text-sm mt-3">Please check your email to continue with your account setup.</p>
        </div>
      </div>
    )
  }

  return (
    <form className="space-y-6">
      <FieldGroup>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Setup</h2>
          <p className="text-gray-600 text-sm">Enter your email to receive a password reset link.</p>
        </div>

        {/* Email Display */}
        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input 
            type="email"
            value={userEmail}
            className="bg-gray-50"
          />
        </Field>

        {/* Error Message */}
        {error && (
          <div className="bg-core/10 border-2 border-core/30 rounded-lg p-4 flex gap-3 items-start">
            <TriangleAlert className="w-5 h-5 text-army shrink-0 mt-0.5" />
            <p className="text-core text-sm">{error}</p>
          </div>
        )}

        {/* Send Reset Email Button */}
        <Field>
          <Button 
            type="button"
            onClick={handleSendResetEmail}
            disabled={isSending}
            className="bg-core hover:bg-core/90 text-white font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Password Reset Email'}
          </Button>
        </Field>

        {/* Alternative SignIn Link */}
        <FieldDescription className="px-6 text-center">
          Already have an account? <a href="/accounts/login" className="text-core hover:underline font-semibold">Sign in</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}














async function sendResetEmailToAddress(email) {
  try {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        redirectUrl: `${window.location.origin}/invitations/setup?email=${encodeURIComponent(email)}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error from API:', data.error)
      return { success: false, error: data.error }
    }

    console.log('Success:', data)
    return { success: true }
  } catch (err) {
    console.error('Error sending reset email:', err)
    return { success: false, error: err.message }
  }
}

export function EmailResetForm() {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentSuccessfully, setSentSuccessfully] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || isEmpty(email)) {
      setError('Please enter your email address.')
      return
    }

    setIsSending(true)
    setError('')

    const result = await sendResetEmailToAddress(email)
    
    if (result.success) {
      setSentSuccessfully(true)
    } else {
      setError(result.error || 'Failed to send reset email. Please try again.')
    }
    
    setIsSending(false)
  }

  if (sentSuccessfully) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-army mb-2">
          <TriangleAlert className="size-20" />
        </div>
        <div className="bg-core/10 border-2 border-core/30 rounded-lg p-6 text-center">
          <p className="text-core font-semibold mb-2">Reset Email Sent</p>
          <p className="text-core/80 text-sm">We've sent a password reset link to {email}</p>
          <p className="text-core/80 text-sm mt-3">Please check your email to continue with your account setup.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-army text-center mb-2">Reset Your Password</h2>
          <p className="text-gray-600 text-sm">Input email and submit to reset email and continue setup.</p>
        </div>

        {/* Email Input */}
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input 
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            disabled={isSending}
          />
        </Field>

        {/* Error Message */}
        {error && (
          <div className="bg-core/10 border-2 border-core/30 rounded-lg p-4 flex gap-3 items-start">
            <TriangleAlert className="w-5 h-5 text-army shrink-0 mt-0.5" />
            <p className="text-core text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Field>
          <Button 
            type="submit"
            disabled={isSending || isEmpty(email)}
            className="bg-core hover:bg-core/90 text-white font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Submit'}
          </Button>
        </Field>

        {/* Alternative SignIn Link */}
        <FieldDescription className="px-6 text-center">
          Already have an account? <a href="/accounts/login" className="text-core hover:underline font-semibold">Sign in</a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}