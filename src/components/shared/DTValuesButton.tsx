
"use client";

import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function DTValuesButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => {
        router.push("/dt-values");
      }}
    >
      DT Values
    </Button>
  );
}
