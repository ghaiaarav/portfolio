import { rmSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
rmSync(join(root, ".next"), { recursive: true, force: true });
console.log("Removed .next cache");
