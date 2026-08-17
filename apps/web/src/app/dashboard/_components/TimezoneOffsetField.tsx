"use client";

import { useEffect, useState } from "react";

export function TimezoneOffsetField({ name }: { name: string }) {
  const [offset, setOffset] = useState("");
  useEffect(() => setOffset(String(new Date().getTimezoneOffset())), []);
  return <input type="hidden" name={name} value={offset} />;
}
