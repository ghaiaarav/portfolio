"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import { useMcGui } from "@/components/mc/McGuiProvider";
import { useMcSound } from "@/hooks/useMcSound";
import { PACKS, type PackInfo } from "@/lib/packs";
import { useMemo } from "react";

function packDisplayName(item: PackInfo): string {
  return item.id === "vanilla" ? "Default" : item.name;
}

function PackEntry({
  item,
  direction,
  disabled,
  onTransfer,
}: {
  item: PackInfo;
  direction: "in" | "out";
  disabled?: boolean;
  onTransfer: () => void;
}) {
  return (
    <div className="mc-resource-entry mc-pack-entry">
      <div className="mc-resource-entry__icon">
        <img src={item.icon} alt="" width={58} height={44} />
        <button
          type="button"
          className={`mc-pack-transfer mc-pack-transfer--${direction}`}
          disabled={disabled}
          aria-label={direction === "in" ? `Select ${packDisplayName(item)}` : `Remove ${packDisplayName(item)}`}
          onClick={onTransfer}
        />
      </div>
      <div className="mc-resource-entry__text">
        <div className="mc-resource-entry__name">{packDisplayName(item)}</div>
        <div className="mc-resource-entry__desc">{item.description}</div>
      </div>
    </div>
  );
}

export default function ResourcePacksScreen() {
  const { pack, applyPack, packLoading } = useMcGui();
  const { playClick } = useMcSound();
  const available = useMemo(() => PACKS.filter((item) => item.id !== pack), [pack]);
  const selectedPack = PACKS.find((item) => item.id === pack) ?? PACKS[0];

  const transferIn = (id: PackInfo["id"]) => {
    if (packLoading || id === pack) return;
    playClick();
    applyPack(id);
  };

  const transferOut = () => {
    if (packLoading || pack === "vanilla") return;
    playClick();
    applyPack("vanilla");
  };

  return (
    <McMenuScreen title="Select Resource Packs" doneHref="/options" wide>
      <div className="mc-resource-columns mc-resource-columns--packs">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Available Resource Packs</div>
          <div className="mc-resource-column__list">
            {available.map((item) => (
              <PackEntry
                key={item.id}
                item={item}
                direction="in"
                disabled={packLoading}
                onTransfer={() => transferIn(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Selected Resource Packs</div>
          <div className="mc-resource-column__list">
            <PackEntry
              item={selectedPack}
              direction="out"
              disabled={packLoading || selectedPack.id === "vanilla"}
              onTransfer={transferOut}
            />
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
