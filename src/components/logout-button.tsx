'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/jobs')
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} variant="outline" className="w-full">
      Logout
    </Button>
  )
}

