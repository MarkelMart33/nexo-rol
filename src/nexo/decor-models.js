import * as THREE from '../../assets/vendor/three.module.min.js';
import { canvasTexture, makeMaterials, randomSequence } from './decor-materials.js?v=1';

const TAU = Math.PI * 2;
const up = new THREE.Vector3(0, 1, 0);
const standard = (color, roughness = .72, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, y, z);
  object.castShadow = object.receiveShadow = true;
  parent.add(object);
  return object;
}

function lathe(parent, points, material, x = 0, y = 0, z = 0) {
  const profile = points.map(([radius, height]) => new THREE.Vector2(radius, height));
  return mesh(parent, new THREE.LatheGeometry(profile, 72), material, x, y, z);
}

function cylinder(parent, radius, height, material, x, y, z) {
  return mesh(parent, new THREE.CylinderGeometry(radius, radius, height, 48), material, x, y, z);
}

function ball(parent, radius, material, x, y, z) {
  return mesh(parent, new THREE.SphereGeometry(radius, 32, 20), material, x, y, z);
}

function curve(parent, points, radius, material, closed = false, segments = 36) {
  const spline = new THREE.CatmullRomCurve3(points, closed);
  return mesh(parent, new THREE.TubeGeometry(spline, segments, radius, 8, closed), material);
}

