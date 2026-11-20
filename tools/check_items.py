"""Consumable/cursed art shares the established transform and save contract."""
import runpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=runpy.run_path(str(ROOT/'tools/check_tools.py'))['validate']
KINDS={'te','rosario','ruda','copal','vela','ceniza','cruz','pan','foco','limpia','fotocam','tarot','tablilla','espejoplata','mano','muneca','pentagrama','radio'}
def validate(data,current=None):return base(data,current,kinds=KINDS,version='objetos-v18')
if __name__=='__main__':print(json.dumps(validate(json.loads((ROOT/'src/items-components.json').read_text(encoding='utf8')))))
