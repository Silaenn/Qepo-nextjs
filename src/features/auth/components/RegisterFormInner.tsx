import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type RegisterFormSchema } from "../forms/register";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { boolean } from "zod";

type RegisterFormInnerProps = {
  onRegisterSubmit: (values: RegisterFormSchema) => void;
  isLoading?: boolean;
  buttonText?: string;
  showPasswords?: boolean;
};

export const RegisterFormInner = (prop: RegisterFormInnerProps) => {
  const form = useFormContext<RegisterFormSchema>();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <form
      onSubmit={form.handleSubmit(prop.onRegisterSubmit)}
      className="flex flex-col gap-y-1"
    >
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormDescription />
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
              <Input type={showPassword ? "text" : "password"} {...field} />
            </FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        )}
      />

      {prop.showPasswords && (
        <Label className="mt-4 flex items-center gap-2">
          <Checkbox
            checked={showPassword}
            onCheckedChange={(checked) => setShowPassword(!!checked)}
          />
          Show Password
        </Label>
      )}

      <Button disabled={prop.isLoading} className="mt-4 w-full">
        {prop.buttonText ?? "Buat Akun"}
      </Button>
    </form>
  );
};
