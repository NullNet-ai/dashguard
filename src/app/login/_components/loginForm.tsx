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

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5, "Password must be at least 5 characters long"),
});

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await LoginSubmit(data);
    } catch (error: any) {
      console.error("Error Details:",error.message);
      setIsSubmitting(false);
      setError(error.message);
    }
  };
  const form = useForm({
    resolver: zodResolver(formSchema), // is this where the validation relies?
  });

  return (
    <Form {...form}>
      <form className="space-y-6 " onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="email"
          control={form.control}
          render={(formProps) => {
            return (
              <FormInput
                fieldConfig={{
                  id: "email",
                  name: "email",
                  label: "Email address",
                  required: true,
                  placeholder: "Enter Valid Email Address",
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
                  placeholder: "Password",
                  
                }}
                form={form}
                formKey={"Login"}
                formRenderProps={formProps}
              />
            );
          }}
        />
        {error && (
          <FormMessage>
            {error}
          </FormMessage>
        )}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-md text-foreground font-semibold">
              Remember me
            </label>
          </div>
          <div className="text-md">
            <a href="#" className="font-semibold text-primary ">
              Forgot password?
            </a>
          </div>
        </div>
          <Button
          data-test-id={'login-submit-button'}
            loading={isSubmitting}
            type="submit"
            className="!mt-8 rounded flex  text-md w-full justify-center items-center font-semibold text-white shadow-sm h-auto py-1.5"
          >
            Sign in
          </Button>
      </form>
    </Form>
  );
}
