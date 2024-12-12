import React from "react";
import { Trash2Icon, DownloadIcon, Paperclip } from "lucide-react";

export default function DocumentDisplayDetails({
  files,
}: {
  files: Record<string, string>[];
}) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {files.map((file) => {
        // const image_path = Paperclip;
        // const file_tpe = file.mimetype || "image/png";

        // if (file_tpe.includes("image/png")) {
        //   image_path = FilePNGIcon;
        // } else if (file_tpe.includes("image/jpeg")) {
        //   image_path = FileJPEGIcon;
        // } else if (file_tpe.includes("image/jpg")) {
        //   image_path = FileJPGIcon;
        // } else if (file_tpe.includes("image/gif")) {
        //   image_path = FileGIFIcon;
        // } else if (file_tpe.includes("application/pdf")) {
        //   image_path = FilePDFIcon;
        // } else if (
        //   file_tpe.includes("application/msword") ||
        //   file_tpe.includes(
        //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        //   )
        // ) {
        //   image_path = FileDocIcon;
        // } else if (file_tpe.includes("application/vnd.ms-excel")) {
        //   image_path = FileXLSIcon;
        // } else if (file_tpe.includes("application/vnd.ms-powerpoint")) {
        //   image_path = FilePPTIcon;
        // } else {
        //   image_path = Paperclip; // Default icon
        // }

        return (
          <li
            key={file.email}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
          >
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <Paperclip className="size-10" />
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {file.originalname}
                  </h3>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {file.mimetype}
                  </span>
                </div>
                {/* <p className="mt-1 truncate text-sm text-gray-500">
                  {file.download_path}
                </p> */}
              </div>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  <a className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                    <DownloadIcon
                      aria-hidden="true"
                      className="size-5 text-gray-400"
                    />
                    Download
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                    <Trash2Icon
                      aria-hidden="true"
                      className="size-5 text-gray-400"
                    />
                    Delete
                  </a>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
