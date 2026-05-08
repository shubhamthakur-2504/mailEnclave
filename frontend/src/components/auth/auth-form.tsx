"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { ArrowRight, LockKeyhole, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { loginRequest, signupRequest } from "@/lib/api/auth-api"
import { loginFormSchema, registerFormSchema } from "@/lib/validators/auth"
import { useAuthStore } from "@/stores/auth-store"
import type { LoginFormValues, RegisterFormValues } from "@/lib/validators/auth"

type AuthMode = "login" | "register"

type AuthFormValues = LoginFormValues & Partial<Pick<RegisterFormValues, "confirmPassword">>

type AuthFormProps = {
  mode: AuthMode
}

const copyMap = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to access your encrypted Testmail namespaces.",
    submitLabel: "Sign in",
    footerText: "Need an account?",
    footerLink: "/register",
    footerLinkLabel: "Create one",
  },
  register: {
    title: "Create your account",
    subtitle: "Start with a private vault for developer emails in a few seconds.",
    submitLabel: "Create account",
    footerText: "Already have an account?",
    footerLink: "/login",
    footerLinkLabel: "Sign in",
  },
} as const

const fieldClassName =
  "w-full rounded-xl border border-border bg-white/60 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-ring focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(124,135,247,0.12)] dark:bg-white/5 dark:focus:bg-white/10"

const getAuthErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const responseMessage = error.response?.data?.error

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      if (/invalid credentials/i.test(responseMessage)) {
        return "Invalid credentials"
      }

      if (/unauthori[sz]ed/i.test(responseMessage)) {
        return "Unauthorized"
      }

      return responseMessage
    }

    if (error.response?.status === 401) {
      return "Invalid credentials"
    }

    if (error.response?.status === 403) {
      return "Unauthorized"
    }
  }

  return "Invalid credentials"
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [mounted, setMounted] = useState(false)
  const schema = useMemo(() => (mode === "login" ? loginFormSchema : registerFormSchema), [mode])
  const copy = copyMap[mode]

  useEffect(() => {
    setMounted(true)
  }, [])

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      const payload = { email: values.email, password: values.password }
      return mode === "login" ? loginRequest(payload) : signupRequest(payload)
    },
    onSuccess: (session) => {
      setSession(session)
      toast.success(mode === "login" ? "Signed in successfully" : "Account created successfully")
      router.push("/dashboard")
      router.refresh()
    },
    onError: (error: unknown) => {
      const message = getAuthErrorMessage(error)
      toast.error(message)
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))
  const showConfirmPassword = mode === "register"

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <section className="glass-card rounded-3xl p-6 md:p-8 transition-all duration-200">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-56 rounded-full bg-white/20" />
            <div className="h-10 w-80 rounded-full bg-white/20" />
            <div className="h-12 w-full rounded-xl bg-white/20" />
            <div className="h-12 w-full rounded-xl bg-white/20" />
            {mode === "register" ? <div className="h-12 w-full rounded-xl bg-white/20" /> : null}
            <div className="h-12 w-full rounded-xl bg-primary/30" />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <section className="glass-card rounded-3xl p-6 md:p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(91,106,245,0.12)]">
        <p className="inline-flex rounded-full border border-border px-4 py-1 text-xs tracking-wide text-muted-foreground glass-panel transition-transform duration-200 hover:-translate-y-0.5">
          Secure login to your private vault
        </p>

        <div className="mt-4 mb-5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        <h2 className="sr-only">{copy.submitLabel}</h2>

        <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" /> Email
            </span>
            <input
              type="email"
              autoComplete="email"
              className={fieldClassName}
              placeholder="you@company.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <span className="text-xs text-destructive">{form.formState.errors.email.message}</span>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <LockKeyhole className="size-4 text-muted-foreground" /> Password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              spellCheck={false}
              className={fieldClassName}
              placeholder="Enter your password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <span className="text-xs text-destructive">{form.formState.errors.password.message}</span>
            ) : null}
          </label>

          {showConfirmPassword ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <LockKeyhole className="size-4 text-muted-foreground" /> Confirm Password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                spellCheck={false}
                className={fieldClassName}
                placeholder="Repeat your password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <span className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</span>
              ) : null}
            </label>
          ) : null}

          <Button
            type="submit"
            className="w-full rounded-xl py-5 text-sm font-semibold normal-case tracking-normal transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(91,106,245,0.22)]"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Please wait..." : copy.submitLabel}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {copy.footerText}{" "}
          <Link href={copy.footerLink} className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-primary">
            {copy.footerLinkLabel}
          </Link>
        </p>
      </section>
    </div>
  )
}
