import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isActivityTab } from "../lib/activityTabs.ts";
import { needsExternalConfirm } from "../lib/externalLinks.ts";
import portfolioData from "../content/portfolio.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pub = (...p: string[]) => path.join(root, "public", ...p);

test("data integrity: all internal images referenced in portfolio.json exist on disk", () => {
  const imagesToCheck: string[] = [];

  // Projects
  portfolioData.projects.forEach((p) => {
    if (p.imageUrl && p.imageUrl.startsWith("/")) imagesToCheck.push(p.imageUrl);
  });

  // Experience
  portfolioData.experience.forEach((e) => {
    if (e.imageUrl && e.imageUrl.startsWith("/")) imagesToCheck.push(e.imageUrl);
    e.media?.forEach((m) => {
      if (m.src && m.src.startsWith("/")) imagesToCheck.push(m.src);
    });
  });

  // Resources
  portfolioData.resources.forEach((r) => {
    if (r.imageUrl && r.imageUrl.startsWith("/")) imagesToCheck.push(r.imageUrl);
  });

  // Side quests
  portfolioData.activities.sideQuests.forEach((sq) => {
    sq.links?.forEach((l) => {
      assert.ok(l.url.startsWith("http"), `Side quest link ${l.url} must be http`);
    });
  });

  imagesToCheck.forEach((imgPath) => {
    const full = pub(...imgPath.replace(/^\//, "").split("/"));
    assert.ok(
      fs.existsSync(full),
      `Referenced image does not exist: ${imgPath} -> ${full}`
    );
  });
});

test("audio files exist and are loadable", () => {
  assert.ok(fs.existsSync(pub("sounds", "click.ogg")), "click.ogg must exist");
  assert.ok(fs.existsSync(pub("sounds", "thunder.ogg")), "thunder.ogg must exist");
});

test("activity tabs security and edge cases", () => {
  assert.equal(isActivityTab("sideQuests"), true);
  assert.equal(isActivityTab("reading"), true);
  assert.equal(isActivityTab("music"), true);
  assert.equal(isActivityTab("movies"), true);
  assert.equal(isActivityTab("travel"), true);

  // Malicious / invalid params
  assert.equal(isActivityTab(""), false);
  assert.equal(isActivityTab("javascript:alert(1)"), false);
  assert.equal(isActivityTab("__proto__"), false);
  assert.equal(isActivityTab(undefined), false);
  assert.equal(isActivityTab(["sideQuests"]), false);
});

test("external confirmation protects external links but leaves mailto/tel alone", () => {
  assert.equal(needsExternalConfirm("https://scholar.google.com/citations?user=-fnGGHYAAAAJ"), true);
  assert.equal(needsExternalConfirm("https://github.com/DevomB/FoldProof"), true);
  assert.equal(needsExternalConfirm("mailto:aaravghai2@gmail.com"), false);
  assert.equal(needsExternalConfirm("tel:5107147148"), false);
  assert.equal(needsExternalConfirm("/options"), false);
  assert.equal(needsExternalConfirm("/resume.pdf"), true);
});

test("portfolio content versions and values match requirements", () => {
  assert.equal(portfolioData.version, "Portfolio v1.42");
  assert.equal(portfolioData.resume.updated, "Nov 2026");
  assert.ok(portfolioData.resume.preview.includes("topology preprint on arXiv"));
  assert.equal(portfolioData.contact.scholar, "https://scholar.google.com/citations?user=-fnGGHYAAAAJ");

  const foldproof = portfolioData.projects.find((p) => p.id === "foldproof");
  assert.ok(foldproof, "FoldProof must be in projects");
  assert.ok(foldproof.tags.includes("Lean 4"));

  const peer = portfolioData.experience.find((e) => e.id === "peer-connections");
  assert.ok(peer, "Peer Connections must be in experience");

  const smc = portfolioData.activities.sideQuests.find((sq) => sq.id === "smc");
  assert.ok(smc, "SMC must be in sideQuests");

  const noLimit = portfolioData.activities.sideQuests.find((sq) => sq.id === "no-limit");
  assert.ok(noLimit, "No Limit must be in sideQuests");
});
