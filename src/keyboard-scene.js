// Stage 1: the keyboard object itself. Real WebGPU (three/webgpu), no
// shader authoring yet — standard PBR materials, real physical key-press
// response to actual keydown/keyup, pointer parallax, and a simple pooled
// "pressure ring" effect. Bundle with `npm run build:keyboard`.
import {
  Scene,
  PerspectiveCamera,
  WebGPURenderer,
  Group,
  BoxGeometry,
  RingGeometry,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  DoubleSide,
  Color,
  CanvasTexture,
  SRGBColorSpace,
  Raycaster,
  Vector2,
} from "three/webgpu";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// A crisp, code-drawn legend beats trying to match a photographed keycap
// texture — no image asset needed, and it stays sharp at any size.
function makeLetterTexture(letter, color) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.font =
    '600 66px -apple-system, "SF Pro Display", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(letter, size / 2, size / 2 + 4);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// The site mark (see images/mark.svg), redrawn to a canvas so it can sit on
// the plate as a real decal instead of a flat image overlay.
function makeLogoTexture(tokens) {
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const s = size / 100;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 20 * s);
  ctx.fillStyle = tokens.ink;
  ctx.fill();
  ctx.save();
  ctx.scale(s, s);
  ctx.fillStyle = tokens.accentBright;
  ctx.fill(new Path2D("M57 20v54H44a20 20 0 1 1 0-40h3V20ZM44 46a8 8 0 1 0 0 16h3V46Z"));
  ctx.restore();
  ctx.fillStyle = tokens.bg;
  ctx.fillRect(65 * s, 62 * s, 12 * s, 12 * s);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const ROWS = [
  { letters: "QWERTYUIOP", z: -1.05, offset: 0 },
  { letters: "ASDFGHJKL", z: 0, offset: 0.5 },
  { letters: "ZXCVBNM", z: 1.05, offset: 1.0 },
];
const PITCH = 1;
// Low-profile, tight-gap chiclet keys (Mac-style scissor-switch keyboard),
// not tall mechanical-style keycaps.
const KEY_SIZE = 0.94;
const KEY_HEIGHT = 0.12;
const PRESS_DEPTH = 0.055;
const SPACE_Z = 2.1;
const RING_POOL_SIZE = 6;
const RING_DURATION = 0.9;

export function supportsWebgpu() {
  return typeof navigator !== "undefined" && !!navigator.gpu;
}

