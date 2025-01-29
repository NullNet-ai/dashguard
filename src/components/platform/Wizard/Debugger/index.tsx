"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { ScrollArea } from "~/components/ui/scroll-area";
import { WizardContext } from "../Provider";

export default function DebuggerComponent() {
  const { state } = useContext(WizardContext);

  const [isExpanded, setIsExpanded] = useState(false);
  const [formSaveState, setFormSave] = useState<Record<string, string>>({});
  useEffect(() => {
    // Get form values and errors on every form change
    if (state?.formSave) {
      setFormSave(state?.formSave);
      return;
    }
  }, [state?.formSave]);

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
          DEBUGGER wizard
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
            <AccordionItem value="wizardProps">
              <AccordionTrigger>
                <h4 className="text-md font-semibold">wizardProps</h4>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>wizardProps</CardHeader>
                  <CardContent>
                    <label>handler registered</label>
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(formSaveState, null, 2)}
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
