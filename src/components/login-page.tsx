"use client";
import { useState } from "react"
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const testemail = "abc@gmail.com"
  const testpassword = "123456"
  const router = useRouter(); // Hook do nawigacji
  const handleOnclick = ()=> {
    if (email === testemail && password === testpassword) {
      router.push('/home')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Here you would typically make an API call to your authentication endpoint
    // For demonstration, we'll just check if the email and password are not empty
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    // Simulating an API call
    try {
      // Replace this with your actual authentication logic
      console.log("Logging in with:", email, password)
      // If login is successful, you might want to redirect the user or update the app state
    } catch (err) {
      setError("Failed to login. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" onClick={handleOnclick}>Login</Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}