import assert from "node:assert/strict";
import test from "node:test";
import {
  addDiscovery,
  isSecretRoomUnlocked,
  normalizeDiscoveries,
} from "../lib/discoveries.ts";
import { parseMenuOrigin, originHref, stepsBackTo, trailAfterBack } from "../lib/menuNavigation.ts";
import { createRefreshSchedule } from "../lib/multiplayerRefresh.ts";
import { needsExternalConfirm } from "../lib/externalLinks.ts";
import { KONAMI_SWIPES, classifyFlick, isKonamiIgnoredTarget, nextSequenceIndex, swipeDirection } from "../lib/konami.ts";
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
  assert.match(loreForCommit("Random tweak").lore, /world ticked/i);
});

test("konami swipe helper reads directions and sequence", () => {
  assert.equal(swipeDirection(0, -80), "up");
  assert.equal(swipeDirection(90, 10), "right");
  assert.equal(swipeDirection(2, 2), null);
  assert.equal(nextSequenceIndex(0, "up", KONAMI_SWIPES), 1);
  assert.equal(nextSequenceIndex(1, "left", KONAMI_SWIPES), 0);
});

test("konami matcher survives an extra leading up (held key or eager swipe)", () => {
  assert.equal(nextSequenceIndex(2, "up", KONAMI_SWIPES), 2);
  const run = (tokens: string[]) => tokens.reduce((pos, t) => nextSequenceIndex(pos, t, KONAMI_SWIPES), 0);
  assert.equal(run(["up", "up", "up", "down", "down", "left", "right", "left", "right"]), KONAMI_SWIPES.length);
  assert.equal(run(["up", "up", "up", "up", "down", "down", "left", "right", "left", "right"]), KONAMI_SWIPES.length);
  assert.equal(run(["up", "down", "up", "up", "down", "down", "left", "right", "left", "right"]), KONAMI_SWIPES.length);
});

test("konami flicks ignore scroll, slow pans, and control targets", () => {
  assert.equal(classifyFlick(0, -80, 180, 0), "up");
  assert.equal(classifyFlick(90, 10, 200, 0), "right");
  assert.equal(classifyFlick(0, -80, 180, 12), null);
  assert.equal(classifyFlick(0, -80, 900, 0), null);
  assert.equal(classifyFlick(2, 2, 120, 0), null);
  assert.equal(isKonamiIgnoredTarget(null), false);
});

test("external confirm covers http and pdf, not mailto", () => {
  assert.equal(needsExternalConfirm("https://github.com/ghaiaarav"), true);
  assert.equal(needsExternalConfirm("/resume.pdf"), true);
  assert.equal(needsExternalConfirm("mailto:aaravghai2@gmail.com"), false);
  assert.equal(needsExternalConfirm("/options"), false);
});

test("Done pops history when the target is behind us, at any depth", () => {
  // Home -> Options -> About: entries behind About are ["/", "/options"].
  const trail = ["/", "/options"];
  assert.equal(stepsBackTo(trail, "/options"), 1);
  // After popping to Options, Options' Done must pop again, not push "/".
  const afterAbout = trailAfterBack(trail, 1);
  assert.deepEqual(afterAbout, ["/"]);
  assert.equal(stepsBackTo(afterAbout, "/"), 1);
  // Origin jumps go back several entries: Experience -> Options -> Contact -> Done.
  assert.equal(stepsBackTo(["/", "/experience", "/options"], "/experience"), 2);
  // Unknown history or query-string targets fall back to a push.
  assert.equal(stepsBackTo([], "/"), null);
  assert.equal(stepsBackTo(["/options"], "/options?origin=experience"), null);
});

test("panorama camera follows Minecraft's spin, sway, FOV and blur easing", async () => {
  const { panoramaAngles, panoramaFov, easeToward, PANORAMA_BASE_PITCH_DEG } = await import("../lib/panoramaMotion.ts");
  // 0.1° per tick at 20 ticks/s: a full turn every 180 seconds.
  assert.equal(Math.round(panoramaAngles(180).yawDeg), -360);
  assert.equal(panoramaAngles(0).pitchDeg, PANORAMA_BASE_PITCH_DEG);
  const sway = [0, 30, 60, 90, 120, 150, 200, 300].map((s) => panoramaAngles(s).pitchDeg - PANORAMA_BASE_PITCH_DEG);
  assert.ok(sway.every((d) => Math.abs(d) <= 5));
  assert.equal(panoramaFov(70), 85);
  assert.equal(panoramaFov(110), 125);
  assert.equal(panoramaFov(0), 45);
  // Easing converges and never overshoots, whatever the frame rate.
  let v = 0;
  for (let i = 0; i < 120; i++) v = easeToward(v, 1, 1 / 60);
  assert.equal(v, 1);
  assert.ok(easeToward(0, 1, 1 / 30) < 1);
  assert.equal(easeToward(0.5, 1, 0), 0.5);
});
