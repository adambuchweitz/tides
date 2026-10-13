// Small collision-aware layout shared by the SVG chart, canvas and tests.
const TideLabels = (() => {
  function overlaps(a,b,gap=3) { return a.x < b.x+b.width+gap && a.x+a.width+gap > b.x && a.y < b.y+b.height+gap && a.y+a.height+gap > b.y; }
  function layout(events,obstacles,bounds) {
    const occupied=[...obstacles];
    return events.map(event => {
      if(event.width>bounds.right-bounds.left || event.height>bounds.bottom-bounds.top)return null;
      const preferred=event.above?event.y-event.height-12:event.y+10;
      const opposite=event.above?event.y+10:event.y-event.height-12;
      const ys=[preferred,opposite,preferred-14,opposite-14,preferred+14,opposite+14];
      const center=Math.max(bounds.left+event.width/2,Math.min(bounds.right-event.width/2,event.x));
      for(const dx of [0,-24,24,-48,48])for(const y of ys) {
        const x=Math.max(bounds.left,Math.min(bounds.right-event.width,center+dx-event.width/2));
        const box={x,y,width:event.width,height:event.height};
        if(y<bounds.top || y+event.height>bounds.bottom || occupied.some(o=>overlaps(box,o)))continue;
        occupied.push(box);return box;
      }
      return null; // Event times remain available in the event strip.
    });
  }
  return {overlaps,layout};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TideLabels;
