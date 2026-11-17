/* Modelos de la mesa. Una sola superficie WebGL compartida, copiada a lienzos accesibles. */
import * as T from '../../assets/vendor/three.module.min.js';
let stopPrevious = () => {};
export function mount(table) {
  stopPrevious();
  let renderer;
  try { renderer = new T.WebGLRenderer({alpha:true, antialias:true, preserveDrawingBuffer:true}); } catch { return; }
  renderer.setSize(640,640); renderer.setPixelRatio(1); renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.VSMShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(32,1,.1,30);
  camera.position.set(0,7.5,3.6);camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight(0xffedd2,0x343c42,1.4));
  const light=new T.DirectionalLight(0xffe6c0,2.6);light.position.set(-3,7,-4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-4;light.shadow.camera.right=4;light.shadow.camera.top=4;light.shadow.camera.bottom=-4;light.shadow.normalBias=.025;light.shadow.radius=4;light.shadow.blurSamples=8;scene.add(light);
  const fill=new T.DirectionalLight(0xc3dcea,.9);fill.position.set(4,3,2);scene.add(fill);
  const floor=new T.Mesh(new T.PlaneGeometry(15,15),new T.ShadowMaterial({opacity:.3}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.025;scene.add(floor);
  const resources=[], objects=[]; let seed=573;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function texture(kind) {const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#888';x.fillRect(0,0,256,256);
    for(let i=0;i<12000;i++){const v=Math.floor(70+random()*120);x.fillStyle=`rgba(${v},${v},${v},.35)`;const a=random()*256,b=random()*256;x.fillRect(a,b,kind==='wood'?1:2,kind==='wood'?15+random()*75:1+random()*2);}
    const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;resources.push(t);return t;}
  const grain=texture('wood'),leather=texture('leather');
  const mat=(color,roughness=.65,metalness=0,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
  const oak=mat('#715031',.76,0,{bumpMap:grain,bumpScale:.045}),hide=mat('#67432b',.82,0,{bumpMap:leather,bumpScale:.035}),brass=mat('#b59a60',.32,.8),iron=mat('#68716e',.32,.85),paper=mat('#e9d7ab',.9,0,{bumpMap:leather,bumpScale:.008});
  function mesh(g,geometry,material,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
  function box(g,w,h,d,m,x=0,y=0,z=0){
    const r=Math.min(.055,w/8,d/8,h/3),s=new T.Shape();s.moveTo(-w/2+r,-d/2);s.lineTo(w/2-r,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);s.lineTo(w/2,d/2-r);s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);s.lineTo(-w/2+r,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);s.lineTo(-w/2,-d/2+r);s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
    const geo=new T.ExtrudeGeometry(s,{depth:Math.max(.001,h-2*r),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});geo.rotateX(-Math.PI/2);geo.translate(0,-h/2+r,0);return mesh(g,geo,m,x,y,z);
  }
  function ball(g,r,m,x,y,z){return mesh(g,new T.SphereGeometry(r,32,20),m,x,y,z);}
  function ring(g,r,t,m,x=0,y=0,z=0){const a=mesh(g,new T.TorusGeometry(r,t,12,64),m,x,y,z);a.rotation.x=Math.PI/2;return a;}
  function cylinder(g,r,h,m,x=0,y=0,z=0,r2=r){return mesh(g,new T.CylinderGeometry(r,r2,h,64),m,x,y,z);}
  function tube(g,points,r,m){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,8,false),m);}
  function label(g,text,w,d,bg='#d9c8a2',ink='#3d3024',x=0,y=.2,z=0){const c=document.createElement('canvas');c.width=512;c.height=640;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,640);for(let i=0;i<16000;i++){ctx.fillStyle=random()>.5?'#ffffff0b':'#00000012';ctx.fillRect(random()*512,random()*640,1+random()*2,1+random()*4);}
    ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(22,22,468,596);ctx.strokeRect(32,32,448,576);ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='bold 57px Georgia';const lines=text.split('|');lines.forEach((s,i)=>ctx.fillText(s,256,300+i*73,430));ctx.beginPath();ctx.moveTo(256,105);ctx.lineTo(306,150);ctx.lineTo(286,207);ctx.lineTo(226,207);ctx.lineTo(206,150);ctx.closePath();ctx.moveTo(256,105);ctx.lineTo(226,207);ctx.lineTo(306,150);ctx.lineTo(206,150);ctx.lineTo(286,207);ctx.lineTo(256,105);ctx.stroke();ctx.font='19px Georgia';ctx.fillText('N E X O',256,550);if(text.includes('TRAVELLER')){ctx.fillStyle='#0c252a';ctx.fillRect(0,0,512,640);ctx.strokeStyle='#64a9a444';for(let j=0;j<640;j+=32){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(512,j);ctx.stroke();}ctx.fillStyle='#9dddd3';ctx.textAlign='left';ctx.font='bold 46px monospace';ctx.fillText('TRAVELLER',42,300);ctx.font='22px monospace';ctx.fillText('TERMINAL ESTELAR',42,345);ctx.fillText('SISTEMAS EN LÍNEA',42,460);ctx.fillText('> ABRIR ARCHIVO _',42,540);}
    if(text==='Vampiro|La Mascarada'){ctx.fillStyle='#160d15';ctx.fillRect(0,0,512,640);const glow=ctx.createRadialGradient(250,190,10,250,190,470);glow.addColorStop(0,'#542036');glow.addColorStop(1,'#120c13');ctx.fillStyle=glow;ctx.fillRect(0,0,512,640);ctx.fillStyle='#f0e4e8';ctx.font='86px sans-serif';ctx.fillText(new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),256,310);ctx.font='28px sans-serif';ctx.fillText('Vampiro: La Mascarada',256,420);ctx.font='22px sans-serif';ctx.fillText('Tus vástagos te esperan',256,465);ctx.fillStyle='#040306';ctx.beginPath();ctx.roundRect(185,25,142,27,14);ctx.fill();ctx.fillStyle='#d4cbd2';ctx.fillRect(188,598,136,6);}
    if(text.includes('Pathfinder')){ctx.strokeStyle='#75704c55';for(let j=0;j<7;j++){ctx.beginPath();for(let x=40;x<470;x+=3){const y=430+j*14+Math.sin(x*.018+j)*22;x===40?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}}
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;resources.push(t);
    const iconKey=text.includes('Dungeons')?'dnd':text.includes('Vampiro')?'vampire':text.includes('Tormentas')?'tormentas':text.includes('Cthulhu')?'cthulhu':text.includes('Pathfinder')?'pathfinder':text.includes('TRAVELLER')?'traveller':null;
    const icon=window.NEXO_ICONS?.[iconKey];
    if(icon){const img=new Image();img.onload=()=>{if(!table.isConnected)return;ctx.fillStyle=bg;ctx.fillRect(190,88,132,134);ctx.drawImage(img,202,102,108,108);t.needsUpdate=true;objects.forEach(o=>draw(o));};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(icon.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" ').replaceAll('currentColor',ink));}
const a=mesh(g,new T.PlaneGeometry(w,d),mat('#ffffff',.65,0,{map:t}),x,y,z);a.rotation.x=-Math.PI/2;a.castShadow=false;return a;}
  function model(kind,node){const g=new T.Group();
    if(kind==='jarra'){
      const pts=[[.62,0],[.75,.08],[.79,.9],[.76,1.17],[.67,1.18],[.65,.16]].map(p=>new T.Vector2(...p));mesh(g,new T.LatheGeometry(pts,64),oak);cylinder(g,.65,.08,oak,0,.08);[.12,.94,1.16].forEach(y=>ring(g,.76,.045,iron,0,y));
      for(let i=0;i<12;i++){const a=i*Math.PI/6;for(const y of [.12,.94])ball(g,.035,iron,Math.sin(a)*.795,y,Math.cos(a)*.795);tube(g,[[Math.sin(a)*.76,.2,Math.cos(a)*.76],[Math.sin(a)*.79,.6,Math.cos(a)*.79],[Math.sin(a)*.76,1.1,Math.cos(a)*.76]],.009,mat('#302015'));}
      const handle=mesh(g,new T.TorusGeometry(.44,.095,16,48),iron,1,.62,0);handle.rotation.y=0;
      const beer=cylinder(g,.65,.025,mat('#c27a0d',.18,.1),0,1.02);beer.name='beer';const foam=new T.Group();foam.name='foam';g.add(foam);cylinder(foam,.53,.025,mat('#eee1ba',.95),-.06,1.045);for(let i=0;i<150;i++){let a=random()*Math.PI*2,r=Math.sqrt(random())*.59;ball(foam,.012+random()*.025,mat('#f5e7bd',.9),Math.cos(a)*r,1.055+random()*.025,Math.sin(a)*r);}g.scale.setScalar(1.25);
    } else if(kind==='vela'){
      cylinder(g,.87,.08,brass,0,.06);ring(g,.83,.055,brass,0,.12);cylinder(g,.38,.85,mat('#e5d2a5',.68),0,.51);ring(g,.32,.06,mat('#ecdcb6'),0,.94);cylinder(g,.23,.012,mat('#bba77b',.35),0,.945);cylinder(g,.018,.16,mat('#211b14'),0,1.02);
      for(let i=0;i<7;i++){const a=i*.92;ball(g,.055,mat('#e9d8af'),Math.cos(a)*.36,.66+random()*.2,Math.sin(a)*.36).scale.y=2.8;}
      const flame=ball(g,.12,new T.MeshBasicMaterial({color:0xffcf6b}),0,1.22,0);flame.scale.set(.6,2.1,.6);flame.name='flame';const glow=new T.PointLight(0xffb84c,2,4);glow.position.y=1.4;glow.name='glow';g.add(glow);ring(g,.23,.045,brass,1,.14);
    } else if(kind==='esferas'){
      const geo=new T.SphereGeometry(1,64,32,0,Math.PI*2,.7,Math.PI-.7);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),a=Math.atan2(z,x);const ripple=1+.075*Math.sin(a*13)*Math.max(0,y);pos.setXYZ(i,x*ripple*.85,(y+1)*.46,z*ripple*.7);}geo.computeVertexNormals();mesh(g,geo,hide);cylinder(g,.56,.03,mat('#1a1714'),0,.68,0,.55);ring(g,.63,.065,hide,0,.8);
      tube(g,[[-.6,.78,0],[-1,.3,.4],[-1.15,.08,.8],[-.7,.04,1],[-.55,.07,.5]],.026,mat('#b69865'));tube(g,[[.6,.78,0],[.95,.35,.4],[1.18,.05,.7],[.8,.04,1]],.026,mat('#b69865'));
      const colors=['#86cfff','#e9ba58','#a0e2ad','#bc9de4','#85ddec','#e8c579','#a4e0ff'];
      colors.forEach((color,i)=>{const x=i<5?Math.cos(i*2.4)*.36:(i===5?.9:.4),z=i<5?Math.sin(i*2.4)*.3:.95,y=i<5?.83:.19;
        const glass=ball(g,.19,new T.MeshPhysicalMaterial({color:'#c4e0e8',transparent:true,opacity:.26,roughness:.08,metalness:.15,clearcoat:1,depthWrite:false}),x,y,z);glass.renderOrder=2;
        const gem=mesh(g,new T.OctahedronGeometry(.105),mat(color,.18,.25,{emissive:color,emissiveIntensity:.1}),x,y,z);gem.name='gem';
        ball(g,.028,new T.MeshBasicMaterial({color:'#f3ffff'}),x-.07,y+.15,z-.045);
      });g.scale.setScalar(1.25);
    } else if(kind==='dados'){
      [[4,-.85,.3,0,'#b9a280'],[8,.05,.4,-.4,'#8991ad'],[20,.85,.48,.3,'#426e64']].forEach(([n,x,y,z,c])=>{
        const geo=n===4?new T.TetrahedronGeometry(.6):n===8?new T.OctahedronGeometry(.58):new T.IcosahedronGeometry(.64);const die=mesh(g,geo,mat(c,.28,.3,{flatShading:true}),x,y,z);die.rotation.set(.25,.4,.2);const edges=new T.LineSegments(new T.EdgesGeometry(geo),new T.LineBasicMaterial({color:'#c6b88e',transparent:true,opacity:.55}));die.add(edges);const face=label(g,String(n),.30,.34,c,'#f3e3b8',x,y+.68,z);face.userData.sides=n;});
    } else if(kind==='pergamino'){
      box(g,1.9,.025,1.1,paper,0,.13);for(const x of [-.93,.93]){const roll=cylinder(g,.14,1.18,paper,x,.22);roll.rotation.x=Math.PI/2;ring(g,.10,.018,mat('#9a8055'),x,.22,-.61).rotation.x=0;}const seal=cylinder(g,.19,.065,mat('#79212e',.4),.2,.2);box(g,.13,.035,1.1,mat('#69232a'),.2,.16);
    } else if(kind==='pluma'){
      const bottle=box(g,.65,.5,.65,mat('#142f32',.14,.4),-.5,.28,.25);bottle.rotation.y=.15;ring(g,.2,.055,iron,-.5,.57,.25);cylinder(g,.145,.02,mat('#030b0c',.1),-.5,.56,.25);
      tube(g,[[-.2,.12,.7],[.2,.22,0],[.55,.26,-.7],[.8,.25,-1.15]],.015,brass);
      for(let i=0;i<26;i++){const z=.45-i*.057,x=-.08+i*.031,w=Math.sin(i/26*Math.PI)*.34;tube(g,[[x-w,.2,z-.1],[x,.25,z],[x+w,.23,z+.14]],.014,paper);}
    } else {
      const data={dnd:['Dungeons|& Dragons','#493422','#d9be7e'], 'vampire-da':['Vampiro|Edad Oscura','#d9c8a1','#671d28'],tormentas:['El Archivo de|las Tormentas','#ddd0af','#293f53'],cthulhu:['La llamada|de Cthulhu','#c8b995','#30403b'],pathfinder:['Pathfinder|Segunda edición','#ded0a6','#543c48'],traveller:['TRAVELLER|Terminal estelar','#102f32','#94d8d1'],vampire:['Vampiro|La Mascarada','#260d18','#eed5d8']}[kind];
      const device=['traveller','vampire'].includes(kind),w=device?1.65:2.15,d=3;
      box(g,w,.15,d,device?iron:hide,0,.12);if(!device){for(let i=0;i<6;i++)box(g,w-.08,.012,d-.1,paper,.02,.21+i*.015);box(g,w+.03,.06,d+.03,hide,0,.33);}
      label(g,data[0],w-.16,d-.2,data[1],data[2],0,device?.205:.367);
      if(kind==='dnd'){for(const x of [-.96,.96])for(const z of [-1.38,1.38])box(g,.19,.04,.19,brass,x,.4,z);box(g,.32,.055,.3,brass,1,.4,.2);}
      if(kind==='pathfinder'){cylinder(g,.52,.15,brass,.4,.48,.55);cylinder(g,.45,.018,mat('#263142'),.4,.57,.55);const needle=mesh(g,new T.ConeGeometry(.1,.7,4),mat('#b35443'),.4,.6,.55);needle.rotation.x=Math.PI/2;ring(g,.47,.025,brass,.4,.59,.55);}
      if(kind==='traveller'){for(let i=0;i<3;i++)cylinder(g,.095,.04,iron,-.4+i*.4,.25,1.2);}
      if(kind==='tormentas'){tube(g,[[1.03,.4,1.2],[1.03,.4,-1.1]],.035,brass);ball(g,.085,mat('#82d0ee',.1,.3,{emissive:'#42a2dc',emissiveIntensity:.6}),1.03,.4,-1.15);}
    }
    return g;
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let raf=0,active=null;
  function draw(item,tilt=0){if(!item.node.isConnected)return;objects.forEach(o=>o.group.visible=o===item);item.group.rotation.y=tilt;
    const empty=item.node.classList.contains('is-empty'),out=table.classList.contains('is-dark');
    item.group.traverse(m=>{
      if(m.userData.sides){const value=item.node.querySelector('[data-sides="'+m.userData.sides+'"] b')?.textContent||m.userData.sides;if(m.userData.value!==value){const c=m.material.map.image,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#f2e6c9';ctx.font='bold 340px Georgia';ctx.textAlign='center';ctx.fillText(value,256,435,480);m.material.transparent=true;m.material.alphaTest=.1;m.material.map.needsUpdate=true;m.userData.value=value;}}
      if(m.name==='foam'||m.name==='beer')m.visible=!empty;if(m.name==='flame'||m.name==='glow')m.visible=!item.node.classList.contains('is-out');if(m.name==='gem')m.material.emissiveIntensity=item.node.classList.contains('is-infused')?2:.1;});
    light.intensity=out?.7:2.6;camera.zoom=item.node.dataset.system?1.65:1.7;camera.updateProjectionMatrix();renderer.render(scene,camera);const ctx=item.canvas.getContext('2d');ctx.clearRect(0,0,640,640);ctx.drawImage(renderer.domElement,0,0);}
  table.querySelectorAll('[data-system],[data-egg]').forEach(node=>{const kind=node.dataset.system||node.dataset.egg;const g=model(kind,node);scene.add(g);const canvas=document.createElement('canvas');canvas.width=canvas.height=640;canvas.className='mesa-model';canvas.setAttribute('aria-hidden','true');node.append(canvas);const item={node,group:g,canvas};objects.push(item);draw(item);node.classList.add('has-model');
    node.addEventListener('pointermove',e=>{if(reduced.matches)return;active=item;const b=node.getBoundingClientRect();const tilt=(e.clientX-b.left-b.width/2)/b.width*.24;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>draw(item,tilt));});node.addEventListener('pointerleave',()=>draw(item));
    node.addEventListener('click',()=>{if(kind!=='dados'||reduced.matches)return;cancelAnimationFrame(raf);const start=performance.now();const roll=now=>{const p=Math.min(1,(now-start)/650);draw(item,Math.PI*2*(1-Math.pow(1-p,3)));if(p<1&&node.isConnected)raf=requestAnimationFrame(roll);};raf=requestAnimationFrame(roll);});
  });
  const observer=new MutationObserver(records=>{if(records.some(r=>r.attributeName==='class'))objects.forEach(o=>draw(o));});observer.observe(table,{attributes:true,subtree:true,attributeFilter:['class']});
  const dispose=()=>{cancelAnimationFrame(raf);observer.disconnect();scene.traverse(m=>{m.geometry?.dispose();if(m.material){(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>x.dispose());}});resources.forEach(x=>x.dispose());renderer.dispose();};stopPrevious=dispose;
}
