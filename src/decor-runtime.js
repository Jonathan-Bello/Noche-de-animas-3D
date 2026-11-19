// Instances use local coordinates on a named support, so moving furniture moves its decor.
function decorPosition(i,layout=NDALayout){const s=layout.obstacles.find(o=>o.id===i.support);if(!s)throw Error('Missing support '+i.support);return{f:s.floor,x:s.rect[0]+i.offset[0],y:s.rect[1]+i.offset[2],h:s.height+i.offset[1]};}
