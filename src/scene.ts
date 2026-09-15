import * as THREE from "three";

export function createHeroScene(figure: HTMLElement): () => void {
  const stage = figure.querySelector<HTMLElement>(".architecture-stage")!;
  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  // All interactions and descriptions have equivalent native HTML controls.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(0, 0.3, 8.8);
  camera.lookAt(0, 0.1, 0);
  const model = new THREE.Group();
  scene.add(model);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x14213d, 3));
  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(3, 5, 4);
  scene.add(light);
  const rim = new THREE.DirectionalLight(0xffffff, 4);
  rim.position.set(-4, -1, 2);
  scene.add(rim);
  const accentLight = new THREE.PointLight(0xffffff, 12, 15);
  accentLight.position.set(-3, 2, 2);
  scene.add(accentLight);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const ringMaterials: THREE.MeshStandardMaterial[] = [];
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0xfca311,
    roughness: 0.34,
    metalness: 0.38,
    emissive: 0x000000,
    emissiveIntensity: 0.22,
  });
  const silverMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5e5e5,
    roughness: 0.24,
    metalness: 0.65,
  });
  materials.push(coreMaterial, silverMaterial);
  const planes: THREE.Group[] = [];
  const names = ["data", "backend", "interface"];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(10, 10);
  let targetX = 0;
  let targetY = 0;
  let progress = 0;
  let hovered = -1;
  let visible = false;
  let disposed = false;
  let frame = 0;
  let previous = 0;
  let samples = 0;
  let sampleTime = 0;
  let maxDpr = Math.min(devicePixelRatio || 1, innerWidth < 600 ? 1.25 : 1.75);
  let dpr = maxDpr;
  let width = 1;
  let height = 1;

  const tilts = [
    [0.9, -0.3, -0.4],
    [-0.6, 0.9, 0.5],
    [0.6, 0.5, 1.3],
  ];
  for (let layer = 0; layer < 3; layer++) {
    const group = new THREE.Group();
    group.userData.layer = layer;
    group.rotation.set(...(tilts[layer] as [number, number, number]));
    model.add(group);
    planes.push(group);
    const geometry = new THREE.TorusGeometry(
      1.18 + layer * 0.43,
      0.105 + layer * 0.015,
      12,
      120,
    );
    geometries.push(geometry);
    const material = new THREE.MeshStandardMaterial({
      color: 0xe5e5e5,
      roughness: 0.26,
      metalness: 0.65,
    });
    materials.push(material);
    ringMaterials.push(material);
    group.add(new THREE.Mesh(geometry, material));
    const orbitGeometry = new THREE.SphereGeometry(0.12, 16, 12);
    geometries.push(orbitGeometry);
    for (let i = 0; i < 2; i++) {
      const satellite = new THREE.Mesh(
        orbitGeometry,
        i === 0 ? coreMaterial : silverMaterial,
      );
      const angle = layer * 1.8 + i * Math.PI;
      satellite.position.set(
        Math.cos(angle) * (1.18 + layer * 0.43),
        Math.sin(angle) * (1.18 + layer * 0.43),
        0,
      );
      group.add(satellite);
    }
  }
  const coreGeometry = new THREE.IcosahedronGeometry(0.61, 0);
  geometries.push(coreGeometry);
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.rotation.set(0.25, 0.4, 0.2);
  model.add(core);
  const coreEdges = new THREE.EdgesGeometry(coreGeometry);
  geometries.push(coreEdges);
  const coreLine = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
  });
  materials.push(coreLine);
  core.add(new THREE.LineSegments(coreEdges, coreLine));
  const marksGeometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    positions.push(Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, -0.8);
  }
  marksGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometries.push(marksGeometry);
  const marksMaterial = new THREE.PointsMaterial({
    color: 0xe5e5e5,
    size: 0.025,
    transparent: true,
    opacity: 0.65,
  });
  materials.push(marksMaterial);
  scene.add(new THREE.Points(marksGeometry, marksMaterial));
  stage.append(canvas);

  function colors() {
    planes.forEach((_, i) => {
      const active = names[i] === figure.dataset.selected;
      ringMaterials[i].color.set(
        active ? 0xfca311 : i === 1 ? 0x14213d : 0xe5e5e5,
      );
      ringMaterials[i].emissive.set(
        i === hovered ? 0xfca311 : active ? 0x14213d : 0x000000,
      );
      ringMaterials[i].emissiveIntensity = 0.24;
    });
    schedule();
  }
  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    maxDpr = Math.min(devicePixelRatio || 1, innerWidth < 600 ? 1.25 : 1.75);
    dpr = Math.min(dpr, maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    schedule();
  }
  function scroll() {
    progress = THREE.MathUtils.clamp(
      -figure.closest(".hero")!.getBoundingClientRect().top / innerHeight,
      0,
      1,
    );
    schedule();
  }
  function draw(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 1 / 60;
    if (previous) {
      samples++;
      sampleTime += time - previous;
      if (samples >= 45) {
        const mean = sampleTime / samples;
        const next = THREE.MathUtils.clamp(
          dpr + (mean > 23 ? -0.25 : mean < 14 ? 0.125 : 0),
          0.75,
          maxDpr,
        );
        if (next !== dpr) {
          dpr = next;
          renderer.setPixelRatio(dpr);
          renderer.setSize(width, height, false);
        }
        samples = sampleTime = 0;
      }
    }
    previous = time;
    const damping = 1 - Math.exp(-7 * dt);
    const rx = targetY * 0.12 + progress * 0.1;
    const ry = targetX * 0.25 + progress * 0.25;
    model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, rx, damping);
    model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, ry, damping);
    let moving =
      Math.abs(model.rotation.x - rx) + Math.abs(model.rotation.y - ry);
    planes.forEach((plane, i) => {
      const target =
        (i - 1) * progress * 0.5 +
        (names[i] === figure.dataset.selected ? 0.08 : 0);
      plane.position.y = THREE.MathUtils.lerp(
        plane.position.y,
        target,
        damping,
      );
      moving += Math.abs(plane.position.y - target);
    });
    core.rotation.y = 0.4 + model.rotation.y * 2;
    accentLight.position.x = -3 + targetX * 2;
    camera.position.z = 8.8 + progress * 1.2;
    camera.lookAt(0, 0.1, 0);
    renderer.render(scene, camera);
    figure.dataset.webgl = "ready";
    if (moving > 0.0005) frame = requestAnimationFrame(draw);
    else previous = 0;
  }
  function schedule() {
    if (!frame && visible && !disposed && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function move(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const rect = stage.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - 0.5;
    targetY = (event.clientY - rect.top) / rect.height - 0.5;
    pointer.set(targetX * 2, -targetY * 2);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(planes, true)[0];
    let object: THREE.Object3D | null = hit?.object || null;
    while (object && object.userData.layer === undefined)
      object = object.parent;
    const next = object?.userData.layer ?? -1;
    if (next !== hovered) {
      hovered = next;
      colors();
    }
    schedule();
  }
  function leave() {
    targetX = targetY = 0;
    hovered = -1;
    colors();
  }
  function visibility() {
    cancelAnimationFrame(frame);
    frame = previous = 0;
    schedule();
  }
  const abort = new AbortController();
  stage.addEventListener("pointermove", move, {
    passive: true,
    signal: abort.signal,
  });
  stage.addEventListener("pointerleave", leave, { signal: abort.signal });
  window.addEventListener("scroll", scroll, {
    passive: true,
    signal: abort.signal,
  });
  document.addEventListener("visibilitychange", visibility, {
    signal: abort.signal,
  });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visibility();
  });
  intersection.observe(stage);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(stage);
  const selectionObserver = new MutationObserver(colors);
  selectionObserver.observe(figure, {
    attributes: true,
    attributeFilter: ["data-selected"],
  });
  selectionObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    abort.abort();
    cancelAnimationFrame(frame);
    intersection.disconnect();
    sizeObserver.disconnect();
    selectionObserver.disconnect();
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    canvas.remove();
    delete figure.dataset.webgl;
  }
  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      // A lost GPU context immediately returns to the fully interactive SVG.
      dispose();
    },
    { signal: abort.signal },
  );
  colors();
  resize();
  scroll();
  return dispose;
}