function surface(parent, columns, rows, point, material) {
  const geometry = new THREE.PlaneGeometry(1, 1, columns, rows);
  const { position, uv } = geometry.attributes;
  for (let i = 0; i < position.count; i++) {
    const vertex = point(uv.getX(i), uv.getY(i));
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.computeVertexNormals();
  return mesh(parent, geometry, material);
}

function buildMug(group, m) {
  // Sección continua: base, pared abombada, labio y hueco interior.
  lathe(group, [[0, .05], [.55, .05], [.65, .09], [.68, .15], [.72, .43],
    [.74, .75], [.72, 1.02], [.70, 1.14], [.68, 1.16], [.63, 1.15],
    [.61, 1.11], [.63, .79], [.60, .34], [.55, .16], [0, .16]], m.oak);

  for (const [y, radius, width] of [[.20, .681, .105], [.88, .733, .104], [1.10, .705, .045]]) {
    lathe(group, [[radius - .012, y - width / 2], [radius + .019, y - width / 2 + .016],
      [radius + .023, y + width / 2 - .013], [radius - .012, y + width / 2]], m.iron);
    if (width < .06) continue;
    for (let i = 0; i < 10; i++) {
      const angle = i * TAU / 10;
      const rivet = ball(group, .034, m.iron,
        Math.cos(angle) * (radius + .018), y, Math.sin(angle) * (radius + .018));
      rivet.scale.set(1, .8, 1);
    }
  }

  curve(group, [
    new THREE.Vector3(.65, .85, .13), new THREE.Vector3(.88, .87, .18),
    new THREE.Vector3(1.11, .74, .26), new THREE.Vector3(1.18, .53, .31),
    new THREE.Vector3(1.04, .33, .31), new THREE.Vector3(.69, .27, .17)
  ], .072, m.iron);

  const drink = new THREE.Group();
  group.add(drink);
  const liquid = new THREE.MeshPhysicalMaterial({
    color: 0xaf631b, roughness: .20, metalness: .08, clearcoat: 1, clearcoatRoughness: .17
  });
  cylinder(drink, .627, .026, liquid, 0, .989, 0);
  const foamMaterial = standard(0xe4cea4, .89);
  const border = angle => .51 + .045 * Math.sin(angle * 3 + .8) + .027 * Math.sin(angle * 7);
  const foam = surface(drink, 72, 7, (u, v) => {
    const angle = u * TAU;
    const radius = v * border(angle);
    return new THREE.Vector3(Math.cos(angle) * radius - .053, 1.008 + (1 - v) * .017,
      Math.sin(angle) * radius);
  }, foamMaterial);
  // Las caras del disco polar miran hacia la luz.
  foam.material.side = THREE.DoubleSide;
  const random = randomSequence(38);
  const bubbleGeometry = new THREE.SphereGeometry(1, 10, 7);
  const bubbles = new THREE.InstancedMesh(bubbleGeometry, foamMaterial, 190);
  const pose = new THREE.Object3D();
  for (let i = 0; i < bubbles.count; i++) {
    const angle = random() * TAU, radius = Math.sqrt(random()) * border(angle) * .97;
    const size = .007 + Math.pow(random(), 3) * .032;
    pose.position.set(Math.cos(angle) * radius - .053, 1.014 + random() * .014,
      Math.sin(angle) * radius);
    pose.scale.set(size, size * .49, size);
    pose.updateMatrix();
    bubbles.setMatrixAt(i, pose.matrix);
    bubbles.setColorAt(i, new THREE.Color(0xffffff).multiplyScalar(.73 + random() * .35));
  }
  bubbles.receiveShadow = true;
  drink.add(bubbles);
  return { drink };
}

function buildCandle(group, m) {
  lathe(group, [[0, .045], [.72, .045], [.82, .064], [.89, .11], [.895, .15],
    [.856, .18], [.82, .16], [.70, .094], [0, .094]], m.brass);
  const handle = curve(group, [
    new THREE.Vector3(.80, .14, .08), new THREE.Vector3(.99, .18, -.10),
    new THREE.Vector3(1.21, .19, -.03), new THREE.Vector3(1.27, .18, .15),
    new THREE.Vector3(1.10, .15, .27), new THREE.Vector3(.84, .14, .22)
  ], .041, m.brass);
  handle.receiveShadow = false;
  lathe(group, [[0, .10], [.41, .10], [.46, .12], [.44, .16], [.37, .19]], m.wax);

  const candle = lathe(group, [[0, .13], [.34, .13], [.37, .20], [.35, .61],
    [.34, .83], [.33, .87], [.30, .88], [.25, .81], [.17, .78], [0, .783]], m.wax);
  const { position } = candle.geometry.attributes;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), z = position.getZ(i), y = position.getY(i);
    const angle = Math.atan2(z, x);
    const wave = (Math.sin(angle * 5) + .5 * Math.sin(angle * 9)) * .012;
    position.setY(i, y + wave * Math.min(1, Math.max(0, (y - .60) * 4)));
  }
  candle.geometry.computeVertexNormals();
  for (const [angle, end] of [[.4, .52], [1.2, .38], [2.9, .68], [5.4, .42]]) {
    const x = Math.cos(angle) * .338, z = Math.sin(angle) * .338;
    curve(group, [new THREE.Vector3(x * .93, .855, z * .93),
      new THREE.Vector3(x * 1.04, .74, z * 1.04),
      new THREE.Vector3(x * 1.07, end, z * 1.07)], .027, m.wax);
  }
  curve(group, [new THREE.Vector3(0, .78, 0), new THREE.Vector3(.018, .854, 0),
    new THREE.Vector3(.009, .918, .008)], .016, standard(0x261d17));

  const flame = new THREE.Group();
  group.add(flame);
  const outside = new THREE.MeshBasicMaterial({ color: 0xe98830, transparent: true, opacity: .85 });
  const inside = new THREE.MeshBasicMaterial({ color: 0xffe6a4 });
  const outer = lathe(flame, [[0, 0], [.049, .025], [.068, .105], [.05, .19],
    [.021, .25], [0, .34]], outside, .004, .88, 0);
  outer.rotation.z = -.15;
  const inner = ball(flame, .05, inside, .009, .986, 0);
  inner.scale.set(.70, 2.03, .70);
  for (const object of [outer, inner]) {
    object.castShadow = object.receiveShadow = false;
  }
  const glow = new THREE.PointLight(0xffbb65, 3.3, 3);
  glow.position.set(.01, 1.15, .02);
  flame.add(glow);
  return { flame };
}

