"""Arma juego/index.html a partir de src/. Uso: python3 src/build.py [prod|test]"""
import sys, os, json, runpy
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = lambda f: open(os.path.join(root, 'src', f), encoding='utf-8').read()
mode = sys.argv[1] if len(sys.argv) > 1 else 'prod'
three = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js' if mode == 'prod' else '/test/three.module.js'
layout=json.loads(src('layout-v11.json'))
runpy.run_path(os.path.join(root, 'tools', 'check_furnishing.py'))['validate'](layout)
runpy.run_path(os.path.join(root, 'tools', 'check_tools.py'))['validate'](json.loads(src('tools-components.json')))
runpy.run_path(os.path.join(root, 'tools', 'check_items.py'))['validate'](json.loads(src('items-components.json')))
runpy.run_path(os.path.join(root, 'tools', 'check_furniture.py'))['validate'](json.loads(src('furniture-components.json')))
runpy.run_path(os.path.join(root, 'tools', 'export_room_modules.py'))['export'](layout)
s = src('shell2.html')
logic_files = ['stair-layout.js', 'placement-layout.js', 'logic2.js', 'rules3.js', 'rules4.js', 'decor-runtime.js', 'layout-rules.js', 'decor-rules.js', 'rules5.js', 'campaign-rules.js', 'ux-rules.js', 'lab.js', 'net.js']
game_files = ['chars3d.js', 'alex-art.js', 'elenco-art.js', 'character-qc.js',
              'anima-art.js', 'house-art.js', 'casona-layout3d.js', 'furniture-props3d.js', 'decor3d.js', 'tools-art3d.js', 'items-art3d.js', 'furniture-art3d.js', 'game3d.js', 'casona3d.js',
              'base3d.js', 'snd3d.js', 'lab3d.js', 'casa3d.js', 'campana3d.js', 'ui3d.js']
logic = '\n'.join(src(f) for f in logic_files).replace('/*LAYOUT_RUNTIME*/', src('layout-runtime.js'))
logic = 'const NDALayout=' + json.dumps(json.loads(src('layout-v11.json')), ensure_ascii=False, separators=(',', ':')) + ';\n' + logic
s = s.replace('/*LOGIC*/', logic).replace(
    '/*GAME*/', '\n'.join(('globalThis.NDAToolComponents='+json.dumps(json.loads(src('tools-components.json')),ensure_ascii=False,separators=(',', ':'))+';\n' if f=='tools-art3d.js' else 'globalThis.NDAItemComponents='+json.dumps(json.loads(src('items-components.json')),ensure_ascii=False,separators=(',', ':'))+';\n' if f=='items-art3d.js' else 'globalThis.NDAFurnitureComponents='+json.dumps(json.loads(src('furniture-components.json')),ensure_ascii=False,separators=(',', ':'))+';\n' if f=='furniture-art3d.js' else '')+src(f) for f in game_files)).replace(
    '/*THREEURL*/', three).replace('/*ASSET*/', 'assets/')
out = os.path.join(root, 'juego', 'index.html')
open(out, 'w', encoding='utf-8').write(s)
print('ok', mode, len(s))
