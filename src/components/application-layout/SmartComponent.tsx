"use client";
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { FileIcon, FolderSearchIcon, HistoryIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import Image from "next/image";
import { Input } from "../ui/input";
import { MicrophoneIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Badge } from "../ui/badge";
import { useSidebar } from "../ui/sidebar";
import { cn } from "~/lib/utils";
import { SmartContext } from "../ui/smart-component";

export default function SmartComponent() {
  const [openSmart, setOpenSmart] = useState(false);
  const smart = React.useContext(SmartContext);
 

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    setOpenSmart(!openSmart);
  }

  if(smart?.state === "wizard-summary") return null;
  
  return (
    <Card
      className={`${openSmart ? "right-0" : `-right-[25dvw]`} transition-right fixed top-0 hidden z-50 h-screen w-[25dvw] duration-500 lg:block`}
    >
      <Button
        className="absolute left-[-3.5rem] top-3/4 -rotate-90 rounded-lg bg-primary/15 text-primary  hover:bg-primary/40 active:translate-x-0"
        onClick={handleClick}
        data-test-id="smart-btn"
      >
        Smart
      </Button>
      {/* <Button
        className="absolute left-[-3.5rem] top-3/4 -rotate-90 rounded-lg bg-primary/15 text-primary before:absolute before:bottom-1 before:left-[-35%] before:-z-10 before:h-[100%] before:w-[50%] before:transform  before:py-6 before:content-[''] after:absolute after:bottom-[-10px] after:right-[-40%] after:-z-10 after:h-[100%] after:w-[50%] after:transform  after:py-6 after:content-[''] hover:bg-primary/40 active:translate-x-0 after:bg-background before:bg-background after:rounded-full before:rounded-full"
        onClick={handleClick}
      >
        Smart
      </Button> */}
      <CardHeader className="flex items-center gap-4 p-3">
        <h1 className="text-md flex-grow font-bold">Smart</h1>
        <PlusIcon className="h-6 w-6 text-primary" />
        <HistoryIcon className="h-5 w-5 text-muted-foreground" />
        <button onClick={handleClick}
          data-test-id="smart-btn-close"
        >
          <XMarkIcon className="h-6 w-6 text-muted-foreground" />
        </button>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-[85%] flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <Image
            alt="Your Company"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
            className="h-10"
            width={40}
            height={40}
          />
          <h2 className="text-xl font-bold text-foreground">Smart Chat</h2>
        </div>
        <h3 className="text-center text-muted-foreground/80">
          Good day! How may I assist you today?
        </h3>
      </CardContent>
      <Separator />
      <CardFooter className="flex h-[10%] items-center gap-2 p-2">
        <PlusIcon className="h-6 w-6 text-primary" />
        <Input
          placeholder="Smart Search..."
          Icon={MicrophoneIcon}
          data-test-id="smart-search-bar"
          iconClassName="text-primary"
          className="w-full rounded-full bg-muted text-foreground placeholder:text-muted-foreground/80"
        />
      </CardFooter>
    </Card>
  );
}

export function SmartMobileComponent() {

  const {open} = useSidebar();
  const smart = React.useContext(SmartContext);

  const widthClass = open ? "sm:w-[calc(100%-250px)]" : "sm:w-[calc(100%-50px)]";

  if(smart?.state === "wizard-summary") return null;

  return (
    <Drawer>
      <DrawerTrigger className={cn('fixed bottom-0 flex w-full justify-center gap-2 bg-muted p-4 lg:hidden', widthClass)}>
        <FolderSearchIcon className="h-5 w-5" /> Smart 
      </DrawerTrigger>
      <DrawerContent className="h-[70dvh]">
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
        <Separator />
        <DrawerFooter>
          <CardFooter className="mb-8 mt-4 flex h-[10%] items-center gap-2 p-1">
            <PaperClipIcon className="h-6 w-6 text-primary" />
            <Input
              placeholder="Smart Search..."
              Icon={MicrophoneIcon}
              iconClassName="text-primary"
              data-test-id="smart-search-bar-mobile"
              className="w-full rounded-full bg-muted text-foreground placeholder:text-muted-foreground/80"
            />
          </CardFooter>

          <DrawerClose className="fixed bottom-0 left-0 flex w-full justify-center gap-2 border-b-4 border-primary bg-muted p-4 text-primary lg:hidden">
            <FolderSearchIcon className="h-5 w-5 text-primary" /> Smart
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