function buildPouch(group, m, textures) {
  const opening = new THREE.Vector3(.19, .47, .12);
  const outward = new THREE.Vector3(.45, .73, .51).normalize();
  const width = new THREE.Vector3().crossVectors(up, outward).normalize();
  const fall = new THREE.Vector3().crossVectors(width, outward);
  const rim = standard(0x98704b, .79);
  const lining = standard(0x21160f, .93);
  lining.side = THREE.DoubleSide;

  function hidePoint(angle, depth) {
    const center = opening.clone().lerp(new THREE.Vector3(-1.18, .20, -.30), depth);
    const volume = (1 + .57 * Math.sin(Math.PI * depth)) * (1 - Math.pow(depth, 3.4));
    const pleats = 1 + (.026 + .065 * (1 - depth)) * Math.cos(angle * 12 + depth * 4) +
      .054 * Math.sin(angle * 5 - depth * 3);
    const point = center.addScaledVector(width, Math.cos(angle) * volume * pleats * .48)
      .addScaledVector(fall, Math.sin(angle) * volume * pleats * .31);
    point.y = Math.max(.067, point.y + Math.sin(depth * Math.PI) * .016);
    return point;
  }

  surface(group, 84, 30, (u, v) => hidePoint(u * TAU, v * .999), m.leather);
  surface(group, 72, 12, (u, v) => {
    const point = hidePoint(u * TAU, 0);
    return opening.clone().lerp(point, .94 * (1 - v * v))
      .addScaledVector(outward, -.024 - v * .36);
  }, lining);
  const lip = Array.from({ length: 52 }, (_, i) => hidePoint(i * TAU / 52, 0));
  curve(group, lip, .029, rim, true, 100);
  const thread = standard(0xc1a074);
  for (let i = 0; i < 19; i++) {
    const start = i * TAU / 19;
    const a = hidePoint(start, .125).addScaledVector(outward, .010);
    const b = hidePoint(start + .13, .135).addScaledVector(outward, .010);
    curve(group, [a.clone().lerp(b, -.02), a.clone().lerp(b, .5), b], .010, thread, false, 3);
  }
  curve(group, [
    hidePoint(2.15, .09), new THREE.Vector3(-.37, .24, .48),
    new THREE.Vector3(-.68, .08, .71), new THREE.Vector3(-.64, .059, 1.03),
    new THREE.Vector3(-.27, .05, 1.06), new THREE.Vector3(-.21, .065, .77)
  ], .022, thread);
  curve(group, [
    hidePoint(5.6, .075), new THREE.Vector3(.44, .41, -.22),
    new THREE.Vector3(.76, .10, -.24), new THREE.Vector3(.96, .041, .09),
    new THREE.Vector3(.70, .045, .21)
  ], .022, thread);

  const haloMap = canvasTexture(64, (ctx, size) => {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, '#fff9');
    gradient.addColorStop(.30, '#fff4');
    gradient.addColorStop(1, '#fff0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  });
  textures.push(haloMap);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xbce6ea, roughness: .08, transparent: true, opacity: .11,
    clearcoat: 1, clearcoatRoughness: .09, depthWrite: false
  });
  // El borde del vidrio refleja más luz que el centro y deja ver la gema.
  glass.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      float rim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.2);
      float highlight = clamp(length(reflectedLight.directSpecular + reflectedLight.indirectSpecular), 0.0, 1.0);
      outgoingLight += vec3(0.10, 0.19, 0.22) * rim;
      diffuseColor.a = clamp(diffuseColor.a + rim * 0.35 + highlight * 0.32, 0.0, 0.69);
      #include <opaque_fragment>
    `);
  };
  const jewelColors = [0x8ccfff, 0xedba66, 0x87c49e, 0xb49deb, 0x80d6e0, 0xf1cd88, 0x9bbcec];
  const inside = [[-.22, -.11], [.035, -.16], [.245, -.04]].map(([u, v]) =>
    opening.clone().addScaledVector(width, u).addScaledVector(fall, v).addScaledVector(outward, -.04));
  const outside = [[.56, .19, .48], [.91, .19, .69], [.46, .19, .91], [1.02, .19, 1.12]]
    .map(([x, y, z]) => new THREE.Vector3(x, y, z));

  const orbs = [...inside, ...outside].map((position, i) => {
    const orb = new THREE.Group();
    const color = jewelColors[i];
    orb.position.copy(position);
    group.add(orb);

    const stone = new THREE.MeshPhysicalMaterial({
      color, emissive: color, emissiveIntensity: .04, roughness: .16, metalness: .25, clearcoat: 1
    });
    const jewel = mesh(orb, new THREE.OctahedronGeometry(.108), stone);
    jewel.rotation.set(.25 + i * .37, i * .56, .31);
    jewel.scale.set(1, .88, 1.13);
    jewel.receiveShadow = false;
    const shell = ball(orb, .183, glass, 0, 0, 0);
    shell.castShadow = shell.receiveShadow = false;
    const glint = ball(orb, .023, new THREE.MeshBasicMaterial({ color: 0xffffed }), -.083, .142, .067);
    glint.scale.set(1.2, .8, .78);
    glint.castShadow = glint.receiveShadow = false;

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloMap, color, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .62
    }));
    halo.scale.set(.78, .78, 1);
    halo.position.y = .03;
    orb.add(halo);
    return { orb, jewel, halo, position, spilled: i >= inside.length };
  });

  return { orbs, opening };
}

function bevelledDie(sides) {
  const Geometry = {
    4: THREE.TetrahedronGeometry, 8: THREE.OctahedronGeometry, 20: THREE.IcosahedronGeometry
  }[sides];
  const base = new Geometry(sides === 20 ? .61 : .54);
  const { position } = base.attributes;
  const corners = new Map(), edges = new Map();
  const points = [], uvs = [], faces = [];
  const key = v => v.toArray().map(n => Math.round(n * 10000)).join(',');

  function triangle(a, b, c) {
    const normal = b.clone().sub(a).cross(c.clone().sub(a));
    if (normal.dot(a) < 0) {
      [b, c] = [c, b];
      normal.negate();
    }
    points.push(...a.toArray(), ...b.toArray(), ...c.toArray());
    uvs.push(.04, .07, .96, .07, .50, .98);
    return normal.normalize();
  }

  for (let i = 0; i < position.count; i += 3) {
    const original = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(position, i + j));
    const center = original.reduce((sum, p) => sum.add(p), new THREE.Vector3()).divideScalar(3);
    const inset = original.map(p => p.clone().lerp(center, .075));
    const normal = triangle(...inset);
    faces.push({ center, normal });
    for (let j = 0; j < 3; j++) {
      const a = key(original[j]), b = key(original[(j + 1) % 3]);
      if (!corners.has(a)) corners.set(a, { normal: original[j].clone().normalize(), points: [] });
      corners.get(a).points.push(inset[j]);
      const id = [a, b].sort().join('|');
      if (!edges.has(id)) edges.set(id, []);
      edges.get(id).push(a < b ? [inset[j], inset[(j + 1) % 3]] : [inset[(j + 1) % 3], inset[j]]);
    }
  }
  for (const [[a, b], [c, d]] of edges.values()) {
    triangle(a, b, d);
    triangle(a, d, c);
  }
  for (const { normal, points: rim } of corners.values()) {
    const center = rim.reduce((sum, p) => sum.add(p), new THREE.Vector3()).divideScalar(rim.length);
    const xAxis = rim[0].clone().sub(center).normalize();
    const yAxis = new THREE.Vector3().crossVectors(normal, xAxis);
    const angle = p => Math.atan2(p.clone().sub(center).dot(yAxis), p.clone().sub(center).dot(xAxis));
    rim.sort((a, b) => angle(a) - angle(b));
    rim.forEach((point, i) => triangle(center, point, rim[(i + 1) % rim.length]));
  }
  base.dispose();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return { geometry, faces };
}

function buildDice(group, m, textures) {
  const down = up.clone().negate();
  const view = new THREE.Vector3(0, .86, .48).normalize();
  const specs = [
    [4, m.bone, -.55, .22, -.24],
    [8, m.slate, .16, -.36, .30],
    [20, m.jade, .49, .50, -.31]
  ];
  const dice = specs.map(([sides, material, x, z, turn]) => {
    const die = new THREE.Group();
    const { geometry, faces } = bevelledDie(sides);
    const base = faces[0].normal;
    const rest = new THREE.Quaternion().setFromUnitVectors(base, down)
      .premultiply(new THREE.Quaternion().setFromAxisAngle(up, turn));
    const score = face => face.normal.clone().applyQuaternion(rest).dot(view);
    const face = faces.reduce((best, current) => score(current) > score(best) ? current : best);
    mesh(die, geometry, material);

    const ink = canvasTexture(128, () => {});
    textures.push(ink);
    const decal = mesh(die, new THREE.PlaneGeometry(sides === 20 ? .26 : .31, .25),
      new THREE.MeshBasicMaterial({ map: ink, transparent: true, alphaTest: .05, depthWrite: false, toneMapped: false }));
    decal.castShadow = decal.receiveShadow = false;
    const vertical = new THREE.Vector3(0, 0, -1).applyQuaternion(rest.clone().invert());
    vertical.addScaledVector(face.normal, -vertical.dot(face.normal)).normalize();
    const horizontal = new THREE.Vector3().crossVectors(vertical, face.normal);
    decal.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(horizontal, vertical, face.normal));
    decal.position.copy(face.center).addScaledVector(face.normal, .0025);

    die.quaternion.copy(rest);
    const restPosition = new THREE.Vector3(x, .015 - new THREE.Box3().setFromObject(die).min.y, z);
    die.position.copy(restPosition);
    group.add(die);
    return { die, rest, restPosition, ink, sides, value: null };
  });
  return { dice };
}

function buildScroll(group, m, textures) {
  const ink = canvasTexture(512, (ctx, size) => {
    ctx.drawImage(m.paper.map.image, 0, 0, size, size);
    const random = randomSequence(345);
    ctx.strokeStyle = '#594026a6';
    ctx.lineWidth = 2;
    for (let row = 0; row < 8; row++) {
      let x = 79 + random() * 12;
      const baseline = 93 + row * 35;
      const end = 426 - random() * 80;
      while (x < end) {
        const width = 4 + random() * 10;
        ctx.beginPath();
        ctx.moveTo(x, baseline);
        ctx.quadraticCurveTo(x + width * .25, baseline - (3 + random() * 12), x + width * .54, baseline);
        ctx.quadraticCurveTo(x + width * .76, baseline - random() * 8, x + width, baseline + 1);
        ctx.stroke();
        x += width + (random() > .81 ? 11 : 3);
      }
    }
  });
  textures.push(ink);
  const paperWithInk = m.paper.clone();
  paperWithInk.map = ink;
  surface(group, 42, 30, (u, v) => {
    const x = (u - .5) * (1.88 - .08 * v) + .013 * Math.sin(v * 19);
    const z = -.53 + 1.58 * v + .011 * Math.sin(u * 49) * v;
    const y = .063 + .019 * Math.sin(u * 11 + v * 3) + .080 * Math.pow(v, 8);
    return new THREE.Vector3(x, y, z);
  }, paperWithInk);
  surface(group, 44, 70, (u, v) => {
    const angle = v * TAU * 1.39;
    const radius = .146 - v * .095;
    return new THREE.Vector3((u - .5) * (1.91 - .105 * v) + .011 * Math.sin(angle * 3),
      .203 - Math.cos(angle) * radius, -.54 - Math.sin(angle) * radius);
  }, m.paper);

  const seal = lathe(group, [[0, .020], [.152, .020], [.183, .036], [.189, .060],
    [.178, .082], [.145, .09], [.125, .082], [0, .079]], m.seal, .38, .082, .65);
  const { position } = seal.geometry.attributes;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), z = position.getZ(i), angle = Math.atan2(z, x);
    const ripple = 1 + .032 * Math.sin(angle * 3) + .024 * Math.cos(angle * 7);
    position.setX(i, x * ripple);
    position.setZ(i, z * ripple);
  }
  seal.geometry.computeVertexNormals();
  const stamp = standard(0x551421, .64);
  curve(group, Array.from({ length: 24 }, (_, i) => new THREE.Vector3(
    .38 + .111 * Math.cos(i * TAU / 24), .166, .65 + .111 * Math.sin(i * TAU / 24)
  )), .006, stamp, true);
  curve(group, [
    new THREE.Vector3(.33, .164, .68), new THREE.Vector3(.38, .164, .59), new THREE.Vector3(.43, .164, .68)
  ], .005, stamp, true, 12);
  return {};
}

function buildQuill(group, m) {
  const inkGlass = new THREE.MeshPhysicalMaterial({
    color: 0x173536, metalness: .15, roughness: .14, clearcoat: 1, clearcoatRoughness: .08
  });
  const shape = new THREE.Shape();
  for (let j = 0; j < 8; j++) {
    const angle = TAU / 8 * (j + .5);
    const x = Math.cos(angle) * .36, y = Math.sin(angle) * .36;
    if (j === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const bottle = mesh(group, new THREE.ExtrudeGeometry(shape, {
    depth: .31, bevelEnabled: true, bevelThickness: .046, bevelSize: .047, bevelSegments: 3
  }), inkGlass, -.57, .095, .30);
  bottle.rotation.x = -Math.PI / 2;
  lathe(group, [[.14, .431], [.15, .50], [.19, .50], [.206, .54], [.20, .57],
    [.155, .577], [.135, .56], [.133, .49]], inkGlass, -.57, 0, .30);
  cylinder(group, .135, .010, standard(0x06181b, .17), -.57, .485, .30);

  const feather = new THREE.Group();
  group.add(feather);
  const spine = t => new THREE.Vector3(-.27 + .96 * t + .18 * t * t, .080 + .31 * t,
    .84 - 1.96 * t);
  surface(feather, 16, 95, (u, v) => {
    const t = .18 + v * .82;
    const edge = u * 2 - 1;
    const barbs = 1 - Math.pow(Math.sin(v * 113), 10) * .14;
    const breadth = Math.pow(Math.sin(v * Math.PI), .9) * .265 * barbs * (edge < 0 ? .77 : 1);
    const point = spine(t);
    point.x += edge * breadth;
    point.z += edge * breadth * .49 - Math.abs(edge) * .15 * Math.sin(v * Math.PI);
    point.y -= Math.abs(edge) * breadth * .29;
    return point;
  }, m.feather);
  const shaft = Array.from({ length: 12 }, (_, i) => spine(i / 11));
  curve(feather, shaft, .014, standard(0xc6ad85, .55), false, 34);
  const nib = mesh(feather, new THREE.ConeGeometry(.025, .13, 12), m.brass, -.31, .065, .91);
  nib.quaternion.setFromUnitVectors(up, new THREE.Vector3(-.4, -.1, .91).normalize());
  return { feather };
}

const props = {
  jarra: buildMug, vela: buildCandle, esferas: buildPouch,
  dados: buildDice, pergamino: buildScroll, pluma: buildQuill
};

function paintNumber(die, value) {
  if (die.value === value) return;
  const ctx = die.ink.image.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.font = 'bold 95px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#372820';
  ctx.lineWidth = 5;
  ctx.strokeText(value, 64, 69, 108);
  ctx.fillStyle = '#f1ddaf';
  ctx.fillText(value, 64, 69, 108);
  die.ink.needsUpdate = true;
  die.value = value;
}

function makeEnvironment(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#30363b';
  ctx.fillRect(0, 0, 512, 256);
  for (const [x, y, size, color] of [[136, 62, 114, '#fff0d3'], [394, 101, 71, '#b4cbd5']]) {
    const lamp = ctx.createRadialGradient(x, y, 0, x, y, size);
    lamp.addColorStop(0, color);
    lamp.addColorStop(.29, color);
    lamp.addColorStop(1, '#30363b00');
    ctx.fillStyle = lamp;
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(texture);
  pmrem.dispose();
  texture.dispose();
  return environment;
}

let stopPrevious = () => {};
export function mount(table) {
  stopPrevious();
  const context = document.createElement('canvas').getContext('webgl2', {
    alpha: true, antialias: true, preserveDrawingBuffer: true
  });
  if (!context) return;

  const pixels = 448;
  const renderer = new THREE.WebGLRenderer({ canvas: context.canvas, context });
  renderer.setSize(pixels, pixels, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.09;
  const environment = makeEnvironment(renderer);
  const scene = new THREE.Scene();
  scene.environment = environment.texture;
  const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, .1, 25);
  const ambient = new THREE.HemisphereLight(0xffe9ce, 0x3b3c44, 1.35);
  const key = new THREE.DirectionalLight(0xffe1b4, 2.55);
  key.position.set(-3, 7, -2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  Object.assign(key.shadow.camera, { left: -3.3, right: 3.3, top: 3.3, bottom: -3.3 });
  key.shadow.normalBias = .021;
  key.shadow.radius = 4;
  key.shadow.blurSamples = 8;
  const fill = new THREE.DirectionalLight(0xd4e4ed, .65);
  fill.position.set(4, 3, 2.5);
  scene.add(ambient, key, fill);
  const floor = mesh(scene, new THREE.PlaneGeometry(15, 15),
    new THREE.ShadowMaterial({ opacity: .29 }));
  floor.castShadow = false;
  floor.rotation.x = -Math.PI / 2;

  const library = makeMaterials(renderer);
  const items = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const { signal } = listeners;
  let frame = 0;
  let playing = null;
  let disposed = false;

  function draw(item, motion = 1) {
    if (disposed || !item.node.isConnected) return;
    const { node, group, parts, anchor, halfSpan } = item;
    const dark = table.classList.contains('is-dark');
    for (const object of items) object.group.visible = object === item;

    group.rotation.y = motion === 1 ? item.tilt : Math.sin(motion * Math.PI) * .14;
    if (parts.drink) parts.drink.visible = !node.classList.contains('is-empty');
    if (parts.flame) parts.flame.visible = !node.classList.contains('is-out');
    if (parts.feather) parts.feather.rotation.y = Math.sin(motion * TAU) * .27;
    if (parts.orbs) {
      const charged = node.classList.contains('is-infused');
      for (const { orb, jewel, halo, position, spilled } of parts.orbs) {
        jewel.material.emissiveIntensity = charged ? .95 : .04;
        halo.visible = charged;
        orb.position.copy(position);
        if (charged && spilled && motion < 1) {
          const rest = 1 - Math.pow(1 - motion, 3);
          orb.position.lerpVectors(parts.opening, position, rest);
          orb.position.y += Math.sin(motion * Math.PI) * .093;
          jewel.rotation.y += .05;
        }
      }
    }
    if (parts.dice) {
      const fall = 1 - motion;
      parts.dice.forEach((die, index) => {
        const value = node.querySelector('[data-sides="' + die.sides + '"] b').textContent;
        paintNumber(die, value);
        die.die.position.copy(die.restPosition);
        die.die.position.y += Math.abs(Math.sin(motion * Math.PI * 2)) * .43 * fall;
        die.die.quaternion.copy(die.rest).premultiply(new THREE.Quaternion()
          .setFromAxisAngle(up, TAU * fall * fall * (index % 2 ? -1 : 1)));
      });
    }

    key.intensity = dark ? .34 : 2.55;
    fill.intensity = dark ? .15 : .65;
    ambient.intensity = dark ? .24 : 1.35;
    scene.environment = dark ? null : environment.texture;
    camera.left = camera.bottom = -halfSpan;
    camera.right = camera.top = halfSpan;
    camera.position.copy(anchor).add(new THREE.Vector3(0, 7.8, 3.55));
    camera.lookAt(anchor);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    item.ctx.clearRect(0, 0, pixels, pixels);
    item.ctx.drawImage(renderer.domElement, 0, 0);
  }

  function animate(item) {
    cancelAnimationFrame(frame);
    if (playing && playing !== item) draw(playing);
    playing = item;
    const start = performance.now();
    const duration = item.node.dataset.egg === 'esferas' ? 900 : 630;
    function step(now) {
      const progress = reduced.matches ? 1 : Math.min(1, (now - start) / duration);
      draw(item, progress);
      if (progress < 1 && item.node.isConnected) frame = requestAnimationFrame(step);
      else playing = null;
    }
    frame = requestAnimationFrame(step);
  }

  for (const node of table.querySelectorAll('[data-egg]')) {
    const build = props[node.dataset.egg];
    if (!build) continue;
    const group = new THREE.Group();
    const parts = build(group, library, library.textures);
    const bounds = new THREE.Box3().setFromObject(group);
    const anchor = bounds.getCenter(new THREE.Vector3());
    anchor.y = .28;
    anchor.z += .09;
    const size = bounds.getSize(new THREE.Vector3());
    const halfSpan = Math.max(size.x * .67, size.z * .63 + size.y * .20, 1.36);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = pixels;
    canvas.className = 'decor-model';
    canvas.setAttribute('aria-hidden', 'true');
    const item = { node, group, parts, anchor, halfSpan, canvas, ctx: canvas.getContext('2d'), tilt: 0 };
    items.push(item);
    scene.add(group);
    node.append(canvas);
    draw(item);
    node.classList.add('has-decor-model');

    node.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reduced.matches || playing) return;
      const rect = node.getBoundingClientRect();
      item.tilt = ((event.clientX - rect.left) / rect.width - .5) * .22;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => draw(item));
    }, { signal });
    node.addEventListener('pointerleave', () => {
      item.tilt = 0;
      if (!playing) draw(item);
    }, { signal });
    node.addEventListener('click', () => {
      if (parts.flame) items.forEach(other => draw(other));
      else if (reduced.matches) draw(item);
      else animate(item);
    }, { signal });
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(frame);
    listeners.abort();
    const geometries = new Set(), materials = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of library.textures) texture.dispose();
    key.shadow.dispose();
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    for (const { node, canvas } of items) {
      node.classList.remove('has-decor-model');
      canvas.remove();
    }
  }

  renderer.domElement.addEventListener('webglcontextlost', dispose, { once: true, signal });
  stopPrevious = () => { if (!disposed) dispose(); };
}
