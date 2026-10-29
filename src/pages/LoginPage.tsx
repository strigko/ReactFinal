import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must contain at least 6 characters.")
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const emailRef = useRef<HTMLInputElement>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: async (data) => {
      localStorage.setItem("accessToken", data.accessToken);

      try {
        const response = await import("../api/authApi");
        const currentUser = await response.getCurrentUser();

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));

        showToast("Login successful!", "success");

        navigate(
          currentUser.role === "operator" ? "/requests" : "/requests",
          { replace: true }
        );
      } catch {
        localStorage.removeItem("accessToken");
        setServerError("Could not load your account. Please try again.");
      }
    },

    onError: () => {
      setServerError("Invalid email or password.");
      showToast("Login failed.", "error");
    }
  });

  function onSubmit(data: LoginFormData) {
    setServerError("");
    loginMutation.mutate(data);
  }

  return (
    <section className="loginCard">
      <h1>Welcome back</h1>
      <p className="muted">Sign in to manage your service requests.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          {...register("email")}
          ref={(element) => {
            register("email").ref(element);
            emailRef.current = element;
          }}
        />
        {errors.email && (
          <p className="fieldError">{errors.email.message}</p>
        )}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="fieldError">{errors.password.message}</p>
        )}

        {serverError && <p className="fieldError">{serverError}</p>}

        <button
          className="button primary fullWidth"
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="demoAccounts">
        <p><strong>User account</strong></p>
        <p>user@example.com / user123</p>

        <p><strong>Operator account</strong></p>
        <p>operator@example.com / operator123</p>
      </div>
    </section>
  );
}

export default LoginPage;
