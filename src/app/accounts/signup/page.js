'use client'
import { useState } from "react";
import { Eye, EyeOff, GalleryVerticalEnd ,Circle,CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {Field,FieldDescription,FieldGroup,FieldLabel,FieldSeparator,} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { isEmpty,isEmail,isLength,matches,contains } from "validator"
import { supabase } from "../../../../config/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,} from "@/components/ui/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"

export default function SignupPage() {
    const [dialogOpen,setDialogOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [showValidatePassword, setShowValidatePassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const [validateFocused, setValidateFocused] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState("");
    const [passwordValidate, setPasswordValidate] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading,setIsLoading] = useState(false)
    const message = {
      emailError:'valid email address required',
      passwordError :'password must have at least 8 characters that includes at least number',
      validateError :'password does not match',
    }

    const rules = {
      length: isLength(password, { min: 8 }),
      number: contains(password, '0') || contains(password, '1') || contains(password, '2') || contains(password, '3') || contains(password, '4') || contains(password, '5') || contains(password, '6') || contains(password, '7') || contains(password, '8') || contains(password, '9'),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const allValid = Object.values(rules).every(Boolean);
    
    // function generateUsername(email) {
    //   if (!email) return;

    //   const namePart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      
    //   return `@${namePart}`;
    // }
    
    // function extractHandle(username) {
    //   const randomPart = Math.random().toString(36).substring(2, 6);
    //   const cleanName = username.startsWith('@') ? username.slice(1) : username;

    //   return `${cleanName}_${randomPart}`;
    // }

    // async function generateUniqueUsername(email, supabase) {
    //   let username;
    //   let handle;

    //   while (true) {
    //     username = generateUsername(email);
    //     handle = extractHandle(username);

    //   const { data: existing, error } = await supabase
    //     .from('profiles')
    //     .select('id')
    //     .or(`username.eq.${username},handle.eq.${handle}`)
    //     .maybeSingle(); 

    //     if (!existing) break;

    //   }

    //   return { username, handle };
    // }


      function generateUsername(email) {
        if (!email) return;

        const namePart = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        
        return `@${namePart}`;
      }

      function addRandomSuffix(base) {
      // Add a small random string or number (e.g. user1234)
      const random = Math.random().toString(36).substring(2, 6);
      return `${base}${random}`;
    }

    async function generateUniqueUsername(email, supabase) {
      let username = generateUsername(email);
      let finalUsername = username;

      // Loop until we find a unique username
      while (true) {


        const { data: existing, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", finalUsername)
          .maybeSingle();

        if (!existing) break; // Unique username found
        finalUsername = addRandomSuffix(username); // Try again with random suffix
      }

      return finalUsername;
    }


    async function Submit(e){
        e.preventDefault();
        setError(false)
        setErrorMessage('')

        if(isEmpty(email) || !isEmail(email)){setError(true),setErrorMessage(message.emailError); return}
        else if((!allValid) ){setError(true),setErrorMessage(message.passwordError); return}
        // else if(isEmpty(password)||!isLength(password,{min:8})||!matches(password,/[0-9]/)){setError(true),setErrorMessage(message.passwordError); return}
        else if(isEmpty(passwordValidate)||passwordValidate!==password){setError(true);setErrorMessage(message.validateError); return}

        else{
            setIsLoading(true)
            const username = await generateUniqueUsername(email, supabase);
            const handle = username.startsWith('@') ? username.slice(1) : username; // remove '@' for handle
            console.log('Form Submitted',email,password)
      
            try {
              // Network call to Supabase
                let { data, error } = await supabase.auth.signUp({
                  email: email,
                  password: password,
                  options:{
                    emailRedirectTo:`http://localhost:3000/accounts/login?confirmed=${email}`,
                    data:{
                      username:username,
                      handle:handle,
                      role:'admin'
                    }
                  }
                })


              if (error) {
                // Supabase reached, but login failed (wrong credentials, etc.)
                setIsLoading(false)
                alert(error)
                setError(true)
                console.log("Supabase auth error:", error)
                return
              }

              if (data?.user) {
                setDialogOpen(true)
                setIsLoading(false)
                console.log("confirmation link successfully sent to:", data.user.email)
              }

            } catch (err) {
              // Request itself failed (network issue, CORS, etc.)
              setIsLoading(false)
              setError(true)
              toast("Network error, Retry", {className:'bg-red-500 text-white'})
              console.log("Network or unexpected error:", err)
            }

        }
    }
  
  return (
    <AlertDialog setDialogOpen={setDialogOpen} dialogOpen={dialogOpen}>
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full -mt-20 max-w-sm">
            <div className={cn("flex flex-col gap-6")}>
              <form onSubmit={Submit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <a
                      href="#"
                      className="flex flex-col items-center gap-2 font-medium"
                    >
                      <div className="flex size-8 items-center justify-center rounded-md">
                        <div className="inline-flex pt-0 md:pt-0 size-8 justify-center">
                            <Image className="dark:invert w-7/8 scale-75 " src="/logo.png" alt="logo" width={200} height={200} priority />
                        </div>
                      </div>
                      
                    </a>
                    <h1 className="text-xl text-army font-bold">Get Started @ Nexshelf Pro.</h1>
                    <FieldDescription>
                      Already have an account? <Link href="/accounts/login">Login</Link>
                    </FieldDescription>
                  </div>
                
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="m@example.com" required />
                        <FieldDescription className={'text-xs ml-1'}>
                          {error && errorMessage==message.emailError && (
                            <span className="text-orange-500">{errorMessage}</span>
                          )}
                        </FieldDescription>
                      </Field>
                      <Field>
                        <Field className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <div className="relative ">
                              <Input id="password" className={'mt-1'} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} type={showPassword ? "text" : "password"} placeholder="" required/>
                              <Button type="button" variant={'ghost'} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </Button>
                            </div>
                            <div className="mt-0 text-[11px] ml-0.5 transition-all">
                              {(focused || errorMessage==message.passwordError) && !isEmpty(password) && (
                                  
                                    <ul className="space-y-[1px]">
                                        <li className={`flex items-center gap-1 ${rules.length ? "text-green-600" : "text-orange-500"}`}>
                                          {rules.length ? (
                                            <CheckCircle size={11} />
                                          ) : (
                                            <Circle size={11} />
                                          )}
                                          At least 8 characters
                                        </li>
                                        <li className={`flex items-center gap-1 ${ rules.number ? "text-green-600" : "text-orange-500" }`}>
                                          {rules.number ? <CheckCircle size={11} /> : <Circle size={11} />}
                                          Contains a number
                                        </li>
                                        <li className={`flex items-center gap-1 ${ rules.uppercase ? "text-green-600" : "text-orange-500" }`} >
                                          {rules.uppercase ? (
                                            <CheckCircle size={11} />
                                          ) : (
                                            <Circle size={11} />
                                          )}
                                          One uppercase letter
                                        </li>
                                        <li className={`flex items-center gap-1 ${ rules.special ? "text-green-600" : "text-orange-500" }`} >
                                          {rules.special ? (
                                            <CheckCircle size={11} />
                                          ) : (
                                            <Circle size={11} />
                                          )}
                                          One special character
                                        </li>
                                      </ul>
                                  
                                )}
                            </div>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="confirm-password">
                              Confirm Password
                            </FieldLabel>
                            <div className="relative ">
                              <Input id="passwordValidate" className={'mt-1'} value={passwordValidate} onChange={(e) => setPasswordValidate(e.target.value)} onFocus={() => setValidateFocused(true)} onBlur={() => setValidateFocused(false)} type={showValidatePassword ? "text" : "password"} placeholder="" required/>
                              <Button type="button" variant={'ghost'} onClick={() => setShowValidatePassword(!showValidatePassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" >
                                {showValidatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </Button>
                            </div>
                            <div className="mt-0 text-[11px] ml-0.5 transition-all">
                              {(validateFocused||errorMessage==message.validateError) && !isEmpty(passwordValidate) && (
                                  
                                    <ul className="space-y-[1px]">
                                        <li className={`flex items-center gap-1 ${passwordValidate===password ? "text-green-600" : "text-orange-500"}`}>
                                          {rules.length ? (
                                            <CheckCircle size={11} />
                                          ) : (
                                            <Circle size={11} />
                                          )}
                                          {passwordValidate === password ? "Passwords match" : "Passwords do not match"}
                                        </li>   
                                      </ul>
                                  
                                )}
                            </div>
                          </Field>
                        </Field>
                      </Field>

                      <Field>
                        <Button disabled={isLoading} className={'bg-core'} type="submit">{isLoading&&<Spinner spinning={isLoading}/>}Create Account</Button>
                      </Field>
                  <FieldSeparator>Or</FieldSeparator>
                  <Field className="grid gap-4 sm:grid-cols-2">
                    <Button disabled variant="outline" type="button">
                      {x}
                      Continue with X
                    </Button>
                    <Button disabled variant="outline" type="button">
                      {google}
                      Continue with Google
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
              <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
              </FieldDescription>
            </div>
      </div>
    </div>
     <AlertDialogContent className={''}>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm your email address</AlertDialogTitle>
          <AlertDialogDescription className={'text-neutral-700'}>
            A confirmation link has been sent to your email <span className="text-green-700">{email}</span>. Open your inbox and click the link to complete your sign-up.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={()=>{setEmail(''),setPassword(''),setPasswordValidate('')}} className={'h-8 -mt-1'}>Ok</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


export const google = <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="17px" height="17px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>

export const x = <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30" width="22px" height="22px"><path d="M26.37,26l-8.795-12.822l0.015,0.012L25.52,4h-2.65l-6.46,7.48L11.28,4H4.33l8.211,11.971L12.54,15.97L3.88,26h2.65 l7.182-8.322L19.42,26H26.37z M10.23,6l12.34,18h-2.1L8.12,6H10.23z"/></svg>

export const apple = <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="52px" height="52px"><path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"/></svg>