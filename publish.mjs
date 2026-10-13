const configPath = `${process.env.HOME}/.config/publish/config.toml`;
const c = Bun.TOML.parse(await Bun.file(configPath).text());
const previous = await Bun.file('publication.json').exists() ? await Bun.file('publication.json').json() : null;
const response = await fetch(`${c.publishing_url}/api/documents${previous ? '/'+previous.id : ''}`, {
  method: previous ? 'PATCH' : 'POST',
  headers: {Authorization: `Bearer ${c.publishing_token}`, 'Content-Type': 'application/json'},
  body: JSON.stringify({title:'Tides & daylight',html:await Bun.file('index.html').text(),visibility:'public',...(previous?{}:{created_by:'agent'})})
});
if (!response.ok) throw new Error(`Publish failed: ${response.status}`);
const document=await response.json();
const result={id:document.id,url:new URL(document.url,c.publishing_url).href};
await Bun.write('publication.json',JSON.stringify(result,null,2));
const verified=await fetch(result.url);if(!verified.ok) throw new Error(`Verification failed: ${verified.status}`);
console.log(JSON.stringify({...result,verified:verified.status}));
