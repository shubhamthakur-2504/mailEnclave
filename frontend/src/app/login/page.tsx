import AuthForm from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <main className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center px-6 py-6 overflow-hidden">
      <AuthForm mode="login" />
    </main>
  )
}
