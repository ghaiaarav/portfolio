import assert from "node:assert/strict";
import test from "node:test";
import {
  addDiscovery,
  isSecretRoomUnlocked,
  normalizeDiscoveries,
} from "../lib/discoveries.ts";
import { parseMenuOrigin, originHref } from "../lib/menuNavigation.ts";
import { createRefreshSchedule } from "../lib/multiplayerRefresh.ts";
import { needsExternalConfirm } from "../lib/externalLinks.ts";
import { KONAMI_SWIPES, nextSequenceIndex, swipeDirection } from "../lib/konami.ts";
import { loreForCommit } from "../lib/logLore.ts";
import { isPackId, panoramaFolder } from "../lib/packs.ts";
import {
  hideProject,
  pushUndo,
  renameProject,
  restoreProject,
  undoLast,
  undoStackFromHidden,
} from "../lib/projectLocalState.ts";

test("menu origins are allowlisted and map to safe return paths", () => {
  assert.equal(parseMenuOrigin("experience"), "experience");
  assert.equal(originHref(parseMenuOrigin("experience")), "/experience");
  assert.equal(parseMenuOrigin("https://example.com"), "options");
  assert.equal(originHref(parseMenuOrigin("../secret")), "/options");
});

test("discoveries are unique, persistent-safe, and gate the room", () => {
  const normalized = normalizeDiscoveries(["skin", "skin", "bogus"]);
  assert.deepEqual(normalized, ["skin"]);
  assert.strictEqual(addDiscovery(normalized, "skin"), normalized);
  const complete = ["skin", "konami", "settings", "server", "gallery"] as const;
  assert.equal(isSecretRoomUnlocked([...complete]), true);
  assert.equal(isSecretRoomUnlocked(["skin"]), false);
});

test("refresh reveals normal servers before a delayed hidden server", () => {
  const schedule = createRefreshSchedule(3, () => 0.5);
  assert.deepEqual(schedule.reveals, [520, 1040, 1560]);
  assert.equal(schedule.hiddenAt, 4060);
  assert.ok(schedule.hiddenAt - schedule.reveals.at(-1)! >= 2000);
});

test("project names and hidden state stay local and reversible", () => {
  assert.deepEqual(renameProject({}, "lowla", " My World "), { lowla: "My World" });
  assert.deepEqual(renameProject({ lowla: "LowLa" }, "lowla", "   "), { lowla: "LowLa" });
  assert.deepEqual(hideProject([], "lowla"), ["lowla"]);
  assert.deepEqual(hideProject(["lowla"], "lowla"), ["lowla"]);
  assert.deepEqual(restoreProject(["lowla", "riot"], "lowla"), ["riot"]);
});

test("project undo walks back every hide and rename, not only the last one", () => {
  const hidden = hideProject(hideProject([], "lowla"), "riot");
  let stack = undoStackFromHidden(hidden);
  let names = renameProject({}, "f1-telemetry", "Fast Cars");
  stack = pushUndo(stack, { type: "rename", id: "f1-telemetry", previous: "", next: "Fast Cars" });

  const afterRename = undoLast(stack, names, hidden);
  assert.deepEqual(afterRename.names, {});
  assert.deepEqual(afterRename.hidden, ["lowla", "riot"]);

  const afterRiot = undoLast(afterRename.stack, afterRename.names, afterRename.hidden);
  assert.deepEqual(afterRiot.hidden, ["lowla"]);

  const afterLowla = undoLast(afterRiot.stack, afterRiot.names, afterRiot.hidden);
  assert.deepEqual(afterLowla.hidden, []);
  assert.equal(afterLowla.restoredId, "lowla");
});

test("resource packs stay allowlisted and pick a night cubemap only for vanilla", () => {
  assert.equal(isPackId("beach"), true);
  assert.equal(isPackId("loosh"), false);
  assert.equal(panoramaFolder("vanilla", true), "panorama-night");
  assert.equal(panoramaFolder("nether", true), "panorama-nether");
  assert.equal(panoramaFolder("end", false), "panorama-end");
});

test("commit lore stays display-only and typed", () => {
  assert.equal(loreForCommit("Fix type error on Vercel").icon, "torch");
  assert.equal(loreForCommit("Add authentic Minecraft menu stack").icon, "map");
  assert.match(loreForCommit("Random tweak").lore, /world ticked forward/i);
});

test("konami swipe helper reads directions and sequence", () => {
  assert.equal(swipeDirection(0, -80), "up");
  assert.equal(swipeDirection(90, 10), "right");
  assert.equal(swipeDirection(2, 2), null);
  assert.equal(nextSequenceIndex(0, "up", KONAMI_SWIPES), 1);
  assert.equal(nextSequenceIndex(1, "left", KONAMI_SWIPES), 0);
});

test("external confirm covers http and pdf, not mailto", () => {
  assert.equal(needsExternalConfirm("https://github.com/ghaiaarav"), true);
  assert.equal(needsExternalConfirm("/resume.pdf"), true);
  assert.equal(needsExternalConfirm("mailto:aaravghai2@gmail.com"), false);
  assert.equal(needsExternalConfirm("/options"), false);
});
