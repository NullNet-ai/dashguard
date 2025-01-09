import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { UploadState } from "./FileUploaderItem";
import Cropper from "react-easy-crop";
import { Slider } from "~/components/ui/slider";

type FileCropProps = {
  isCropModalOpen: boolean;
  setIsCropModalOpen: (isOpen: boolean) => void;
  imageSrc?: string | null;
  cropState: any;
  onCropChange: any;
  onZoomChange: any;
  state: UploadState;
  formRenderProps: any;
  handleCropAndSave: () => void;
  previewCanvasRef: any;
  onCropComplete: any;
  rotateImage: (newRotation: number[]) => void;
  setCropState: any;
};

export const FileCrop = ({
  isCropModalOpen,
  setIsCropModalOpen,
  imageSrc,
  cropState,
  onCropChange,
  onZoomChange,
  state,
  formRenderProps,
  handleCropAndSave,
  previewCanvasRef,
  onCropComplete,
  rotateImage,
}: FileCropProps) => {
  return (
    <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
      <DialogContent className="h-[550px] px-5 sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Crop and Rotate Image</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2 h-[400px] w-full">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={cropState.crop}
              zoom={cropState.zoom}
              rotation={cropState.rotation}
              aspect={4 / 3}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
              minZoom={1}
              showGrid={false}
              onRotationChange={(newRotation: number) =>
                rotateImage([newRotation])
              }
            />
          )}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <label
            htmlFor="rotation-slider"
            className="text-sm text-muted-foreground"
          >
            Rotation:
          </label>
          <Slider
            id="rotation-slider"
            value={cropState?.rotation}
            min={0}
            max={360}
            step={1}
            aria-labelledby="Rotation"
            label={(value) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
            labelPosition="bottom"
            className="w-full"
            onValueChange={(newValue: number[]) => rotateImage(newValue)}
          />

          <label
            htmlFor="zoom-slider"
            className="text-sm text-muted-foreground"
          >
            Zoom:
          </label>
          <Slider
            id="zoom"
            value={[cropState?.zoom]}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            label={(value) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
            labelPosition="bottom"
            className="w-full"
            onValueChange={(newValue: number[]) => onZoomChange(newValue)}
          />
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsCropModalOpen(false)}
              disabled={
                state === UploadState.UPLOADING ||
                formRenderProps?.field?.disabled
              }
            >
              Cancel
            </Button>
            <Button onClick={handleCropAndSave}>Save</Button>
          </div>
        </div>
        <canvas ref={previewCanvasRef} style={{ display: "block" }} />
      </DialogContent>
    </Dialog>
  );
};
