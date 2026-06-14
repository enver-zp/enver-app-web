const https = require('https');
const query = '[out:json];relation["name"="Osmaniye"]["admin_level"="4"];out geom;';
const req = https.request({
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        const rel = json.elements.find(e => e.tags && e.tags.name === 'Osmaniye');
        if(!rel) { console.log('No data'); return; }
        
        let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
        const pts = [];
        
        // Overpass geom gives us lat/lon for each node in the way
        rel.members.forEach(m => {
          if(m.type==='way' && m.geometry) {
            m.geometry.forEach(g => {
              pts.push([g.lon, g.lat]);
              if(g.lat<minLat) minLat=g.lat; if(g.lat>maxLat) maxLat=g.lat;
              if(g.lon<minLon) minLon=g.lon; if(g.lon>maxLon) maxLon=g.lon;
            });
          }
        });
        
        // scale to 0-100 viewBox
        const width = maxLon - minLon;
        const height = maxLat - minLat;
        let path = '';
        
        // In reality, relation ways aren't perfectly ordered, so this might draw a spider web.
        // A simple trick for a solid blob is to compute the convex hull or just use the outline 
        // if we sort them by angle from center.
        const cx = minLon + width/2;
        const cy = minLat + height/2;
        
        pts.sort((a,b) => {
            const angleA = Math.atan2(a[1]-cy, a[0]-cx);
            const angleB = Math.atan2(b[1]-cy, b[0]-cx);
            return angleA - angleB;
        });

        pts.forEach((p, i) => {
          const x = ((p[0] - minLon) / width) * 100;
          const y = 100 - (((p[1] - minLat) / height) * 100); 
          path += (i===0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
        });
        
        const fs = require('fs');
        fs.writeFileSync('osmaniye-path.txt', path + 'Z');
        console.log('Path written! Points:', pts.length);
    } catch(e) {
        console.log(e);
    }
  });
});
req.write('data=' + encodeURIComponent(query));
req.end();
