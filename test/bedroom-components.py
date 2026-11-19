import json,copy,runpy,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];d=json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'));validate=runpy.run_path(str(ROOT/'tools/check_furnishing.py'))['validate'];report=validate(d)
assert report['decorComponents']==94 and report['throwableComponents']==28
assert sum(i['room'] in ['A04','A06','A10','A11','A14','A15'] for i in d['decorInstances'])==44
for change,expected in [('window','tapa ventana'),('detached','separado de su muro')]:
 bad=copy.deepcopy(d);piece=next(i for i in bad['decorInstances']if i['id']=='A04_family_frame_01')
 if change=='window':piece['offset'][0]=1.6
 else:piece['offset'][2]-=.3
 try:validate(bad)
 except ValueError as e:assert expected in str(e),str(e)
 else:raise AssertionError('Invalid wall fixture accepted: '+change)
print(json.dumps(dict(passed=True,rooms=6,newComponents=44,wallWindowAndAttachmentGuards=True,**report)))
