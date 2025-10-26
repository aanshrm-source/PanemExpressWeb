import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Train, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RegisterProps {
  onLogin: (user: { username: string; email: string }) => void;
}

export default function Register({ onLogin }: RegisterProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: InsertUser) {
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", "/api/auth/register", data);
      const userData = await result.json();
      onLogin(userData.user);
      setLocation("/book");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account. Username or email may already exist.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <Train className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join Panem Express today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your account to start booking tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Choose a username"
                          {...field}
                          data-testid="input-username"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@gmail.com"
                          {...field}
                          data-testid="input-email"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          {...field}
                          data-testid="input-password"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isLoading}
                  data-testid="button-submit-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login">
                <span className="text-primary font-medium hover:underline cursor-pointer" data-testid="link-login">
                  Login
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Join thousands of travelers booking with Panem Express
        </p>
      </div>
    </div>
  );
}
