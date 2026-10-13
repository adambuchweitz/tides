const {test} = require('node:test');
const assert = require('node:assert/strict');
const {layout,overlaps} = require('../src/label-layout.js');

test('nearby sunset and high-tide labels use different space on a mobile chart', () => {
  const sun={x:282,y:0,width:46,height:36};
  const point={x:307,y:54,width:14,height:14};
  const [label]=layout([{x:314,y:61,width:54,height:28,above:true}],[sun,point],{left:14,right:344,top:0,bottom:124});
  assert.ok(label);
  assert.equal(overlaps(label,sun),false);
  assert.equal(overlaps(label,point),false);
});

test('crowded tide labels never overlap each other or leave the plot bounds', () => {
  const events=[{x:90,y:70,width:52,height:28,above:false},{x:105,y:45,width:54,height:28,above:true},{x:185,y:70,width:54,height:28,above:false}];
  const bounds={left:14,right:344,top:0,bottom:124};
  const labels=layout(events,[],bounds).filter(Boolean);
  assert.ok(labels.length>=2);
  for(const label of labels){assert.ok(label.x>=bounds.left&&label.x+label.width<=bounds.right&&label.y>=bounds.top&&label.y+label.height<=bounds.bottom);}
  for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)assert.equal(overlaps(labels[i],labels[j]),false);
});

test('labels are omitted when no truthful readable placement exists', () => {
  assert.deepEqual(layout([{x:10,y:10,width:40,height:28,above:true}],[],{left:0,right:20,top:0,bottom:10}),[null]);
  assert.deepEqual(layout([{x:10,y:60,width:40,height:28,above:true}],[],{left:0,right:20,top:0,bottom:120}),[null]);
});
