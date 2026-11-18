import * as THREE from '../../assets/vendor/three.module.min.js';

// Mapas de color, relieve y rugosidad generados juntos, con la misma huella de desgaste.
const fract = n => n - Math.floor(n);
const clamp = n => Math.max(0, Math.min(1, n));
const mix = (a, b, weight) => a + (b - a) * weight;
const smooth = n => n * n * (3 - 2 * n);

export function randomSequence(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function noiseGrid(width, height, seed) {
  const random = randomSequence(seed);
  const grid = Float32Array.from({ length: width * height }, random);
  return (u, v) => {
    const x = fract(u) * width, y = fract(v) * height;
    const left = Math.floor(x), top = Math.floor(y);
    const right = (left + 1) % width, bottom = (top + 1) % height;
    const a = mix(grid[top * width + left], grid[top * width + right], smooth(x - left));
    const b = mix(grid[bottom * width + left], grid[bottom * width + right], smooth(x - left));
    return mix(a, b, smooth(y - top));
  };
}

export function canvasTexture(size, paint, colorSpace = THREE.SRGBColorSpace) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  paint(canvas.getContext('2d'), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  return texture;
}

function surfaceMaps(renderer, surface, size) {
  const canvases = Array.from({ length: 3 }, () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    return canvas;
  });
  const contexts = canvases.map(canvas => canvas.getContext('2d'));
  const images = contexts.map(ctx => ctx.createImageData(size, size));
  const channels = images.map(image => image.data);
  const palette = surface.colors.map(color => [
    (color >> 16) & 255, (color >> 8) & 255, color & 255
  ]);
  const sample = [0, 0, 0];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      surface.sample(x / size, y / size, sample);
      const [tone, height, roughness] = sample;
      const ramp = clamp(tone) * 2;
      const lower = ramp < 1 ? 0 : 1;
      const offset = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        channels[0][offset + c] = mix(palette[lower][c], palette[lower + 1][c], ramp - lower);
        channels[1][offset + c] = clamp(height) * 255;
        channels[2][offset + c] = clamp(roughness) * 255;
      }
      for (const data of channels) data[offset + 3] = 255;
    }
  }
  const textures = canvases.map((canvas, i) => {
    contexts[i].putImageData(images[i], 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = i === 0 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return texture;
  });
  return { map: textures[0], bumpMap: textures[1], roughnessMap: textures[2] };
}

export function makeMaterials(renderer) {
  const broad = noiseGrid(8, 8, 5);
  const mottling = noiseGrid(29, 27, 19);
  const pores = noiseGrid(151, 149, 41);
  const coarseGrain = noiseGrid(58, 6, 73);
  const fineGrain = noiseGrid(192, 22, 87);
  const abrasion = noiseGrid(8, 168, 143);
  const textures = [];

  const wood = (u, v, out) => {
    const warped = u + (broad(u, v) - .5) * .035 + Math.sin(v * Math.PI * 4) * .006;
    const grain = coarseGrain(warped, v);
    const fiber = fineGrain(warped, v);
    const plank = Math.floor(u * 12) / 12;
    const edge = Math.min(fract(u * 12), 1 - fract(u * 12));
    const joint = Math.max(0, 1 - edge / .045);
    out[0] = .14 + grain * .38 + fiber * .21 + broad(plank, .54) * .31 - joint * .55;
    out[1] = .28 + grain * .34 + fiber * .23 - joint * .31;
    out[2] = .48 + (1 - fiber) * .32 + joint * .14;
  };
  const leather = (u, v, out) => {
    const patch = broad(u, v), grain = mottling(u, v), pore = pores(u, v);
    const crease = Math.pow(Math.abs(Math.sin((v * 13 + broad(u, v) * 2.1) * Math.PI)), 11);
    out[0] = .18 + patch * .42 + grain * .20 + pore * .16 - crease * .12;
    out[1] = .3 + grain * .22 + pore * .40 - crease * .19;
    out[2] = .62 + grain * .12 + (1 - pore) * .16;
  };
  const metal = (u, v, out) => {
    const patch = broad(u, v), flecks = mottling(u, v), scratch = abrasion(u, v);
    out[0] = .18 + patch * .44 + flecks * .25 + scratch * .20;
    out[1] = .31 + scratch * .22 + pores(u, v) * .20;
    out[2] = .21 + (1 - patch) * .29 + flecks * .20;
  };
  const parchment = (u, v, out) => {
    const stain = broad(u, v) * .54 + mottling(u, v) * .26 + fineGrain(v, u) * .20;
    const edges = Math.min(u, v, 1 - u, 1 - v);
    out[0] = .43 + stain * .54 - Math.max(0, .18 - edges) * 2.8;
    out[1] = .36 + stain * .24 + pores(u, v) * .27;
    out[2] = .78 + stain * .20;
  };
  const stone = (u, v, out) => {
    const cloud = broad(u, v);
    const vein = Math.pow(Math.abs(Math.sin((u * 3 + v * 1.5 + cloud * 1.3) * Math.PI)), 18);
    out[0] = .16 + cloud * .46 + mottling(u, v) * .17 + vein * .18;
    out[1] = .48 + pores(u, v) * .11 + vein * .05;
    out[2] = .22 + cloud * .22;
  };
  const wax = (u, v, out) => {
    const stain = broad(u, v), layer = fineGrain(v, u);
    out[0] = .42 + stain * .33 + layer * .20;
    out[1] = .40 + layer * .24 + stain * .14;
    out[2] = .36 + stain * .27;
  };
  const feather = (u, v, out) => {
    const barbs = .5 + Math.sin((v * 167 + Math.abs(u - .5) * 17) * Math.PI * 2) * .5;
    out[0] = .13 + broad(u, v) * .23 + barbs * .38 + v * .18;
    out[1] = .33 + barbs * .37;
    out[2] = .65 + barbs * .11;
  };

  function material(colors, sample, { bumpScale, metalness = 0, size = 256, ...options }) {
    const maps = surfaceMaps(renderer, { colors, sample }, size);
    textures.push(...Object.values(maps));
    return new THREE.MeshStandardMaterial({ ...maps, bumpScale, metalness, ...options });
  }

  const materials = {
    oak: material([0x2d180d, 0x7b4b2a, 0xb98a57], wood, { bumpScale: .025, size: 512 }),
    leather: material([0x241912, 0x5e402e, 0x936846], leather, { bumpScale: .025, side: THREE.DoubleSide }),
    brass: material([0x30291d, 0x8d6b37, 0xcfaa68], metal, { bumpScale: .01, metalness: .78 }),
    iron: material([0x1c211e, 0x515550, 0x9b9d92], metal, { bumpScale: .014, metalness: .74 }),
    paper: material([0x8c623d, 0xc1a06e, 0xe6d3a5], parchment, { bumpScale: .015, side: THREE.DoubleSide }),
    seal: material([0x44121d, 0x8a2634, 0xc0534e], wax, { bumpScale: .008 }),
    wax: material([0x92704a, 0xcbac7b, 0xe7d6a9], wax, { bumpScale: .012 }),
    bone: material([0x5b432c, 0xb79766, 0xe3cbaa], stone, { bumpScale: .004 }),
    slate: material([0x171c2b, 0x4b5b73, 0x929caf], stone, { bumpScale: .004 }),
    jade: material([0x132c26, 0x326353, 0x78a08b], stone, { bumpScale: .004 }),
    feather: material([0x534034, 0xa68d6c, 0xe4d6bd], feather, { bumpScale: .009, side: THREE.DoubleSide })
  };

  return { ...materials, textures };
}
