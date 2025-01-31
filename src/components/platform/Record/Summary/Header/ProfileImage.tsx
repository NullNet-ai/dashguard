

import Image from 'next/image';
// import { ImageIcon } from "lucide-react";

export default function ProfileImage() {
  return (
    <div className="mt-2 p-2 px-4 flex justify-center">
      <Image
        alt="dummy image"
        className="rounded-md w-full"
        src="/pfSenseRecordImg.png"
        height={300}
        width={300}
      />

      {/* <section title="image placeholder" className="bg-muted w-full md:w-[300px] h-[150px] grid place-content-center">
        <ImageIcon className="size-6 text-primary opacity-70"  />
      </section> */}
    </div>
  );
}
