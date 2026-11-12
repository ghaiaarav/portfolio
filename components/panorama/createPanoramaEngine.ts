import { MENU_BLUR, easeToward, panoramaAngles, panoramaFov } from "@/lib/panoramaMotion";
import type * as Three from "three";

export type PanoramaSettings = {
  folder: string;
  isTitle: boolean;
  reducedMotion: boolean;
  fov: number;
  nightTint: boolean;
};

// Minecraft names faces 0-5 as front, right, back, left, up, down (0→1→2→3
// runs clockwise). three.js mirrors x when sampling a CubeTexture background,
// so with the camera facing -z: right (1) goes in the -x slot, left (3) in +x,
// and the up/down faces need a half turn (see rotateHalfTurn).
// CubeTextureLoader order: +x, -x, +y, -y, +z, -z.
const FACE_ORDER = [3, 1, 4, 5, 2, 0];

function rotateHalfTurn(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (context) {
    context.translate(canvas.width, canvas.height);
    context.rotate(Math.PI);
    context.drawImage(image, 0, 0);
  }
  return canvas;
}
const DEG = Math.PI / 180;

/**
 * A skybox renderer for the title-screen panorama. It reads settings every
 * frame, so callers only need to keep `getSettings` current.
 */
export function createPanoramaEngine(
  THREE: typeof Three,
  canvas: HTMLCanvasElement,
  getSettings: () => PanoramaSettings,
  onReady: () => void
) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(85, 1, 0.1, 10);
  camera.rotation.order = "YXZ";
  const loader = new THREE.CubeTextureLoader();

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  let requested: string | null = null;
  let texture: Three.CubeTexture | null = null;
  let announced = false;
  let blur = getSettings().isTitle ? 0 : MENU_BLUR;
  let intensity = getSettings().nightTint ? 0.45 : 1;
  let elapsed = 0;
  let last = performance.now();

  const load = (folder: string) => {
    requested = folder;
    loader.load(
      FACE_ORDER.map((face) => `/${folder}/${face}.webp`),
      (next) => {
        if (requested !== folder) {
          next.dispose();
          return;
        }
        next.colorSpace = THREE.SRGBColorSpace;
        next.images[2] = rotateHalfTurn(next.images[2]);
        next.images[3] = rotateHalfTurn(next.images[3]);
        next.needsUpdate = true;
        const previous = texture;
        texture = next;
        scene.background = next;
        previous?.dispose();
        if (!announced) {
          announced = true;
          // Build the blurred (PMREM) version now, so the first menu doesn't hitch.
          scene.backgroundBlurriness = 0.001;
          renderer.render(scene, camera);
          onReady();
        }
      },
      undefined,
      // On failure keep `requested` as is (no retry storm); the static fallback image stays up.
      () => {}
    );
  };

  renderer.setAnimationLoop((now: number) => {
    const settings = getSettings();
    if (settings.folder !== requested) load(settings.folder);

    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    if (!settings.reducedMotion) elapsed += dt;

    const { yawDeg, pitchDeg } = panoramaAngles(elapsed);
    camera.rotation.set(-pitchDeg * DEG, yawDeg * DEG, 0);

    const fov = panoramaFov(settings.fov);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = easeToward(camera.fov, fov, dt, 0.08);
      camera.updateProjectionMatrix();
    }

    blur = easeToward(blur, settings.isTitle ? 0 : MENU_BLUR, dt, 0.09);
    scene.backgroundBlurriness = blur;
    intensity = easeToward(intensity, settings.nightTint ? 0.45 : 1, dt, 0.2);
    scene.backgroundIntensity = intensity;

    if (texture) renderer.render(scene, camera);
  });

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      texture?.dispose();
      renderer.dispose();
    },
  };
}
