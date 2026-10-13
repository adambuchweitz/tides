const {test} = require('node:test');
const assert = require('node:assert/strict');
const L = require('../src/locations.js');

test('old Jekyll links keep their date, units and chosen station', async () => {
  const url = 'https://example.test/?station=8677344&date=2027-06-01&days=6&unit=m';
  const {request,warning} = L.fromURL(url);
  const location = await L.resolve(request, () => { throw new Error('Built-in should not need metadata'); });
  assert.equal(warning,null);
  assert.equal(location.stationName,'St. Simons Island');
  assert.equal(location.tz,'America/New_York');
  assert.equal(location.continuous,true);
  const next = L.writeURL(url,location);
  assert.equal(next.searchParams.get('date'),'2027-06-01');
  assert.equal(next.searchParams.get('unit'),'m');
  assert.equal(next.searchParams.has('lat'),false);
});

test('a station-only URL resolves NOAA metadata and the local solar timezone', async () => {
  const calls=[];
  const location = await L.resolve(L.parseInput({station:'9414290'}),async (key,url,validate) => {
    calls.push({key,url});
    const data = key.startsWith('station:') ? {stations:[{id:'9414290',name:'San Francisco',state:'CA',lat:37.806305,lng:-122.46589,tidal:true,tidePredOffsets:{type:'R'}}]} : {tzid:'America/Los_Angeles'};
    assert.ok(validate(data));
    return data;
  });
  assert.equal(location.label,'San Francisco');
  assert.equal(location.tz,'America/Los_Angeles');
  assert.equal(location.continuous,true);
  assert.match(calls[0].url,/expand=tidepredoffsets/);
  assert.match(calls[1].url,/lat=37.806305&lng=-122.46589/);
  assert.equal(L.dateKey(new Date('2027-06-01T06:30:00Z'),location.tz),'2027-05-31');
});

test('nearby sunlight coordinates and explicit timezone override the station baseline', async () => {
  const request=L.parseInput({station:'8677832',lat:'0',lng:'0',tz:'Africa/Abidjan',label:'Test beach'});
  const location=await L.resolve(request,()=>{throw new Error('Explicit timezone should not need lookup');});
  assert.equal(location.lat,0);
  assert.equal(location.lng,0);
  assert.equal(location.label,'Test beach');
  assert.equal(location.stationLat,31.0567);
  const shared=L.writeURL('https://example.test/?lat=12&lng=13&tz=UTC&label=Old',location);
  assert.deepEqual(L.fromURL(shared).request,request);
  const baseline=await L.resolve(L.parseInput({station:'8677344'}),()=>{});
  const reset=L.writeURL(shared,baseline);
  for(const key of ['lat','lng','tz','label'])assert.equal(reset.searchParams.has(key),false);
});

test('invalid station IDs fail and invalid URL overrides have an explicit baseline warning', () => {
  assert.throws(()=>L.fromURL('https://example.test/?station=999'),/seven-digit/);
  for(const input of [{lat:'12'},{lng:'-20'},{lat:'91',lng:'0'},{lat:'0',lng:'-181'},{tz:'Definitely/Not_A_Zone'}])
    assert.throws(()=>L.parseInput(input));
  const {request,warning}=L.fromURL('https://example.test/?station=8677344&lat=abc&lng=0');
  assert.equal(request.station,'8677344');
  assert.deepEqual(request.overrides,{});
  assert.match(warning,/Ignored invalid/);
  assert.equal(L.parseInput({label:' A\nB\u0000 '+ 'x'.repeat(80)}).overrides.label.length,60);
});

test('missing, non-tidal or unclassified metadata never masquerades as a valid tide station', () => {
  for(const raw of [null,{id:'9414290',lat:0,lng:0,tidal:false,type:'R'},{id:'9414290',lat:0,lng:0,type:'X'},{id:'9414290',lat:null,lng:0,type:'R'}])
    assert.throws(()=>L.stationFromMetadata({stations:raw?[raw]:[]},'9414290'));
  const subordinate=L.stationFromMetadata({stations:[{id:'9999999',name:'Test harbor',lat:1,lng:2,tidePredOffsets:{type:'S'}}]},'9999999');
  assert.equal(subordinate.continuous,false);
});

test('timezone lookup failures block custom coordinates instead of borrowing the station zone', async () => {
  await assert.rejects(L.resolve(L.parseInput({lat:40,lng:-123}),async()=>{throw new Error('offline');}),/Couldn't determine the time zone/);
});

test('solar caches differ by coordinates, timezone and date window', async () => {
  const a=await L.resolve(L.parseInput(),()=>{});
  const b={...a,lat:a.lat+.01};
  const c={...a,tz:'America/Chicago'};
  assert.equal(new Set([L.solarKey(a,'2027-06-01',7),L.solarKey(b,'2027-06-01',7),L.solarKey(c,'2027-06-01',7),L.solarKey(a,'2027-06-02',7)]).size,4);
});

test('local midnights handle DST, western offsets and fractional offsets', () => {
  assert.equal(L.midnight('2027-06-01','America/Los_Angeles'),Date.parse('2027-06-01T07:00:00Z'));
  assert.equal(L.midnight('2027-06-01','Pacific/Honolulu'),Date.parse('2027-06-01T10:00:00Z'));
  assert.equal(L.midnight('2027-06-01','Asia/Kathmandu'),Date.parse('2027-05-31T18:15:00Z'));
  const hours=(a,b,z)=>(L.midnight(b,z)-L.midnight(a,z))/3600000;
  assert.equal(hours('2027-03-14','2027-03-15','America/Los_Angeles'),23);
  assert.equal(hours('2027-11-07','2027-11-08','America/Los_Angeles'),25);
  assert.throws(()=>L.midnight('2011-12-30','Pacific/Apia'),/does not exist/);
  assert.equal(L.midnight('2027-09-05','America/Santiago'),Date.parse('2027-09-05T04:00:00Z'));
  assert.equal(L.midnight('2027-11-07','America/Havana'),Date.parse('2027-11-07T04:00:00Z'));
});

test('station searches match punctuation, accents and state-plus-town queries', () => {
  const stations=[{id:'8677344',name:'St. Simons Island',state:'GA'},{id:'9414290',name:'San Francisco',state:'CA'},{id:'9750000',name:'Bahía Test',state:'PR'}];
  assert.equal(L.search(stations,'Saint Simons')[0].id,'8677344');
  assert.equal(L.search(stations,'St.Simons')[0].id,'8677344');
  assert.equal(L.search(stations,'San Francisco CA')[0].id,'9414290');
  assert.equal(L.search(stations,'San Francisco California')[0].id,'9414290');
  assert.equal(L.search(stations,'bahia')[0].id,'9750000');
  assert.equal(L.search(stations,'9414290')[0].name,'San Francisco');
});

test('polar solar schedules preserve missing events as null, rather than epoch zero', () => {
  const data={days:[{date:'2027-06-01',sun_status:'midnight_sun',sunrise:null,sunset:null,civil_twilight_begin:null,civil_twilight_end:null,day_length:86400}]};
  assert.ok(L.validSolar(data));
  assert.equal(L.parseSolar(data)['2027-06-01'].sunrise,null);
  assert.equal(L.validSolar({days:[{...data.days[0],sunrise:'not a time'}]}),false);
});
