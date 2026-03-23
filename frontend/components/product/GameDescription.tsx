"use client";

import { useState } from "react";

export function GameDescription({
  title,
  detailedDescription,
  aboutTheGame,
}: {
  title: string;
  detailedDescription: string;
  aboutTheGame: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <h2 className="flex items-center gap-3 font-headline text-lg font-bold uppercase tracking-tight text-on-surface mb-4">
        <span className="text-on-surface-variant">—</span>
        {title}
      </h2>

      <div className="text-sm leading-relaxed text-on-surface-variant">
        <div dangerouslySetInnerHTML={{ __html: detailedDescription }} />
      </div>
    </>
  );
}
