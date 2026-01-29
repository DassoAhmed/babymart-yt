import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import useAuthStore from "@/store/useAuthStore";
import {motion} from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import z from "zod"; // Removed 'email' import as it's not needed
import { registerSchema } from '../lib/validation';
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Optional: for showing toast notifications

type FormData = z.infer<typeof registerSchema>

const Register = () => {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore(); // Renamed to avoid conflict

  const form = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "", // Add this as it's required in the schema
      role: "user",
      phone: "", // Add this as it's optional in the schema
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data); // Fixed typo: was console,log
    
    setLoading(true);
    try {
      await registerUser(data); // Use the renamed auth store function
      // Optional: Show success message
      toast.success("Registration successful!");
      
      // Navigate to login or dashboard
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Show error message
      toast.error(error.message || "Registration failed. Please try again.");
      
      // Optionally set form error
      form.setError("root", {
        type: "manual",
        message: error.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full 
    bg-gradient-to-br from-indigo-500 via-purple-500 
    to-pink-500 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-4"
      >
        <Card className="w-full bg-white/95
          backdrop-blur-sm shadow-xl border
          border-gray-200"
        > 
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-800">
                Create An Account
              </CardTitle>
              <CardDescription className="text-gray-500">
                Enter your details to signup
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Field */}
                <FormField 
                  control={form.control}
                  name="name" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Type your full name here..."
                          type="text"
                          disabled={isLoading}
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField 
                  control={form.control}
                  name="email" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="you@example.com"
                          type="email"
                          disabled={isLoading}
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Phone Field (Optional) */}
                <FormField 
                  control={form.control}
                  name="phone" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Phone Number (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 (555) 123-4567"
                          type="tel"
                          disabled={isLoading}
                          className="w-full"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField 
                  control={form.control}
                  name="password" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••"
                          type="password"
                          disabled={isLoading}
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField 
                  control={form.control}
                  name="confirmPassword" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••"
                          type="password"
                          disabled={isLoading}
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Role Field (Read-only) */}
                <FormField 
                  control={form.control}
                  name="role" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Role
                      </FormLabel>
                      <FormControl>
                        <Input 
                          value="User"
                          type="text"
                          disabled={true}
                          className="w-full bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2"
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </Button>

                {/* Display root error if any */}
                {form.formState.errors.root && (
                  <div className="text-red-500 text-sm text-center">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default Register;