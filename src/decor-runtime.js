// Instances use local coordinates on a named support, so moving furniture moves its decor.
function decorSupport(id,layout=NDALayout){return layout.obstacles.find(o=>o.id===id)||(layout.decorSupports||[]).find(o=>o.id===id);}
function decorPosition(i,layout=NDALayout){const s=decorSupport(i.support,layout);if(!s)throw Error('Missing support '+i.support);return{f:s.floor,x:s.rect[0]+i.offset[0],y:s.rect[1]+i.offset[2],h:s.height+i.offset[1]};}

// Reserve wall vignettes at their real height, including random fuse-box placement.
function decorWallOccupied(f,x,y,lo=1,hi=2.1,r=.4){return(NDALayout.decorInstances||[]).some(i=>{const a=NDALayout.decorAssets[i.asset];if(a.mount!=='wall')return false;const p=decorPosition(i);return p.f===f&&p.h<hi&&p.h+a.height>lo&&Math.hypot(p.x-x,p.y-y)<(a.width||a.radius*2)/2+r;});}
