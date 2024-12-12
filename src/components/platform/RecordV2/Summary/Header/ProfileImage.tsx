

import Image from "next/image";

export default function ProfileImage() {
  return (
    <div className="mt-2 p-2 px-4 flex justify-center">
      <Image
        alt="dummy image"
        className="rounded-md w-full"
        src="/dummyImage.png"
        height={300}
        width={300}
      />
    </div>
  );
}