function buildLayout() {
  const positions = new Map();
  let minX = Infinity;
  let maxX = -Infinity;
  for (const row of ROWS) {
    for (let i = 0; i < row.letters.length; i++) {
      const x = row.offset + i * PITCH;
      positions.set(row.letters[i], { x, z: row.z });
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }
  const spaceWidth = 5.5;
  const spaceX = (minX + maxX) / 2;
  positions.set(" ", { x: spaceX, z: SPACE_Z, width: spaceWidth });
  const centerX = (minX + maxX) / 2;
  for (const value of positions.values()) value.x -= centerX;
  return positions;
}

const DEFAULT_NAV_LETTERS = ["A", "S", "D", "F", "G", "Z", "X", "C", "V", "B"];

export async function initKeyboardScene(canvas, tokens, options = {}) {
  const { ink, muted, surface, surfaceRaised, bg, accentBright } = tokens;
  const navLetters = new Set(options.navLetters ?? DEFAULT_NAV_LETTERS);
  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
    forceWebGL: !supportsWebgpu(),
  });
  await renderer.init();
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 60);
  const lookTarget = { x: 0, y: 0, z: 0.35 };
  // Fixed viewing angle (direction only); resize() sets the actual distance
  // each time so the whole plate fits the frustum regardless of the
  // container's aspect ratio. A hardcoded distance only ever worked for the
  // one aspect ratio it was tuned against — anything narrower cropped the
  // plate's left/right edges.
  const viewDir = { x: 0, y: 0.6822, z: 0.7311 }; // normalize(0, 9.5, 10.15)
  const BOUNDING_RADIUS = 7.15; // plate's true half-diagonal (~7.07) + a hair
  const cameraBase = { x: 0, y: 0, z: 0 };
  function fitCameraDistance(aspect) {
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const limitFov = Math.min(vFov, hFov);
    return (BOUNDING_RADIUS / Math.sin(limitFov / 2)) * 1.015;
  }
  function placeCamera(aspect) {
    const distance = fitCameraDistance(aspect);
    cameraBase.x = lookTarget.x + viewDir.x * distance;
    cameraBase.y = lookTarget.y + viewDir.y * distance;
    cameraBase.z = lookTarget.z + viewDir.z * distance;
  }
  placeCamera(1.68);
  camera.position.set(cameraBase.x, cameraBase.y, cameraBase.z);
  camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);

  renderer.shadowMap.enabled = true;
  scene.add(new AmbientLight(0xffffff, 0.42));
  scene.add(new HemisphereLight(0xfff6e8, new Color(muted), 0.45));
  const key = new DirectionalLight(0xfff2df, 1.35);
  key.position.set(4, 7.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0015;
  scene.add(key);
  const fill = new DirectionalLight(new Color(accentBright), 0.3);
  fill.position.set(-5, 3, -3);
  scene.add(fill);

  const layout = buildLayout();
  // A thin aluminum-style slab, not a thick rounded mechanical-keyboard
  // block — this is most of what reads as "Mac keyboard" from a distance.
  const plateWidth = 12.6;
  const plateDepth = 6.4;
  const PLATE_HEIGHT = 0.42;
  const plateGeometry = new RoundedBoxGeometry(
    plateWidth,
    PLATE_HEIGHT,
    plateDepth,
    3,
    0.16,
  );
  const plateMaterial = new MeshStandardMaterial({
    color: new Color(surface),
    roughness: 0.55,
    metalness: 0.14,
  });
  const plate = new Mesh(plateGeometry, plateMaterial);
  plate.position.set(0, -PLATE_HEIGHT / 2, 0.55);
  plate.receiveShadow = true;
  scene.add(plate);
  const plateTopY = 0;

  // A small badge in the front-left corner of the deck, in the empty strip
  // below the ZXCVBNM row — the one spot on the plate with no keys on it.
  const logoGeometry = new PlaneGeometry(0.9, 0.9);
  logoGeometry.rotateX(-Math.PI / 2);
  const logoMesh = new Mesh(
    logoGeometry,
    new MeshBasicMaterial({
      map: makeLogoTexture({ ink, accentBright, bg }),
      transparent: true,
      depthWrite: false,
    }),
  );
  logoMesh.position.set(-plateWidth / 2 + 1.35, plateTopY + 0.006, 2.68);
  scene.add(logoMesh);

  const capGeometry = new RoundedBoxGeometry(
    KEY_SIZE,
    KEY_HEIGHT,
    KEY_SIZE,
    2,
    0.035,
  );
  const capMaterial = new MeshStandardMaterial({
    color: new Color(bg),
    roughness: 0.6,
    metalness: 0.03,
  });
  // The ten navigation keys get their own cap color so they read as
  // special at rest, not just on interaction.
  const navCapMaterial = new MeshStandardMaterial({
    color: new Color(accentBright),
    roughness: 0.55,
    metalness: 0.04,
  });
  const spaceGeometry = new RoundedBoxGeometry(
    layout.get(" ").width,
    KEY_HEIGHT,
    KEY_SIZE,
    2,
    0.035,
  );

  // One small plane per key, textured with that key's letter and parented
  // to the keycap so it presses down and tilts with it.
  const legendGeometry = new PlaneGeometry(KEY_SIZE * 0.5, KEY_SIZE * 0.5);
  legendGeometry.rotateX(-Math.PI / 2);

  const keys = new Map();
  const keyGroup = new Group();
  scene.add(keyGroup);
  for (const [letter, position] of layout) {
    const isNav = navLetters.has(letter);
    const geometry = letter === " " ? spaceGeometry : capGeometry;
    const mesh = new Mesh(geometry, isNav ? navCapMaterial : capMaterial);
    const restY = plateTopY + KEY_HEIGHT / 2 + 0.012;
    mesh.position.set(position.x, restY, position.z);
    mesh.castShadow = true;
    mesh.userData.letter = letter;
    if (letter !== " ") {
      const legend = new Mesh(
        legendGeometry,
        new MeshBasicMaterial({
          map: makeLetterTexture(letter, isNav ? bg : ink),
          transparent: true,
          depthWrite: false,
        }),
      );
      legend.position.y = KEY_HEIGHT / 2 + 0.002;
      mesh.add(legend);
    }
    keyGroup.add(mesh);
    keys.set(letter, {
      mesh,
      restY,
      targetY: restY,
      x: position.x,
      z: position.z,
    });
  }

  const ringGeometry = new RingGeometry(0.1, 0.16, 40);
  ringGeometry.rotateX(-Math.PI / 2);
  const ringPool = Array.from({ length: RING_POOL_SIZE }, () => {
    const material = new MeshBasicMaterial({
      color: new Color(accentBright),
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      depthWrite: false,
    });
    const mesh = new Mesh(ringGeometry, material);
    mesh.visible = false;
    mesh.userData.age = RING_DURATION;
    scene.add(mesh);
    return mesh;
  });
  let ringCursor = 0;

  const ringRiseStart = plateTopY + KEY_HEIGHT + 0.06;
  function pulseAt(x, z, strong = false) {
    const ring = ringPool[ringCursor];
    ringCursor = (ringCursor + 1) % ringPool.length;
    ring.position.set(x, ringRiseStart, z);
    ring.userData.age = 0;
    ring.userData.duration = strong ? RING_DURATION * 1.8 : RING_DURATION;
    ring.userData.reach = strong ? 1.7 : 1;
    ring.visible = true;
  }

  function pressKey(letter) {
    const entry = keys.get(letter.toUpperCase());
    if (!entry) return false;
    entry.targetY = entry.restY - PRESS_DEPTH;
    pulseAt(entry.x, entry.z);
    return true;
  }
  function releaseKey(letter) {
    const entry = keys.get(letter.toUpperCase());
    if (!entry) return;
    entry.targetY = entry.restY;
  }
  // A held, intentional activation (not just a passing tap): a slower,
  // wider pulse and a small camera lean toward that key. The key itself
  // stays down — the caller only calls releaseKey once the physical key
  // actually comes back up.
  function activateKey(letter) {
    const entry = keys.get(letter.toUpperCase());
    if (!entry) return;
    pulseAt(entry.x, entry.z, true);
    focusTarget = { x: entry.x, z: entry.z };
  }
  function clearFocus() {
    focusTarget = null;
  }
  function getKeyScreenPosition(letter) {
    const entry = keys.get(letter.toUpperCase());
    if (!entry || !width || !height) return null;
    const vector = { x: entry.x, y: entry.restY + 0.4, z: entry.z };
    const projected = projectToScreen(vector, camera, width, height);
    return projected;
  }

  // Clicking/tapping a key: x, y are CSS pixels relative to the canvas.
  const raycaster = new Raycaster();
  const pointerNdc = new Vector2();
  const keyMeshes = [...keys.values()].map((entry) => entry.mesh);
  function hitTestKey(x, y) {
    if (!width || !height) return null;
    pointerNdc.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObjects(keyMeshes, false)[0];
    return hit ? hit.object.userData.letter : null;
  }

  let width = 1;
  let height = 1;
  function resize(w, h) {
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    const aspect = w / Math.max(h, 1);
    camera.aspect = aspect;
    placeCamera(aspect);
    camera.updateProjectionMatrix();
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));

  let targetPX = 0;
  let targetPY = 0;
  let px = 0;
  let py = 0;
  function setPointer(nx, ny) {
    targetPX = nx;
    targetPY = ny;
  }
  let focusTarget = null;
  let focusX = 0;
  let focusZ = 0;

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    px += (targetPX - px) * 0.06;
    py += (targetPY - py) * 0.06;
    const fx = focusTarget ? focusTarget.x : 0;
    const fz = focusTarget ? focusTarget.z : 0;
    focusX += (fx - focusX) * 0.05;
    focusZ += (fz - focusZ) * 0.05;
    camera.position.x = cameraBase.x + px * 1.1 + focusX * 0.16;
    camera.position.y = cameraBase.y - py * 0.55 - Math.abs(focusZ) * 0.05;
    camera.position.z = cameraBase.z - focusZ * 0.1;
    camera.lookAt(
      lookTarget.x + focusX * 0.12,
      lookTarget.y,
      lookTarget.z + focusZ * 0.12,
    );

    keys.forEach((entry) => {
      entry.mesh.position.y +=
        (entry.targetY - entry.mesh.position.y) * 0.35;
    });

    for (const ring of ringPool) {
      if (!ring.visible) continue;
      ring.userData.age += dt;
      const duration = ring.userData.duration || RING_DURATION;
      const reach = ring.userData.reach || 1;
      const t = Math.min(ring.userData.age / duration, 1);
      const scale = (0.15 + t * 3.2) * reach;
      ring.scale.set(scale, 1, scale);
      ring.position.y = ringRiseStart + t * 0.5;
      ring.material.opacity = (1 - t) * 0.6;
      if (t >= 1) ring.visible = false;
    }

    renderer.render(scene, camera);
    frame.handle = requestAnimationFrame(frame);
  }

  function start() {
    last = performance.now();
    if (!frame.handle) frame.handle = requestAnimationFrame(frame);
  }
  function stop() {
    if (frame.handle) cancelAnimationFrame(frame.handle);
    frame.handle = null;
  }
  function destroy() {
    stop();
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material))
          object.material.forEach((m) => m.dispose());
        else object.material.dispose();
      }
    });
    renderer.dispose();
  }

  return {
    resize,
    setPointer,
    pressKey,
    releaseKey,
    activateKey,
    clearFocus,
    getKeyScreenPosition,
    hitTestKey,
    start,
    stop,
    destroy,
  };
}

function projectToScreen(point, camera, width, height) {
  camera.updateMatrixWorld();
  const v = { x: point.x, y: point.y, z: point.z, w: 1 };
  const m = camera.matrixWorldInverse.elements;
  const p = camera.projectionMatrix.elements;
  const vx = m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12];
  const vy = m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13];
  const vz = m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14];
  const vw = m[3] * v.x + m[7] * v.y + m[11] * v.z + m[15];
  const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12] * vw;
  const cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13] * vw;
  const cw = p[3] * vx + p[7] * vy + p[11] * vz + p[15] * vw;
  if (cw <= 0) return null;
  const ndcX = cx / cw;
  const ndcY = cy / cw;
  return {
    x: ((ndcX + 1) / 2) * width,
    y: ((1 - ndcY) / 2) * height,
  };
}
