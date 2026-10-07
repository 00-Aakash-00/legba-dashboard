"use client";

import { WalletCardsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { nav } from "@/content/copy";
import { topUpDialog, topUpForm } from "./top-up";

/**
 * The header Top-Up pill (1024px and up; spec overview.json header.topup):
 * black fill, top-lit 1px outline. On phones top-up lives in the account menu.
 */
export function TopUpButton() {
  return (
    <DialogTrigger
      handle={topUpDialog}
      onPointerEnter={topUpForm.preload}
      onFocus={topUpForm.preload}
      onPointerDown={topUpForm.preload}
      render={
        <Button
          variant="outline-pill"
          size="pill-md"
          // The vertical-gradient outline needs two backgrounds clipped to different boxes.
          style={{
            background:
              "linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #4c4c4c, #262626) border-box",
          }}
          className="hidden h-[40.5px] gap-[14.2px] border-transparent pr-[16.5px] pl-[17.6px] text-[#d1d0d1] text-[13.5px] leading-[17px] tracking-[-0.03em] hover:brightness-125 active:scale-[0.97] lg:inline-flex"
        />
      }
    >
      <WalletCardsIcon
        aria-hidden
        strokeWidth={2.25}
        className="-translate-y-[0.6px] size-[18px]"
      />
      <span className="leading-3">{nav.topUp}</span>
    </DialogTrigger>
  );
}
