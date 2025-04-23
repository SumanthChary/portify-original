
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const { signIn, signUp, user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      if (authMode === "signin") {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password);
        reset();
        setAuthMode("signin");
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already logged in
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <Tabs
            defaultValue={authMode}
            onValueChange={(value) => setAuthMode(value as "signin" | "signup")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <CardHeader>
              <CardTitle>
                {authMode === "signin" ? "Welcome Back" : "Create an Account"}
              </CardTitle>
              <CardDescription>
                {authMode === "signin"
                  ? "Sign in to access your dashboard"
                  : "Sign up to start using Portify"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-cta-gradient"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Processing..."
                    : authMode === "signin"
                    ? "Sign In"
                    : "Sign Up"}
                </Button>
                <p className="text-sm text-center text-gray-500">
                  {authMode === "signin" ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-coral hover:underline"
                        onClick={() => setAuthMode("signup")}
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-coral hover:underline"
                        onClick={() => setAuthMode("signin")}
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </p>
              </CardFooter>
            </form>
          </Tabs>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
