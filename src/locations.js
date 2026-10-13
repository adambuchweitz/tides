// Shared by the single-file browser build and the Node tests.
const TideLocations = (() => {
  const DEFAULT_STATION = '8677832';
  const BUILT_INS = {
    '8677832': {id:'8677832',name:'Jekyll Island Marina',state:'GA',lat:31.0567,lng:-81.4233,continuous:false,tz:'America/New_York'},
    '8677344': {id:'8677344',name:'St. Simons Island',state:'GA',lat:31.1317,lng:-81.3967,continuous:true,tz:'America/New_York'}
  };
  const MDAPI = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/';
  const SOLAR_API = 'https://api.sunrise-sunset.org/v2';
  const DAY = 86400000;
  const REGION_NAMES = {AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',PR:'Puerto Rico',VI:'U.S. Virgin Islands',AS:'American Samoa',GU:'Guam',MP:'Northern Mariana Islands',BC:'British Columbia'};
  function regionName(code) { return REGION_NAMES[code] || code; }
  function invalid(message, field) { const error = new Error(message); error.field = field; return error; }
  function validZone(zone) {
    if (typeof zone !== 'string' || !zone.trim()) return false;
    try { new Intl.DateTimeFormat('en-US', {timeZone:zone}).format(); return true; } catch { return false; }
  }
  function coordinate(value, limit, field) {
    if (value === undefined || value === null || String(value).trim() === '' || !Number.isFinite(Number(value)) || Math.abs(Number(value)) > limit)
      throw invalid(`${field === 'lat' ? 'Latitude' : 'Longitude'} must be between ${-limit} and ${limit}.`, field);
    return Number(value);
  }
  function parseInput(input = {}) {
    const station = String(input.station ?? DEFAULT_STATION).trim();
    if (!/^\d{7}$/.test(station)) throw invalid('Enter a seven-digit NOAA tide station ID.', 'station');
    const overrides = {};
    const hasLat = input.lat !== undefined && input.lat !== null && input.lat !== '';
    const hasLng = input.lng !== undefined && input.lng !== null && input.lng !== '';
    if (hasLat !== hasLng) throw invalid('Enter both latitude and longitude, or leave both blank.', hasLat ? 'lng' : 'lat');
    if (hasLat) { overrides.lat = coordinate(input.lat, 90, 'lat'); overrides.lng = coordinate(input.lng, 180, 'lng'); }
    if (input.tz !== undefined && input.tz !== null && input.tz !== '') {
      const zone = String(input.tz).trim();
      if (!validZone(zone)) throw invalid('Use a timezone name such as America/Los_Angeles.', 'tz');
      overrides.tz = new Intl.DateTimeFormat('en-US', {timeZone:zone}).resolvedOptions().timeZone;
    }
    if (input.label !== undefined && input.label !== null) {
      const label = String(input.label).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 60);
      if (label) overrides.label = label;
    }
    return {station, overrides};
  }
  function fromURL(url) {
    const p = new URL(url).searchParams;
    const input = Object.fromEntries(['station','lat','lng','tz','label'].filter(k => p.has(k)).map(k => [k,p.get(k)]));
    try { return {request:parseInput(input), warning:null}; }
    catch (error) {
      if (error.field === 'station') throw error;
      return {request:parseInput({station:input.station}), warning:'Ignored invalid sunlight settings in the link.'};
    }
  }
  function stationFromMetadata(data, id) {
    const raw = data?.stations?.find(s => String(s.id) === id);
    const type = raw?.tidePredOffsets?.type ?? raw?.tidepredoffsets?.type ?? raw?.type;
    if (!raw || raw.tidal === false || raw.greatlakes || !['R','H','S'].includes(type))
      throw invalid('NOAA has no tide-prediction station with that ID.', 'station');
    return {id, name:BUILT_INS[id]?.name || String(raw.name || `Station ${id}`), state:raw.state || '',
      lat:coordinate(raw.lat,90,'lat'),lng:coordinate(raw.lng,180,'lng'),continuous:type !== 'S'};
  }
  function catalogFromMetadata(data) {
    if (!Array.isArray(data?.stations)) throw new Error('The NOAA station list is unavailable.');
    return data.stations.filter(s => /^\d{7}$/.test(s.id) && ['R','H','S'].includes(s.type))
      .map(s => ({id:String(s.id),name:BUILT_INS[s.id]?.name || s.name,state:s.state || '',
        lat:Number(s.lat),lng:Number(s.lng),continuous:s.type !== 'S'}));
  }
  function normalize(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\bst\b\.?/g,'saint ').replace(/[^a-z0-9]+/g,' ').trim(); }
  function search(stations, query) {
    const q = normalize(query), words = q.split(' ');
    if (!q) return [];
    return stations.map(s => {
      const name = normalize(s.name), state = normalize(s.state), hay = `${name} ${state} ${normalize(regionName(s.state))} ${s.id}`;
      if (!words.every(w => hay.includes(w))) return null;
      const rank = name.startsWith(q) ? 0 : name.split(' ').some(w => w.startsWith(q)) ? 1 : s.id.startsWith(q) ? 2 : state === q ? 3 : 4;
      return {station:s,rank};
    }).filter(Boolean).sort((a,b) => a.rank-b.rank || a.station.name.localeCompare(b.station.name)).map(x => x.station);
  }
  async function resolve(request, read) {
    const {station:id,overrides} = parseInput({station:request.station,...request.overrides});
    let station = BUILT_INS[id];
    if (!station) {
      let data;
      try {
        data = await read(`station:${id}`, `${MDAPI}stations/${id}.json?expand=tidepredoffsets`,
          d => { try { stationFromMetadata(d,id); return true; } catch { return false; } }, 7*DAY);
      } catch (error) {
        if (error.responseStatus === 404 || error.responseStatus === 400) throw invalid('NOAA has no tide-prediction station with that ID.', 'station');
        throw invalid(`Couldn't load details for station ${id}. Check your connection or choose another station.`, 'metadata');
      }
      station = stationFromMetadata(data,id);
    }
    const lat = overrides.lat ?? station.lat, lng = overrides.lng ?? station.lng;
    let tz = overrides.tz || (overrides.lat === undefined ? station.tz : null);
    if (!tz) {
      const p = new URLSearchParams({lat:String(lat),lng:String(lng)});
      try {
        const data = await read(`zone:${lat}:${lng}`,`${SOLAR_API}?${p}`,d => validZone(d?.tzid),30*DAY);
        tz = data.tzid;
      } catch {
        throw invalid(`Couldn't determine the time zone for ${station.name}. Try again, or enter one under Sunlight at a nearby beach.`, 'tz');
      }
    }
    if (!validZone(tz)) throw invalid('The location returned an invalid time zone.', 'tz');
    return {station:id,stationName:station.name,region:station.state,stationLat:station.lat,stationLng:station.lng,
      continuous:station.continuous,lat,lng,tz,label:overrides.label || station.name,overrides};
  }
  function writeURL(url, location) {
    const next = new URL(url);
    next.searchParams.set('station',location.station);
    for (const key of ['lat','lng','tz','label']) {
      const value = location.overrides[key];
      if (value === undefined) next.searchParams.delete(key);
      else next.searchParams.set(key,String(value));
    }
    return next;
  }
  function solarKey(location,anchor,span) { return `sun:${location.lat}:${location.lng}:${location.tz}:${anchor}:${span}`; }
  const dateFormatters = new Map(), midnightCache = new Map();
  function dateKey(date,zone) {
    if (!dateFormatters.has(zone)) dateFormatters.set(zone,new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}));
    const parts = dateFormatters.get(zone).formatToParts(date);
    const value = name => parts.find(p => p.type === name).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  }
  function midnight(key,zone) {
    const cacheKey = `${zone}:${key}`;
    if (midnightCache.has(cacheKey)) return midnightCache.get(cacheKey);
    const target = Date.parse(`${key}T00:00:00Z`);
    if (!Number.isFinite(target) || new Date(target).toISOString().slice(0,10) !== key) throw new Error('Choose a valid calendar date.');
    // Find the first instant in the local calendar day. Some zones skip 00:00
    // or repeat it at DST transitions; a whole date can also be skipped.
    let lo = target-2*DAY, hi = target+2*DAY;
    while (hi-lo>1) {
      const middle = Math.floor((lo+hi)/2);
      if (dateKey(middle,zone) < key) lo=middle; else hi=middle;
    }
    if (dateKey(hi,zone) !== key) throw new Error('That date does not exist in this time zone. Choose another date.');
    midnightCache.set(cacheKey,hi);
    if (midnightCache.size>1000) midnightCache.delete(midnightCache.keys().next().value);
    return hi;
  }
  const solarFields = ['sunrise','sunset','civil_twilight_begin','civil_twilight_end'];
  function validSolar(data) {
    return Array.isArray(data?.days) && data.days.length > 0 && data.days.every(s => /^\d{4}-\d{2}-\d{2}$/.test(s.date)
      && solarFields.every(k => s[k] === null || (typeof s[k] === 'string' && Number.isFinite(Date.parse(s[k]))))
      && (s.day_length === null || (Number.isFinite(s.day_length) && s.day_length >= 0)));
  }
  function parseSolar(data) {
    return Object.fromEntries(data.days.map(s => [s.date,{...s,...Object.fromEntries(solarFields.map(k => [k,s[k] === null ? null : Date.parse(s[k])]))}]));
  }
  function distanceKm(location) {
    const rad = d => d*Math.PI/180, a=rad(location.lat),b=rad(location.stationLat);
    const h=Math.sin((a-b)/2)**2+Math.cos(a)*Math.cos(b)*Math.sin(rad(location.lng-location.stationLng)/2)**2;
    return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));
  }
  return {DEFAULT_STATION,BUILT_INS,MDAPI,SOLAR_API,regionName,parseInput,fromURL,validZone,stationFromMetadata,catalogFromMetadata,search,resolve,writeURL,solarKey,dateKey,midnight,validSolar,parseSolar,distanceKm};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TideLocations;
