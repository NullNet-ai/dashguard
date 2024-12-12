"use client";

import { cn } from "~/lib/utils";
import { Fragment, forwardRef, useRef, useState } from "react";

import { Trash2 as RemoveIcon, UploadIcon } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import { useFileUpload } from "./Provider";
import axios, { type AxiosProgressEvent } from "axios";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
enum UploadState {
  IDLE = "idle",
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  ERROR = "error",
}
export const FileUploaderItem = forwardRef<
  HTMLDivElement,
  {
    index: number;
    file: File;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, file, children, ...props }, ref) => {
  const [progressState, setProgressState] = useState<number>(0);
  const [state, setState] = useState<UploadState>(UploadState.IDLE);
  const { removeFileFromSet, activeIndex, direction, handleSetFilesUploaded } =
    useFileUpload();
  const isSelected = index === activeIndex;

  const uploader = useRef(
    axios.create({
      baseURL: "/api/upload",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );

  const onProgress = (progressEvent: AxiosProgressEvent) => {
    const percentCompleted = Math.round(
      // @ts-expect-error - total is not always defined
      (progressEvent.loaded * 100) / progressEvent?.total || 1,
    );

    setProgressState(percentCompleted);
  };

  const onUploadClick = async () => {
    setState(UploadState.UPLOADING);
    const formData = new FormData();
    formData.append("file", file);
    await uploader.current
      .post("/", formData, {
        onUploadProgress: onProgress,
      })
      .then((response) => {
        setState(UploadState.UPLOADED);
        handleSetFilesUploaded(response.data.data[0].id);
      })
      .catch(() => {
        setState(UploadState.ERROR);
      });
  };

  return (
    <div
      ref={ref}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative h-6 cursor-pointer justify-between p-1",
        className,
        isSelected ? "bg-muted" : "",
      )}
      {...props}
    >
      <div className="flex h-full w-full items-center gap-1.5 font-medium leading-none tracking-tight">
        {children}
      </div>
      <Progress className="mx-2" value={progressState} />
      <div className="flex items-center gap-4">
        <div className="">
          <Badge className="right-0 top-0">{progressState}%</Badge>
        </div>
        {/* <ProgressCircle percentage={progressState} /> */}
        {state === UploadState.IDLE && (
          <Fragment>
            <div className="flex items-center gap-4">
              <button type="button" onClick={onUploadClick}>
                <UploadIcon className="h-4 w-4 hover:stroke-primary" />
              </button>
            </div>
          </Fragment>
        )}
        <button
          type="button"
          className={cn(direction === "rtl" ? "left-1 top-1" : "right-1 top-1")}
          onClick={() => removeFileFromSet(index)}
        >
          <span className="sr-only">remove item {index}</span>
          <RemoveIcon className="h-4 w-4 duration-200 ease-in-out hover:stroke-destructive" />
        </button>
        {state === UploadState.ERROR && (
          <div className="flex items-center gap-2">
            <span className="text-destructive">!</span>
          </div>
        )}
      </div>
    </div>
  );
});

FileUploaderItem.displayName = "FileUploaderItem";
