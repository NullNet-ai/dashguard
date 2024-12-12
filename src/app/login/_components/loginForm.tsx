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
      <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
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
                  placeholder: "Email",
                  type: "email",
                }}
                form={form}
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
        <div className="py-2">
          <Button
            name="loginSubmitButton"
            loading={isSubmitting}
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </Button>
        </div>
      </form>
    </Form>
  );
}
