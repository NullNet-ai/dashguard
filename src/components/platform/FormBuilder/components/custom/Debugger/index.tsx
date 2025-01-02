"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { ScrollArea } from "~/components/ui/scroll-area";

interface IProps {
  formKey: string;
  form?: UseFormReturn<Record<string, any>, any, undefined>;
  formProps?: any;
}

export default function DebuggerComponent({
  form,
  formKey,
  formProps,
}: IProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  useEffect(() => {
    // Get form values and errors on every form change
    if (form) {
      const subscription = form.watch((value) => {
        setFormValues(value);
      });

      return () => subscription.unsubscribe();
    }
  }, [form]);

  return (
    <div
      className={`fixed bottom-10 right-5 z-50 w-[450px] rounded-xl bg-white shadow-lg transition-all duration-300 ${
        isExpanded ? "h-[700px]" : "h-[60px]"
      }`}
    >
      <div
        className={`flex cursor-pointer items-center justify-between rounded-t-xl bg-orange-200 px-4 py-2 ${
          isExpanded ? "rounded-b-none" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-card-foreground">
          DEBUGGER {formKey}
        </h3>
        {isExpanded ? (
          <ChevronUpIcon className="h-8 w-8 text-card-foreground" />
        ) : (
          <ChevronDownIcon className="h-8 w-8 text-card-foreground" />
        )}
      </div>

      <div
        className={`h-[calc(100%-60px)] overflow-y-auto ${isExpanded ? "block" : "hidden"}`}
      >
        <ScrollArea>
          <Accordion type="multiple" className="p-2">
            {/* FormProps Section */}
            <AccordionItem value="formProps">
              <AccordionTrigger>
                <h4 className="text-md font-semibold">FormProps</h4>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>FormProps</CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(formProps, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Form Values Section */}
            <AccordionItem value="formValues">
              <AccordionTrigger>
                <h4 className="text-md font-semibold">Form Values</h4>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>Form Values</CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(formValues, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </div>
    </div>
  );
}
