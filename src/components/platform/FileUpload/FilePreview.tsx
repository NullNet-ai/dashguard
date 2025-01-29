import { GifIcon } from "@heroicons/react/20/solid";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileText as FilePDFIcon,
  ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type FilePreviewProps = {
  file: File;
  isPreviewModalOpen: boolean;
  setIsPreviewModalOpen: (isOpen: boolean) => void;
  isImageFile: boolean;
  previewSrc: string | null;
  isPdfFile: boolean;
};

export const FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  PDF: ["application/pdf"],
  EXCEL: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  DOCS: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  GIF: ["image/gif"],
  JPEG: ["image/jpeg"],
  JPG: ["image/jpg"],
  MSWORD: ["application/msword"],
  PPT: ["application/vnd.ms-powerpoint"],
};

export function getFileTypeIcon(file: File) {
  if (FILE_TYPES.IMAGE.includes(file.type)) {
    return <ImageIcon className="h-6 w-6 text-blue-500" />;
  }
  if (FILE_TYPES.PDF.includes(file.type)) {
    return <FilePDFIcon className="h-6 w-6 text-red-500" />;
  }
  if (FILE_TYPES.EXCEL.includes(file.type)) {
    return <FileSpreadsheetIcon className="h-6 w-6 text-green-500" />;
  }
  return <FileIcon className="h-6 w-6 text-gray-500" />;
}

export const FilePreview = ({
  file,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  isImageFile,
  previewSrc,
}: FilePreviewProps) => {
  const renderPreviewContent = () => {
    if (isImageFile && previewSrc) {
      return (
        <img
          src={previewSrc}
          alt="File Preview"
          className="max-h-[400px] max-w-full object-contain"
        />
      );
    }

    if (previewSrc) {
      return (
        <iframe
          src={previewSrc}
          className="h-[500px] w-full"
          title="PDF Preview"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-4">
        {getFileTypeIcon(file)}
        <p className="mt-2 text-sm text-muted-foreground">
          No preview available for this file type
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
      <DialogContent className="h-[600px] w-[600px]">
        <DialogHeader>
          <DialogTitle>File Preview: {file.name}</DialogTitle>
        </DialogHeader>
        <div className="flex h-full w-full items-center justify-center overflow-auto">
          {renderPreviewContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
