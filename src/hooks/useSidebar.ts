"use client";

import { useState } from "react";

export function useSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return { mobileOpen, setMobileOpen };
}
