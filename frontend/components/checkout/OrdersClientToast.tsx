"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PurchaseSuccessToast } from "./PurchaseSuccessToast";

export function OrdersClientToast() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(searchParams.get("purchase") === "success");
  }, [searchParams]);

  if (!visible) return null;

  return <PurchaseSuccessToast visible={true} onDismiss={() => setVisible(false)} />;
}
