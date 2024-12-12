"use client";

import { cn } from "~/lib/utils";
import {
  type Dispatch,
  type SetStateAction,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  useDropzone,
  type DropzoneState,
  type FileRejection,
  type DropzoneOptions,
} from "react-dropzone";
import { toast } from "sonner";
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import axios from "axios";
import Bluebird from "bluebird";
import { UploadState } from "./FileUploaderItem";

type DirectionOptions = "rtl" | "ltr" | undefined;

type FileUploaderContextType = {
  dropzoneState: DropzoneState;
  isLOF: boolean;
  isFileTooBig: boolean;
  removeFileFromSet: (index: number) => void;
  handleSetFilesUploaded: (file_id: string) => void;
  onFileUploaded?: (file_id: string) => void;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  orientation: "horizontal" | "vertical";
  direction: DirectionOptions;
  value?: File[] | null;
  formRenderProps?: {
    field: ControllerRenderProps<Record<string, string[]>>;
    fieldState: ControllerFieldState;
  };
  progressState?: number[];
  state?: any;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
  const context = useContext(FileUploaderContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploaderProvider");
  }
  return context;
};

export type FileUploaderProps = {
  value?: File[] | null;
  reSelect?: boolean;
  onUploadFile?: (file_ids: string[]) => void;
  dropzoneOptions: DropzoneOptions;
  orientation?: "horizontal" | "vertical";
  formRenderProps?: {
    field: ControllerRenderProps<Record<string, string[]>>;
    fieldState: ControllerFieldState;
  };
};

