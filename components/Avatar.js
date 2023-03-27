import Image from "next/image";
import React, { useEffect, useState } from "react";

function Avatar() {
    const [seed, setSeed] = useState(0);
     useEffect(() => {
       setSeed(Math.floor(Math.random() * 5000));
     }, []);
  return (
    <Image
      src={`https://avatars.dicebear.com/api/human/${seed}.svg`}
      height={28}
      width={28}
      objectFit="contain"
    />
  );
}

export default Avatar;
