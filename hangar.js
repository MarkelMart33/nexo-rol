(() => {
  const api=window.NEXO_HANGAR_API, $=id=>document.getElementById(id);
  if(!api)return;
  let screen='list',selected=null,pending=null;
  const root=$('hangarRoot');
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
  function ships(){return api.getShips()}
  function current(){return ships().find(ship=>ship.id===selected)||null}
  function metric(label,value){const box=el('span');box.append(el('small','',label),el('b','',value));return box}
  function render(){
    if(!root)return;
    root.replaceChildren();
    const head=el('div','panel-title'),heading=el('div');
    heading.append(el('span','section-index','08 / FLOTA'),el('h2','','Hangar'));
    const add=el('button','small-action','＋ AÑADIR NAVE');add.type='button';add.onclick=()=>{$('addShipForm').reset();$('addShipDialog').showModal()};
    head.append(heading,add);
    root.append(head,el('p','','Gestiona las naves de esta partida. Las ventas se abonarán a la cartera solo cuando las confirmes.'));
    const ship=current();
    if(screen==='list'){
      const list=el('div','ship-list');
      if(!ships().length){const empty=el('div','hangar-empty');empty.append(el('span','','⌑'),el('b','','Hangar vacío'),el('small','','Añade la nave de la partida para consultar sus datos y gestionar su venta.'));list.append(empty)}
      ships().forEach(item=>{const card=el('button','ship-card');card.type='button';const glyph=el('span','ship-card-glyph','⌑'),main=el('span','ship-card-main');main.append(el('b','',item.name),el('small','',api.format(item.tonnage)+' Tn'));card.append(glyph,main,el('span','ship-card-value',api.format(item.value)+' Cr'),el('span','ship-card-arrow','→'));card.onclick=()=>{selected=item.id;screen='detail';render()};list.append(card)});
      root.append(list);return;
    }
    if(!ship){screen='list';render();return}
    const sub=el('div','hangar-subhead'),back=el('button','small-action subtle','← ATRÁS');back.type='button';back.onclick=()=>{screen=screen==='sell'?'detail':'list';if(screen==='list')selected=null;render()};sub.append(back,el('span','section-index',screen==='sell'?'VENTA DE SEGUNDA MANO':'FICHA DE NAVE'));root.append(sub);
    if(screen==='detail'){
      const content=el('div','ship-detail-content');content.append(el('div','hangar-ship-mark','⌑'));const info=el('div','hangar-ship-info');info.append(el('small','','NAVE REGISTRADA'),el('h3','',ship.name));const metrics=el('div','hangar-ship-metrics');metrics.append(metric('TONELADAS',api.format(ship.tonnage)+' Tn'),metric('VALOR BASE',api.format(ship.value)+' Cr'));info.append(metrics);content.append(info);root.append(content);
      const actions=el('div','hangar-actions'),del=el('button','cancel-button danger-button','ELIMINAR NAVE'),sell=el('button','confirm-button buy-confirm','VENDER ↗');del.type=sell.type='button';del.onclick=()=>{if(!confirm('¿Eliminar «'+ship.name+'» del hangar? Se retirará como nave perdida y no se añadirán créditos.'))return;api.deleteShip(ship.id);selected=null;screen='list';render()};sell.onclick=()=>{screen='sell';render()};actions.append(del,sell);root.append(actions);return;
    }
    root.append(el('div','hangar-sale-ship',ship.name+' · '+api.format(ship.tonnage)+' Tn'));
    const breakdown=el('div','hangar-sale-breakdown');
    breakdown.append(metric('VALOR BASE DE LA NAVE',api.format(ship.value)+' Cr'),metric('VALOR BASE AL 50% · SEGUNDA MANO',api.format(ship.value*.5)+' Cr'));
    const toggle=el('label','hangar-roll-toggle'),check=document.createElement('input');check.type='checkbox';check.checked=false;const toggleText=el('span','','APLICAR TIRADA DE COMERCIANTE · OPCIONAL');toggle.append(check,toggleText);breakdown.append(toggle);
    const rollField=el('label','field hangar-roll-field'),rollLabel=el('span','','TIRADA TOTAL'),roll=document.createElement('input');roll.type='number';roll.step='1';roll.value='10';rollField.append(rollLabel,roll,el('small','','Se aplicará el porcentaje de venta al valor de segunda mano.'));rollField.hidden=true;breakdown.append(rollField);
    const rateRow=el('div','hangar-rate-row'),netRow=el('div','hangar-net-row'),rateValue=el('b'),netValue=el('b'),note=el('small','hangar-sale-note');rateRow.append(el('span','','PORCENTAJE DE VENTA'),rateValue);netRow.append(el('span','','VALOR NETO A RECIBIR'),netValue);breakdown.append(rateRow,netRow,note);root.append(breakdown);
    const getResult=()=>{const withRoll=check.checked,n=Math.trunc(Number(roll.value)||0),percent=withRoll?api.rate(n)[2]:100,used=ship.value*.5;return{percent,total:used*percent/100,roll:withRoll?n:null}};
    const update=()=>{const result=getResult();rollField.hidden=!check.checked;rateValue.textContent=api.format(result.percent)+'%';netValue.textContent=api.format(result.total)+' Cr';note.textContent=check.checked?'Tirada '+result.roll+' · '+api.format(result.percent)+'% aplicado al valor de segunda mano.':'Venta estándar de segunda mano, sin tirada.'};
    check.onchange=update;roll.oninput=update;update();
    const actions=el('div','hangar-actions'),cancel=el('button','cancel-button','CANCELAR'),confirmSell=el('button','confirm-button buy-confirm','CONFIRMAR VENTA');cancel.type=confirmSell.type='button';cancel.onclick=()=>{screen='detail';render()};confirmSell.onclick=()=>{const result=getResult();pending={id:ship.id,...result};$('hangarConfirmSummary').textContent='Vender '+ship.name+' por '+api.format(result.total)+' Cr. El importe se abonará a la cartera y la nave se retirará del hangar.';$('hangarConfirmDialog').showModal()};actions.append(cancel,confirmSell);root.append(actions);
  }
  $('addShipForm').onsubmit=e=>{e.preventDefault();const name=$('shipName').value.trim(),tonnage=Number($('shipTonnage').value),value=Number($('shipValue').value);if(!name||!Number.isFinite(tonnage)||tonnage<0||!Number.isFinite(value)||value<0)return;api.addShip({id:crypto.randomUUID(),name,tonnage,value});$('addShipDialog').close();selected=null;screen='list';render()};
  $('hangarYesSell').onclick=e=>{e.preventDefault();if(!pending)return;api.sellShip(pending.id,pending.total,pending.roll,pending.percent);pending=null;selected=null;screen='list';$('hangarConfirmDialog').close();render()};
  $('hangarConfirmDialog').addEventListener('close',()=>{if($('hangarConfirmDialog').returnValue==='cancel')pending=null});
  window.NEXO_HANGAR_UI={render,open(){selected=null;screen='list';render()}};
})();

