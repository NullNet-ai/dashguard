"use client";

import {
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckIcon,
  ChevronDown,
  FolderSearchIcon,
  HistoryIcon,
  ListCheckIcon,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardFooter } from "~/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useSidebar } from "~/components/ui/sidebar";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";
import { Button } from "@headlessui/react";

import { SmartContext } from "~/components/ui/smart-component";
import RecordSummaryContent from "./SummaryContent";

type RecordSummaryMobileProps = {
    children: React.ReactNode;
}

const RecordSummaryMobile = ({children}:RecordSummaryMobileProps) => {
  
  const { open } = useSidebar();
  const size = useScreenType();
  const [selected, setSelected] = useState<null | "summary" | "smart">(null);
  const smart  = useContext(SmartContext);


  useEffect(() => {
     if(size === "xs" || size === "sm") {
      smart?.action("wizard-summary");
     }

    return () => {
      smart?.action("smart");
    };
  }, [size])
  

  const footerContent = useCallback(() => {

    const activeClass = "border-b-4 border-primary bg-muted p-4 text-primary";
    return (
      <>
        <Separator />
        <DrawerFooter>
          <div className="fixed bottom-0 z-20 left-0 flex w-full justify-between bg-muted text-default/60 lg:hidden">
            <Button
              onClick={() => {
                setSelected("summary");
              }}
              className={cn('flex w-1/2 justify-center gap-2  bg-muted p-4 lg:hidden', {[activeClass] : selected === "summary"})}
            >
              <ListCheckIcon className={cn('h-5 w-5', {'text-primary': selected === "summary"})} /> Summary
            </Button>
            <Button
              onClick={() => {
                setSelected("smart");
              }}
              className={cn('flex w-1/2 justify-center gap-2  bg-muted p-4 lg:hidden', {[activeClass] : selected === "smart"})}
            >
              <FolderSearchIcon className={cn('h-5 w-5', {'text-primary': selected === "smart"})} /> Smart
            </Button>
          </div>
        </DrawerFooter>
      </>
    );
  }, [selected]);

  

  const content = useCallback(() => {
    if (!selected) return null;

    if (selected === "summary") {
      return (
        <>
          {/* <DrawerHeader className="flex items-center gap-4 p-3">
            <Button
              onClick={() => {
                setSelected(null);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200"
            >
              <ChevronDown className="h-6 w-6 text-primary" />
            </Button>
          </DrawerHeader>
          <Separator /> */}
          <div className="py-2 px-2">
            <div className="h-[70dvh] overflow-y-auto">
                {children}
            </div>
          </div>
          {footerContent()}
        </>
      );
    }
    return (
      <>
        <DrawerHeader className="flex items-center gap-4 p-3">
          <h1 className="text-md flex-grow text-start">Smart</h1>
          <PlusIcon className="h-6 w-6 text-primary" />
          <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          <XMarkIcon className="h-6 w-6 text-muted-foreground" />
        </DrawerHeader>
        <Separator />
        <main className="max-h-[70dvh] space-y-2 overflow-auto p-4">
          <p className="mb-4 text-center text-sm text-muted-foreground/70">
            Thu,Oct 31
          </p>

          <div className="flex items-start gap-1">
            <Card className="rounded-xl p-2">
              {`Please give me the list of active contacts with the same numbers
                        as Marlyn Cooper's phone number that is used in this current draft
                        record`}
            </Card>
            <img
              alt=""
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              className="inline-block h-8 w-8 rounded-full"
            />
          </div>
          <p className="text-start text-xs font-normal text-muted-foreground/70">
            Tom Cook <time dateTime="8:30">8:30 AM</time>
          </p>

          <div className="flex items-start gap-2">
            <Image
              alt="Your Company"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=200"
              className="rounded-full bg-muted p-1"
              width={35}
              height={35}
            />
            <Card className="rounded-xl bg-muted p-3">
              <p>
                {`Hi Tom! Absolutely. I have gathered all records saved under
                        Marlyn Cooper's phone number that is used in this current draft
                        record`}
              </p>
              <Card className="mb-2 border-l-2 border-l-primary p-2">
                <Badge
                  className="mr-2 rounded-sm border-0 p-2 font-normal"
                  variant={"primary"}
                >
                  ID100089
                </Badge>
                <Badge className="rounded-sm border-0 bg-yellow-100 p-2 font-normal text-yellow-600">
                  Draft
                </Badge>
                <h1 className="font-bold">Alexandra Jason Parker</h1>

                <div className="flex gap-2">
                  <h2 className="text-muted-foreground">Email</h2>
                  <h2>alex_54JP@example.com</h2>
                </div>
              </Card>
              <Card className="border-l-2 border-l-primary p-2">
                <Badge
                  className="mr-2 rounded-sm border-0 p-2 font-normal"
                  variant={"primary"}
                >
                  ID100089
                </Badge>
                <Badge className="rounded-sm border-0 bg-yellow-100 p-2 font-normal text-yellow-600">
                  Draft
                </Badge>
                <h1 className="font-bold">Alexandra Jason Parker</h1>

                <div className="flex gap-2">
                  <h2 className="text-muted-foreground">Email</h2>
                  <h2>alex_54JP@example.com</h2>
                </div>
              </Card>
            </Card>
          </div>
          <section className="flex items-center justify-start gap-2">
            <Badge
              variant={"secondary"}
              className="rounded-none p-2 text-sm font-normal"
            >
              Copy
            </Badge>
            <Badge
              variant={"secondary"}
              className="rounded-none p-2 text-sm font-normal"
            >
              Regenerate Response
            </Badge>
            <span className="text-xs text-muted-foreground">
              Smart Bot <time dateTime="8:30">8:30 AM</time>
            </span>
          </section>
        </main>
       {footerContent()}
      </>
    );
  }, [selected]);

  if (size !== "xs" && size !== "sm") {
    return null;
  }

  const widthClass = open
    ? "sm:w-[calc(100%-250px)]"
    : "sm:w-[calc(100%-50px)]";

  return (
    <Drawer
      open={selected !== null}
      onClose={() => {
        setSelected(null);
      }}
    >
      <div className="fixed bottom-0 flex w-full items-center justify-between gap-2 bg-muted lg:hidden">
        <Button
          className={cn(
            "flex w-1/2 items-center justify-center gap-2 p-4",
            widthClass,
          )}
          onClick={() => {
            setSelected("summary");
          }}
        >
          <ListCheckIcon className="h-5 w-5" /> Summary
        </Button>
        <div className="h-8 w-[1px] bg-slate-400" />
        <Button
          className={cn(
            "flex w-1/2 items-center justify-center gap-2 p-4",
            widthClass,
          )}
          onClick={() => {
            setSelected("smart");
          }}
        >
          <FolderSearchIcon className="h-5 w-5" /> Smart
        </Button>
      </div>
      <DrawerContent className="h-[80dvh]">{content()}</DrawerContent>
    </Drawer>
  );
};

export default RecordSummaryMobile;
