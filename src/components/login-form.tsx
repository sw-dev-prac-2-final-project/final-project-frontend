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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginForm() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-4xl">Login to your account</CardTitle>
          <CardDescription className="text-base">
            See what going on with our product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="text-sm">
            <div className="flex flex-col gap-6 max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="dreamteam@gmail.com"
                  required
                  className="h-10"
                />
              </div>
              <RadioGroup
                defaultValue="staff"
                className="flex flex-row items-center gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staff" id="r-staff" />
                  <Label htmlFor="r-staff">Staff</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="r-admin" />
                  <Label htmlFor="r-admin">Admin</Label>
                </div>
              </RadioGroup>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="h-10"
                />
                <div className="flex flex-row justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me" className="text-xs">
                      Remember me
                    </Label>
                  </div>
                  <a
                    href="#"
                    className="text-xs inline-block underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full text-lg font-semibold h-11">
            Login
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-32 text-center text-lg font-light">
        Not registered?{" "}
        <a href="#" className="underline">
          Create an account
        </a>
      </div>
    </div>
  );
}
