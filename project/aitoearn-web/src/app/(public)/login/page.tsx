'use client'

import LoginContent from '../../[lng]/auth/login/components/LoginContent'
import { GoogleOAuthProvider } from '@react-oauth/google'

export default function RootLoginPage() {
  return (
    <GoogleOAuthProvider clientId="694668121384-96gnemgllcc1uadfdc7re6cqpplnsro7.apps.googleusercontent.com">
      <LoginContent />
    </GoogleOAuthProvider>
  )
}

