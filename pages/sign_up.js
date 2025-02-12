import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "react-toastify"
import ytkiddAPI from "@/apis/ytkidApi"
import { Router, useRouter } from "next/router"

export default function SignUp() {
  return (
    <div className="flex min-h-svh flex-col items-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center self-center font-medium">
          <img src="/images/cookie_kid_logo_circle.png" className="h-16 w-16" />
          Cookie Kid
        </Link>
        <SignUpForm />
      </div>
    </div>
  )
}

function SignUpForm({className, ...props}) {
  const router = useRouter()

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    })
  }

  async function PostSignUp() {
    try {
      const response = await ytkiddAPI.PostSignUp("", {}, userData)
      const body = await response.json()
      if (response.status !== 200) {
        toast.error(`error ${JSON.stringify(body)}`)
        return
      }

      toast.success("your account succesfully registered")
      router.push("/sign_in")

    } catch (e) {
      toast.error(`error ${e}`)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Register New Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Name</Label>
                  <Input
                    name="name"
                    type="text"
                    placeholder="jhone doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="jhone.doe@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input name="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password Confirmation</Label>
                  </div>
                  <Input name="password_confirmation" type="password_confirmation" required />
                </div>
                <Button className="w-full" onClick={()=>PostSignUp()}>
                  Register
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
