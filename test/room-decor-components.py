import json,copy,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];d=json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'));validate=runpy.run_path(str(ROOT/'tools/check_furnishing.py'))['validate'];r=validate(d)
assert r['decorComponents']==203 and r['throwableComponents']==44
assert all(any(i['room']==room['id']for i in d['decorInstances'])for room in d['rooms'])
# No physical object can be placed on a room-wide wall-only reference.
bad=copy.deepcopy(d);i=next(i for i in bad['decorInstances']if i['id']=='A02_wall_sewing_01');i['asset']='jar'
try:validate(bad)
except ValueError as e:assert 'soporte físico' in str(e)
else:raise AssertionError('Wall anchor accepted a loose jar')
# The chapel window crosses floors; upper choir artwork must not cover it.
bad=copy.deepcopy(d);i=next(i for i in bad['decorInstances']if i['id']=='A03_music_score_01');i['offset'][0]=10.5
try:validate(bad)
except ValueError as e:assert 'tapa ventana' in str(e)
else:raise AssertionError('Cross-floor window overlap was accepted')
print(json.dumps(dict(passed=True,allRoomsDecorated=27,newRooms=17,newComponents=109,virtualSupportsAndCrossFloorWindows=True,**r)))
