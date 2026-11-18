"""Arma juego/index.html a partir de src/. Uso: python3 src/build.py [prod|test]"""
import sys, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = lambda f: open(os.path.join(root, 'src', f), encoding='utf-8').read()
mode = sys.argv[1] if len(sys.argv) > 1 else 'prod'
three = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js' if mode == 'prod' else '/test/three.module.js'
s = src('shell2.html')
s = s.replace('/*LOGIC*/', src('logic2.js') + '\n' + src('net.js')).replace('/*GAME*/', src('chars3d.js') + '\n' + src('game3d.js')).replace('/*THREEURL*/', three).replace('/*ASSET*/', 'assets/')
out = os.path.join(root, 'juego', 'index.html')
open(out, 'w', encoding='utf-8').write(s)
print('ok', mode, len(s))
