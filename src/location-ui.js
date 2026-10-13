// Embedded in the app's closure by build.mjs.
let locationToken=0,pendingSwitch=false,pendingStation=null,lastLocationAttempt=null,initialFailure=null;
let catalog=[],catalogPromise=null,catalogError=false,activeStation=-1,stationOptions=[];
let recentStations=[];
try { recentStations=JSON.parse(localStorage.getItem('tides-v2:recent')||'[]').filter(s=>/^\d{7}$/.test(s.id)&&typeof s.name==='string').slice(0,4); } catch {}
const locSheet=$('locSheet'),locSearch=$('locSearch');

function zoneName(zone=ZONE,style='longGeneric',at=state.cursor){
 try{return new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:style}).formatToParts(at).find(p=>p.type==='timeZoneName').value;}catch{return zone;}
}
function coordinateText(lat,lng){return `${Math.abs(lat).toFixed(4)}° ${lat<0?'S':'N'}, ${Math.abs(lng).toFixed(4)}° ${lng<0?'W':'E'}`;}
function distanceText(place){const km=TideLocations.distanceKm(place);return state.unit==='m'?`${Math.round(km)} km`:`${Math.round(km/1.609344)} mi`;}
function customCoordinates(place=state.location){return place?.overrides.lat!==undefined;}
function hasOverrides(place=state.location){return !!place&&Object.keys(place.overrides).length>0;}
function renderLocation(){
 if(!state.ready)return;
 const place=state.location,zone=zoneName(),custom=customCoordinates();
 $('locName').textContent=place.label;
 $('locMeta').textContent=`${place.overrides.label?`Tides: ${place.stationName}`:`NOAA ${place.station}`} · ${custom?'Custom sunlight':zone}`;
 $('locDot').hidden=!custom;
 $('locBtn').setAttribute('aria-label',`Location: ${place.label}. Change location`);
 $('zoneTag').textContent=zoneName(ZONE,'short');
 document.title=`${place.label} · Tides & daylight`;
 $('noaaLink').href=`https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${place.station}`;
 $('tideSourceText').textContent=`${place.stationName} (${place.station}) ${place.continuous?'provides predictions every six minutes.':'provides only high and low predictions, so the curve between them is estimated.'}`;
 $('sunSourceText').textContent=`at ${coordinateText(place.lat,place.lng)}${custom?' (custom sunlight location)':''}. Every date and time uses ${place.tz}, including daylight saving time where applicable.`;
}
function locationWindow(place){
 if(state.ready)return {day:state.day,anchor:state.anchor,span:state.span};
 const p=new URL(location.href).searchParams,today=TideLocations.dateKey(new Date(),place.tz);
 const day=validDay(p.get('date'))?p.get('date'):today,start=p.get('start');
 return {day,anchor:validDay(start)&&day>=start&&day<=addDays(start,state.span-1)?start:day,span:state.span};
}
function commitLocation(place,window,schedules,offset){
 const start=TideLocations.midnight(window.day,place.tz),end=TideLocations.midnight(addDays(window.day,1),place.tz);
 stopAnim();stopPlay();++state.version;ZONE=place.tz;
 Object.assign(state,schedules,{location:place,station:place.station,day:window.day,anchor:window.anchor,ready:true,loading:false});
 state.cursor=clamp(start+offset,start,end-1);state.intro=false;
 initialFailure=null;lastMinuteKey=-1;lastTagText='';lastTheme='';view.level=null;view.wet=null;view.flow=0;
 $('refresh').disabled=false;$('refresh').classList.remove('spin');
 computeDomain();scheduleStatus();render();syncUrl();
}
function startupError(error){
 initialFailure=error;state.loading=false;
 $('readout').hidden=true;$('locName').textContent=`Station ${state.station}`;$('locMeta').textContent='Details unavailable';
 $('veil').hidden=false;$('veilTitle').textContent=error.field==='station'?'Station not found':'Location unavailable';
 $('veilMsg').textContent=error.message;$('veilGo').hidden=false;$('veilLocation').hidden=false;
 setStatus('problem',error.message);
}
async function bootstrap(){
 const token=++locationToken;initialFailure=null;
 setStatus('loading','Reading location details');$('readout').hidden=true;
 $('veilTitle').textContent='Finding the shoreline';$('veilMsg').textContent='Reading the tide station and local time zone.';
 $('veilGo').hidden=true;$('veilLocation').hidden=true;
 try{
  const {request,warning}=TideLocations.fromURL(location.href);state.station=request.station;
  $('locName').textContent=TideLocations.BUILT_INS[request.station]?.name||`Station ${request.station}`;
  const place=await TideLocations.resolve(request,readLocation);if(token!==locationToken)return;
  const window=locationWindow(place);const start=TideLocations.midnight(window.day,place.tz);
  TideLocations.midnight(addDays(window.day,1),place.tz);
  ZONE=place.tz;Object.assign(state,{location:place,station:place.station,day:window.day,anchor:window.anchor,ready:true});
  state.cursor=window.day===dateKey(new Date())?Date.now():start+12*HOUR;
  renderLocation();syncUrl();if(warning)toast(warning);
  await load();
 }catch(error){if(token===locationToken)startupError(error);}
}
function rememberStation(place){
 const row={id:place.station,name:place.stationName,state:place.region,continuous:place.continuous};
 recentStations=[row,...recentStations.filter(s=>s.id!==row.id)].slice(0,4);
 try{localStorage.setItem('tides-v2:recent',JSON.stringify(recentStations));}catch{}
}
function banner(message,retry=false){$('locError').textContent=message;$('locBanner').hidden=!message;$('locRetry').hidden=!retry;}
async function selectLocation(request,name){
 const token=++locationToken;pendingSwitch=true;pendingStation=request.station;
 lastLocationAttempt={request,name:name||`station ${request.station}`};banner('');renderStationSearch();renderRecents();
 setStatus('loading',`Loading ${name||`station ${request.station}`}…`);
 try{
  const place=await TideLocations.resolve(request,readLocation);if(token!==locationToken)return false;
  const window=locationWindow(place),offset=state.ready?state.cursor-midnight(state.day):12*HOUR;
  TideLocations.midnight(window.day,place.tz);TideLocations.midnight(addDays(window.day,1),place.tz);
  const schedules=await fetchSchedules(place,window);
  if(token!==locationToken)return false;
  if(schedules.highs.length<2)throw Error(`NOAA has no available tide predictions for ${place.stationName} on these dates. Try another date or station.`);
  if(!schedules.solar[window.day])throw Error(`Couldn't load sunlight for ${place.label}. Check your connection and try again.`);
  const reset=hasOverrides()&&!Object.keys(place.overrides).length;
  if(state.ready)rememberStation(state.location);
  commitLocation(place,window,schedules,offset);rememberStation(place);
  pendingSwitch=false;pendingStation=null;lastLocationAttempt=null;
  if(locSheet.open)locSheet.close();
  const message=`Now showing ${place.label}. Times use ${zoneName()}.${reset?' Sunlight reset to the station.':''}`;
  $('locAnnounce').textContent=message;toast(message);return true;
 }catch(error){
  if(token!==locationToken)return false;
  pendingSwitch=false;pendingStation=null;
  const retained=state.ready?` Still showing ${state.location.label}.`:'';
  banner(`${error.message}${retained}`,true);renderStationSearch();renderRecents();
  if(state.ready)scheduleStatus();else startupError(error);
  return false;
 }
}
function paintLocationHome(){
 const place=state.location;
 $('currentLocName').textContent=state.ready?place.label:'Choose a tide station';
 $('currentLocSubtitle').hidden=!state.ready||!place.overrides.label;
 $('currentLocSubtitle').textContent=state.ready?`Tides: ${place.stationName}`:'';
 $('locDetails').innerHTML=state.ready?[
  ['Tide station',`${esc(place.stationName)} · ${place.station} · <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${place.station}" target="_blank" rel="noopener">NOAA</a>`],
  ['Predictions',place.continuous?'Every six minutes':'Highs and lows only, curve estimated'],
  ['Sunlight at',`${coordinateText(place.lat,place.lng)} · ${customCoordinates()?'custom':'station'}`],
  ['Time zone',`${esc(place.tz)} · ${esc(zoneName(ZONE,'short'))} · ${place.overrides.tz?'set by you':'detected'}`]
 ].map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join(''):'';
 const device=Intl.DateTimeFormat().resolvedOptions().timeZone;
 $('deviceZone').hidden=!state.ready||device===ZONE;
 $('deviceZone').textContent=state.ready?`Your device is on ${zoneName(device)}. Everything here uses ${zoneName()}.`:'';
 $('spotHelp').textContent=`Tides still come from ${place?.stationName||`station ${state.station}`}. Sunrise, sunset and twilight use this spot. Blank coordinates use the station location.`;
 const overrides=state.ready?place.overrides:{};
 $('spotLabel').value=overrides.label||'';$('spotLat').value=overrides.lat??'';$('spotLng').value=overrides.lng??'';$('spotZone').value=overrides.tz||'';
 $('spotLat').placeholder=place?String(Number(place.stationLat.toFixed(4))):'Latitude in degrees';
 $('spotLng').placeholder=place?String(Number(place.stationLng.toFixed(4))):'Longitude in degrees';
 $('spotState').textContent=hasOverrides()?'Custom':'Station location';
 $('spotOptions').open=hasOverrides();clearSpotErrors();updateSpotDistance();renderRecents();
}
function clearSpotErrors(){for(const id of ['spotLat','spotLng','spotZone']){$(id).removeAttribute('aria-invalid');$(id+'Error').hidden=true;}}
function spotRequest(){return TideLocations.parseInput({station:state.station,label:$('spotLabel').value,lat:$('spotLat').value.trim(),lng:$('spotLng').value.trim(),tz:$('spotZone').value.trim()});}
function updateSpotDistance(){
 $('spotDistance').hidden=true;
 $('spotReset').disabled=!hasOverrides()&&!['spotLabel','spotLat','spotLng','spotZone'].some(id=>$(id).value.trim());
 if(!state.ready)return;
 try{const request=spotRequest();if(request.overrides.lat!==undefined){const place={...state.location,...request.overrides};if(TideLocations.distanceKm(place)>50){$('spotDistance').textContent=`This spot is about ${distanceText(place)} from the tide station. Tide times may not match it.`;$('spotDistance').hidden=false;}}}catch{}
}
function rowMarkup(station,index,option=false){
 const busy=pendingStation===station.id,current=state.ready&&station.id===state.station;
 const kind=station.continuous===undefined?'':`<span class="station-kind ${station.continuous?'':'estimated'}">${station.continuous?'Full curve':'Highs & lows'}</span>`;
 return `<button type="button" class="station-row ${option&&index===activeStation?'active':''}" data-loc-station="${station.id}" ${option?`role="option" id="stationOption${index}" tabindex="-1" aria-selected="${current}"`:''}><span><b>${esc(station.name)}${station.state?`, ${esc(station.state)}`:''}</b><small>${busy?'Loading…':`${station.id}${station.state?` · ${esc(TideLocations.regionName(station.state))}`:''}${current?' · Current station':''}`}</small></span>${busy?icon('refresh'):kind}</button>`;
}
function renderRecents(){
 const rows=recentStations.filter(s=>s.id!==state.station);
 $('recentTitle').textContent=rows.length?'Recent':'Start with';
 $('locRecent').innerHTML=(rows.length?rows:Object.values(TideLocations.BUILT_INS)).map((s,i)=>rowMarkup(s,i)).join('');
}
async function loadCatalog(retry=false){
 if(catalogPromise&&!retry)return catalogPromise;
 catalogError=false;
 catalogPromise=readLocation('catalog',TideLocations.MDAPI+'stations.json?type=tidepredictions',d=>Array.isArray(d?.stations)&&d.stations.length>0,DAY)
  .then(data=>{catalog=TideLocations.catalogFromMetadata(data);catalogError=false;if(locSheet.open)renderStationSearch();return catalog;})
  .catch(()=>{catalogError=true;catalogPromise=null;if(locSheet.open){banner("Couldn't load the NOAA station list. You can still enter a station ID.",true);renderStationSearch();}return [];});
 return catalogPromise;
}
function renderStationSearch(){
 const query=locSearch.value.trim();$('locClear').hidden=!query;
 $('locHome').hidden=!!query;$('locResults').hidden=!query;
 locSearch.removeAttribute('aria-activedescendant');
 if(!query){locSearch.setAttribute('aria-expanded','false');stationOptions=[];return;}
 const matches=query.length>=2?TideLocations.search(catalog,query):[];
 stationOptions=matches.slice(0,8);
 if(/^\d{7}$/.test(query)&&!matches.some(s=>s.id===query))stationOptions.unshift({id:query,name:`Use station ${query}`,state:''});
 if(activeStation>=stationOptions.length)activeStation=-1;
 $('locList').innerHTML=stationOptions.map((s,i)=>rowMarkup(s,i,true)).join('');
 locSearch.setAttribute('aria-expanded',String(stationOptions.length>0));
 if(activeStation>=0)locSearch.setAttribute('aria-activedescendant',`stationOption${activeStation}`);
 let note;
 if(query.length<2)note='Type at least two characters to find a station.';
 else if(stationOptions.length)note=matches.length>8?`Showing 8 of ${matches.length}. Keep typing to narrow.`:`${stationOptions.length} station${stationOptions.length===1?'':'s'}`;
 else if(!catalog.length&&!catalogError)note='Loading NOAA stations…';
 else note=`No station matches “${query}”. Try a town, pier, river, or state.`;
 $('locResultNote').textContent=note;$('locAnnounce').textContent=note;
}
function openLocation(){
 banner('');activeStation=-1;locSearch.value='';paintLocationHome();renderStationSearch();
 if(!locSheet.open)locSheet.showModal();locSheet.querySelector('.loc-body').scrollTop=0;updateLocationEdges();locSearch.focus();loadCatalog();
}
async function copyViewLink(){
 if(!state.ready){toast('Choose a location before copying a link.');return;}
 syncUrl();try{await navigator.clipboard.writeText(location.href);toast(`Link copied with this place, ${hasOverrides()?'custom settings, ':''}date, and units.`);}catch{toast('Copy the address in your browser to share this view.');}
}
$('locBtn').onclick=$('veilLocation').onclick=openLocation;
$('locClose').onclick=()=>locSheet.close();
locSheet.addEventListener('close',()=>{if(pendingSwitch){++locationToken;pendingSwitch=false;pendingStation=null;if(state.ready)scheduleStatus();}locSearch.setAttribute('aria-expanded','false');$('locBtn').focus();});
locSheet.addEventListener('cancel',event=>{if(locSearch.value){event.preventDefault();locSearch.value='';activeStation=-1;renderStationSearch();locSearch.focus();}});
locSheet.addEventListener('click',event=>{if(event.target===locSheet){const r=locSheet.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)locSheet.close();}});
let searchTimer;
locSearch.addEventListener('input',()=>{activeStation=-1;clearTimeout(searchTimer);searchTimer=setTimeout(renderStationSearch,120);});
$('locClear').onclick=()=>{locSearch.value='';activeStation=-1;renderStationSearch();locSearch.focus();};
locSearch.addEventListener('keydown',event=>{
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!stationOptions.length)return;activeStation=(activeStation+(event.key==='ArrowDown'?1:-1)+stationOptions.length)%stationOptions.length;renderStationSearch();$(`stationOption${activeStation}`).scrollIntoView({block:'nearest'});}
 else if(event.key==='Enter'){event.preventDefault();const station=stationOptions[activeStation<0?0:activeStation];if(station)selectLocation({station:station.id,overrides:{}},station.name);}
 else if(event.key==='Escape'&&locSearch.value){event.preventDefault();event.stopPropagation();locSearch.value='';activeStation=-1;renderStationSearch();}
});
for(const id of ['locList','locRecent'])$(id).addEventListener('click',event=>{const button=event.target.closest('[data-loc-station]');if(button){const id=button.dataset.locStation;const station=[...stationOptions,...recentStations,...Object.values(TideLocations.BUILT_INS)].find(s=>s.id===id);selectLocation({station:id,overrides:{}},station?.name);}});
$('locRetry').onclick=()=>lastLocationAttempt?selectLocation(lastLocationAttempt.request,lastLocationAttempt.name):loadCatalog(true);
$('spotForm').addEventListener('submit',event=>{event.preventDefault();clearSpotErrors();try{const request=spotRequest();selectLocation(request,request.overrides.label||state.location?.stationName);}catch(error){const id={lat:'spotLat',lng:'spotLng',tz:'spotZone'}[error.field];if(id){$(id).setAttribute('aria-invalid','true');$(id+'Error').textContent=error.message;$(id+'Error').hidden=false;$(id).focus();}else banner(error.message);}});
$('spotReset').onclick=()=>selectLocation({station:state.station,overrides:{}},state.location?.stationName);
for(const id of ['spotLabel','spotLat','spotLng','spotZone'])$(id).addEventListener('input',updateSpotDistance);
$('spotLat').addEventListener('paste',event=>{const text=event.clipboardData?.getData('text')||'',match=text.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);if(match){event.preventDefault();$('spotLat').value=match[1];$('spotLng').value=match[2];updateSpotDistance();}});
let userExpandedSpot=false;
function updateLocationEdges(){const body=locSheet.querySelector('.loc-body'),wrap=body.parentElement;wrap.dataset.top=body.scrollTop>2;wrap.dataset.bottom=body.scrollHeight-body.clientHeight-body.scrollTop>2;}
locSheet.querySelector('.loc-body').addEventListener('scroll',updateLocationEdges,{passive:true});
const locationSizeObserver=new ResizeObserver(updateLocationEdges);for(const el of [locSheet.querySelector('.loc-body'),$('locHome'),$('locResults')])locationSizeObserver.observe(el);
$('spotOptions').querySelector('summary').addEventListener('click',()=>{userExpandedSpot=!$('spotOptions').open;});
$('spotOptions').addEventListener('toggle',()=>{const shouldScroll=userExpandedSpot&&$('spotOptions').open&&locSheet.open;userExpandedSpot=false;requestAnimationFrame(()=>{if(shouldScroll){const body=locSheet.querySelector('.loc-body'),top=$('spotOptions').getBoundingClientRect().top-body.getBoundingClientRect().top+body.scrollTop-52;body.scrollTo({top,behavior:RM.matches?'auto':'smooth'});}updateLocationEdges();});});
try{$('zoneNames').innerHTML=Intl.supportedValuesOf('timeZone').map(zone=>`<option value="${esc(zone)}"></option>`).join('');}catch{}
if(window.visualViewport){const viewport=()=>locSheet.style.setProperty('--vvh',`${window.visualViewport.height}px`);window.visualViewport.addEventListener('resize',viewport);viewport();}
$('locShare').onclick=copyViewLink;
