// Shared architectural reservations: furniture, random props and apparitions use the same limits.
const DOOR_CLEARANCES=NDALayout.doors.map(d=>{const[a,z,c,e]=d.rect,v=c-a===1;return{id:d.id,f:d.floor,rect:[a-(v?1.15:.15),z-(v?.15:1.15),c+(v?1.15:.15),e+(v?.15:1.15)]};});
const layoutRectOverlap=(a,b)=>a[0]<b[2]-.001&&a[2]>b[0]+.001&&a[1]<b[3]-.001&&a[3]>b[1]+.001;
function layoutProtected(f,rect){return DOOR_CLEARANCES.some(d=>d.f===f&&layoutRectOverlap(rect,d.rect))||NDALayout.stairs.some(s=>layoutRectOverlap(rect,s.clearance||s.hole))||NDALayout.obstacles.some(o=>o.floor===f&&o.id.startsWith('reserva_')&&layoutRectOverlap(rect,o.rect));}
function layoutPlacementAllowed(f,x,y,r=.3){return !layoutProtected(f,[x-r,y-r,x+r,y+r]);}
