// src/proxy.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          } catch (error) {
            console.warn('Proxy cookie error (normal)', error)
          }
        },
      },
    }
  )

  await supabase.auth.getUser()   // Important: refreshes session

  return response
}

export const config = {
  matcher: [
    '/users/:u/company/:companyId/branches/:branchId/:path*'
  ],
}