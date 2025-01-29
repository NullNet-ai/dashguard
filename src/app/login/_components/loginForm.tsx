"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormMessage } from "~/components/ui/form";
import FormInput from "~/components/platform/FormBuilder/FormType/FormInput";
import FormPassword from "~/components/platform/FormBuilder/FormType/FormPassword";
import { Button } from "~/components/ui/button";
import LoginSubmit from "../actions/loginSubmit";
import { Checkbox } from "~/components/ui/checkbox";

const formSchema = z.object({
  email: z.string({ required_error: "Please enter your email address." }).email("Please enter a valid email address."),
  password: z.string().min(1, { message: "Please enter your password." }).min(5, "Password must contain at least 5 characters."),
});

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await LoginSubmit(data);
      if (response && response.statusCode !== 200) {
        throw response;
      }
    } catch (error: any) {
      console.error("Error Details:", error.message);
      setIsSubmitting(false);
      setError(error.message);
    }
  };
  const form = useForm({
    resolver: zodResolver(formSchema), // is this where the validation relies?
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="email"
          control={form.control}
          render={(formProps) => {
            return (
              <FormInput
                fieldConfig={{
                  id: "email",
                  name: "email",
                  label: "Email Address",
                  required: true,
                  placeholder: "Enter valid email address",
                  type: "email",
                }}
                form={form}
                formKey={"Login"}
                formRenderProps={formProps}
              />
            );
          }}
        />
        <FormField
          name="password"
          control={form.control}
          render={(formProps) => {
            return (
              <FormPassword
                fieldConfig={{
                  id: "password",
                  name: "password",
                  label: "Password",
                  required: true,
                  placeholder: "Enter at least 5 characters",
                }}
                form={form}
                formKey={"Login"}
                formRenderProps={formProps}
              />
            );
          }}
        />
        {error && <FormMessage>{error}</FormMessage>}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-md font-semibold text-foreground"
            >
              Remember me
            </label>
          </div>
          <div className="text-md">
            <a href="#" className="font-semibold text-primary">
              Forgot Password?
            </a>
          </div>
        </div>
        <Button
          data-test-id={"login-submit-btn"}
          loading={isSubmitting}
          type="submit"
          className="!mt-8 flex h-auto w-full items-center justify-center rounded py-1.5 text-md font-semibold text-white shadow-sm"
        >
          Sign in
        </Button>
      </form>
    </Form>
  );
}
