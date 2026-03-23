"use client";

import { useState } from "react";
import type { GameDetail } from "@/lib/types";

export function GameInfoSidebar({ game }: { game: GameDetail }) {
  const [reqTab, setReqTab] = useState<"minimum" | "recommended">("minimum");
  const reqs = game.pc_requirements[reqTab] || "No requirements provided.";
  const languageRows = game.supported_languages
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <>
      {/* Languages */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
          Supported Languages
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-on-surface-variant">
              <th className="pb-1.5 text-left font-normal">Languages</th>
              <th className="pb-1.5 text-center font-normal">Support</th>
            </tr>
          </thead>
          <tbody>
            {languageRows.map((lang) => (
              <tr key={lang}>
                <td className="py-1 text-on-surface">{lang.replace(/\*/g, "")}</td>
                <td className="py-1 text-center text-primary">{lang.includes("*") ? "Full Audio" : "UI/Sub"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Requirements */}
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
          System Requirements
        </p>
        <div className="mb-3 flex gap-1 rounded-lg bg-surface-container p-1">
          {(["minimum", "recommended"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setReqTab(tab)}
              className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                reqTab === tab
                  ? "bg-surface-container-highest text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div
          className="space-y-2 text-sm text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: reqs }}
        />
        <div className="pt-1 text-[10px] text-on-surface-variant">
          {game.platforms.windows ? "Windows " : ""}
          {game.platforms.mac ? "Mac " : ""}
          {game.platforms.linux ? "Linux" : ""}
        </div>
      </div>

      {/* Social Sharing */}
      <div className="flex gap-3 pt-2">
        {["share", "bookmark", "flag"].map((action) => (
          <button
            key={action}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label={action}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {action === "share" && (
                <>
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </>
              )}
              {action === "bookmark" && (
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              )}
              {action === "flag" && (
                <>
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" x2="4" y1="22" y2="15" />
                </>
              )}
            </svg>
          </button>
        ))}
      </div>
    </>
  );
}