export const FileUploader = forwardRef<
  HTMLDivElement,
  FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      dropzoneOptions,
      reSelect,
      orientation = "vertical",
      children,
      dir,
      onUploadFile,
      formRenderProps,
      ...props
    },
    ref,
  ) => {
    const [filesUploaded, setFilesUploaded] = useState<string[]>([]);
    const [value, setValue] = useState<File[] | null>(null);
    const [isFileTooBig, setIsFileTooBig] = useState(false);
    const [isLOF, setIsLOF] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [state, setState] = useState<UploadState>(UploadState.IDLE);
    const [progressState, setProgressState] = useState<number[]>([]);

    const {
      accept = {
        "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      },
      maxFiles = 1,
      maxSize = 4 * 1024 * 1024,
      multiple = true,
    } = dropzoneOptions;

    const reSelectAll = maxFiles === 1 ? true : reSelect;
    const direction: DirectionOptions = dir === "rtl" ? "rtl" : "ltr";

    const onValueChange = (value: File[] | null) => {
      setValue(value);
    };

    const handleSetFilesUploaded = (file_id: string) => {
      setFilesUploaded((prev) => [...prev, file_id]);
    };

    const removeFileFromSet = useCallback(
      (i: number) => {
        if (!value) return;
        const newFiles = value.filter((_, index) => index !== i);
        onValueChange(newFiles);
        setValue(newFiles);

        setFilesUploaded(filesUploaded.filter((_, index) => index !== i));
        setProgressState(progressState.filter((_, index) => index !== i));
      },
      [value, onValueChange, filesUploaded, setFilesUploaded],
    );

    const startProgressUpdate = (index: number) => {
      const interval = setInterval(() => {
        setProgressState((prev) => {
          const newProgressStates = [...prev];
          const currentProgress = newProgressStates[index] || 0;
          const randomIncrement = Math.floor(Math.random() * 10) + 1;
          const updatedProgress = Math.min(
            currentProgress + randomIncrement,
            100,
          );
          newProgressStates[index] = updatedProgress;

          if (updatedProgress >= 100) {
            clearInterval(interval);
          }

          return newProgressStates;
        });
      }, 1000);
    };

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!value) return;

        const moveNext = () => {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex);
        };

        const movePrev = () => {
          const nextIndex = activeIndex - 1;
          setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex);
        };

        const prevKey =
          orientation === "horizontal"
            ? direction === "ltr"
              ? "ArrowLeft"
              : "ArrowRight"
            : "ArrowUp";

        const nextKey =
          orientation === "horizontal"
            ? direction === "ltr"
              ? "ArrowRight"
              : "ArrowLeft"
            : "ArrowDown";

        if (e.key === nextKey) {
          moveNext();
        } else if (e.key === prevKey) {
          movePrev();
        } else if (e.key === "Enter" || e.key === "Space") {
          if (activeIndex === -1) {
            dropzoneState.inputRef.current?.click();
          }
        } else if (e.key === "Delete" || e.key === "Backspace") {
          if (activeIndex !== -1) {
            removeFileFromSet(activeIndex);
            if (value.length - 1 === 0) {
              setActiveIndex(-1);
              return;
            }
            movePrev();
          }
        } else if (e.key === "Escape") {
          setActiveIndex(-1);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [value, activeIndex, removeFileFromSet],
    );

    const uploader = useRef(
      axios.create({
        baseURL: "/api/upload",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );

    const onDrop = useCallback(
      async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        const files = acceptedFiles;

        if (!files) {
          toast.error("file error , probably too big");
          return;
        }

        const newValues: File[] = value ? [...value] : [];

        if (reSelectAll) {
          newValues.splice(0, newValues.length);
        }

        await Bluebird.map(files, async (file) => {
          if (newValues.length < maxFiles) {
            newValues.push(file);
            setTimeout(async () => {
              setState(UploadState.UPLOADING);

              const fileIndex = newValues.indexOf(file);
              startProgressUpdate(fileIndex);
              const formData = new FormData();
              formData.append("file", file);
              await uploader.current
                .post("/", formData, {
                  onUploadProgress: () => startProgressUpdate(fileIndex),
                })
                .then((response) => {
                  setState(UploadState.UPLOADED);
                  handleSetFilesUploaded(response.data.data[0].id);
                })
                .catch(() => {
                  setState(UploadState.ERROR);
                  toast.error("Error uploading file");
                });
            }, 1000);
          }
        });

        onValueChange(newValues);

        if (rejectedFiles.length) {
          for (const file of rejectedFiles) {
            const error = file.errors?.[0];

            if (error?.code === "file-too-large") {
              toast.error(
                `File is too large. Max size is ${maxSize / 1024 / 1024}MB`,
              );
              break;
            }

            if (error?.message) {
              toast.error(error.message);
              break;
            }
          }
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [reSelectAll, value],
    );

    useEffect(() => {
      if (!value) return;
      if (value.length === maxFiles) {
        setIsLOF(true);
        return;
      }
      setIsLOF(false);
    }, [value, maxFiles]);

    useEffect(() => {
      if (!onUploadFile) return;
      onUploadFile(filesUploaded);
    }, [filesUploaded]);

    const opts = dropzoneOptions
      ? dropzoneOptions
      : { accept, maxFiles, maxSize, multiple };

    const dropzoneState = useDropzone({
      ...opts,
      onDrop,
      onDropRejected: () => setIsFileTooBig(true),
      onDropAccepted: () => setIsFileTooBig(false),
    });

    return (
      <FileUploaderContext.Provider
        value={{
          dropzoneState,
          isLOF,
          isFileTooBig,
          removeFileFromSet,
          handleSetFilesUploaded,
          activeIndex,
          setActiveIndex,
          orientation,
          direction,
          value,
          formRenderProps,
          progressState,
          state,
        }}
      >
        <div
          ref={ref}
          tabIndex={0}
          onKeyDownCapture={handleKeyDown}
          className={cn("grid w-full focus:outline-none", className, {
            "gap-2": value && value.length > 0,
          })}
          dir={dir}
          {...props}
        >
          {children}
        </div>
      </FileUploaderContext.Provider>
    );
  },
);

FileUploader.displayName = "FileUploader";
