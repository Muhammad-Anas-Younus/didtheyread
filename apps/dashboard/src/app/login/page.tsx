import GoogleLoginButton from "@/components/shared/google-login-btn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className={cn("flex w-96 flex-col gap-6")}>
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleLoginButton>Login with Google</GoogleLoginButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
