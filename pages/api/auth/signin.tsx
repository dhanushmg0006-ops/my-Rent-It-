// pages/auth/signin.tsx
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sign In</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{ marginRight: "1rem" }}
      >
        Sign in with Google
      </button>

      <button onClick={() => signIn("github", { callbackUrl: "/" })}>
        Sign in with GitHub
      </button>
    </div>
  );
}
