"use client";

import CircularProgress from "@mui/material/CircularProgress";

export default function Loader() {
  return (
    <div className="flex justify-center items-center h-full">
      <CircularProgress className="mb-10" />
    </div>
  );
}
