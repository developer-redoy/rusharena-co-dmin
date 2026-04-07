"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/public/images/logo.jpg";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";
import ButtonLoading from "@/app/component/buttonLoading";
import { showToast } from "@/app/component/application/tostify";

import {
  MatchType1,
  MatchType2,
  MatchType3,
  MatchType4,
  MatchType5,
  MatchType6,
  MatchType7,
  MatchType8,
  MatchType9,
  MatchType10,
} from "@/config";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      setLoading(true);

      // Send login request
      const res = await axios.post(`/api/login`, formData);
      const loginResponse = res.data;

      if (!loginResponse.success) {
        showToast("error", loginResponse.message || "Login failed");
        return;
      }

      const token = loginResponse.token;

      // Save token in Capacitor Preferences (works in APK + web)
      if (token) {
        await Preferences.set({ key: "access_token", value: token });
        await Preferences.set({ key: "access_type", value: formData.email }); // Save the selected access type
      }

      reset();
      showToast("success", loginResponse.message || "Login successful");

      // Redirect user

      return router.push(process.env.NEXT_PUBLIC_APP_URL || "/");
    } catch (error) {
      console.error("Login error:", error);
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="flex w-full h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Image
                src={Logo.src}
                width={Logo.width}
                height={Logo.height}
                alt="logo"
                className="max-w-[150px] rounded-full"
              />
            </div>
            <CardTitle className="text-3xl font-bold">Login Account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Select Access</Label>
                <select
                  id="email"
                  {...register("email")}
                  className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={MatchType1}>{MatchType1}</option>
                  <option value={MatchType2}>{MatchType2}</option>
                  <option value={MatchType3}>{MatchType3}</option>
                  <option value={MatchType4}>{MatchType4}</option>
                  <option value={MatchType5}>{MatchType5}</option>
                  <option value={MatchType6}>{MatchType6}</option>
                  <option value={MatchType7}>{MatchType7}</option>
                  <option value={MatchType8}>{MatchType8}</option>
                  <option value={MatchType9}>{MatchType9}</option>
                  <option value={MatchType10}>{MatchType10}</option>
                </select>
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    {...register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <ButtonLoading
                type={"submit"}
                text={"Log in"}
                className={"w-full"}
                loading={loading}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
