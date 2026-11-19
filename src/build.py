"""Arma juego/index.html a partir de src/. Uso: python3 src/build.py [prod|test]"""
import sys, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = lambda f: open(os.path.join(root, 'src', f), encoding='utf-8').read()
mode = sys.argv[1] if len(sys.argv) > 1 else 'prod'
three = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js' if mode == 'prod' else '/test/three.module.js'
s = src('shell2.html')
logic_files = ['logic2.js', 'rules3.js', 'rules4.js', 'lab.js', 'net.js']
game_files = ['chars3d.js', 'alex-art.js', 'elenco-art.js', 'character-qc.js',
              'anima-art.js', 'house-art.js', 'game3d.js', 'casona3d.js',
              'base3d.js', 'snd3d.js', 'lab3d.js', 'casa3d.js']
s = s.replace('/*LOGIC*/', '\n'.join(src(f) for f in logic_files)).replace(
    '/*GAME*/', '\n'.join(src(f) for f in game_files)).replace(
    '/*THREEURL*/', three).replace('/*ASSET*/', 'assets/')
out = os.path.join(root, 'juego', 'index.html')
open(out, 'w', encoding='utf-8').write(s)
print('ok', mode, len(s))
