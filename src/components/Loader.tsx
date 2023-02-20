"use client";

type Props = {
  className?: string;
  size?: number;
};

export default function Loader({ className, size }: Props) {
  return (
    <div className={`flex justify-center items-center h-full ${className}`}>
      <img
        className="w-[250px] object-contain"
        src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
        alt="Loading..."
      />
    </div>
  );
}
