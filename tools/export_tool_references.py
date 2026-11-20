"""Package real workshop/game screenshots after test/tools-v17.py."""
import json,shutil,html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'arte/instrumentos-v17';CAP=ROOT.parent/'Instrumentos_v17'
data=json.loads((ROOT/'src/tools-components.json').read_text(encoding='utf8'))
names=['termo','uv','grab','cam','emf','espejo','gases']
for k in names:
 for suffix in ['normal','doubtful','positive','held']:
  shutil.copy2(CAP/f'{k}-{suffix}.png',OUT/f'{k}-{suffix}.png')
 shutil.copy2(CAP/f'juego-{k}.png',OUT/f'juego-{k}.png')
for n in ['taller.png','termo-front-2048.png','iphone12.png','iphone12-landscape.png']:
 shutil.copy2(CAP/n,OUT/n)
verification=json.loads((CAP/'verificacion.json').read_text(encoding='utf8'))
for key,file in [('browser','browser_validation.json'),('iphone12Emulated','iphone12_validation.json')]:verification[key]=json.loads((CAP/file).read_text(encoding='utf8'))
(OUT/'verificacion.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
style='''*{box-sizing:border-box}body{margin:0;background:#e8e1d4;color:#263431;font:15px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}h1{font:600 32px Georgia}h2{font:600 24px Georgia}a{color:#6b2030}nav{display:flex;gap:18px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}figure{margin:0;background:#f2ecdf}img{display:block;width:100%}figcaption{padding:10px}.models{grid-template-columns:repeat(4,minmax(0,1fr))}.crop{aspect-ratio:990/650;overflow:hidden;background:#a5aaa7}.crop img{width:100%;height:auto}section{padding:24px 0;border-bottom:1px solid #b7af9b}.note{color:#555f58;max-width:1000px}@media(max-width:750px){.models{grid-template-columns:repeat(2,minmax(0,1fr))}main{padding:14px}}'''
header='<nav><a href="./">Taller editable</a><a href="../../juego/">Jugar</a><a href="../../docs/instrumentos-v17.md">Especificación</a><a href="verificacion.json">Verificación</a></nav>'
modelcards=''.join(f'<figure><a href="{k}-positive.png"><div class="crop"><img src="{k}-positive.png" alt="{html.escape(data["tools"][k]["name"])}"></div></a><figcaption>{html.escape(data["tools"][k]["name"])}</figcaption></figure>'for k in names)
(OUT/'resumen.html').write_text('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Equipo de investigación · V17</title><style>'+style+'</style><main><small>NOCHE DE ÁNIMAS · INSTRUMENTOS V17</small><h1>Equipo de investigación</h1><p>Siete modelos compartidos con el juego · 88 piezas editables · materiales mates y formas facetadas</p><div class="grid models">'+modelcards+'<figure><figcaption><h2>Herramientas para observar</h2><p>Las pruebas se leen en cada aparato o en el entorno, según su función.</p><p>La UV revela marcas en superficies. La silueta de la cámara se consulta en la base.</p><a href="./">Abrir el taller 3D</a></figcaption></figure></div></main></html>',encoding='utf8')
sections=[]
for k in names:
 t=data['tools'][k];cards=''.join(f'<figure><a href="{k}-{suffix}.png"><img loading="lazy" src="{k}-{suffix}.png" alt="{html.escape(t["name"])} · {label}"></a><figcaption>{label}</figcaption></figure>'for suffix,label in [('normal','Normal'),('doubtful','Dudosa'),('positive','Positiva'),('held','Soporte plegado / configuración de mano')])
 sections.append(f'<section><h2>{html.escape(t["name"])}</h2><p class="note">{html.escape(t["usage"])} {html.escape(t["notes"])}</p><div class="grid">{cards}</div><p><a href="juego-{k}.png">Ver en primera persona dentro del juego</a></p></section>')
(OUT/'referencias.html').write_text('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Referencias de instrumentos V17</title><style>'+style+'</style><main><h1>Referencias de las siete herramientas</h1>'+header+'<p class="note">Capturas reales de las fábricas Three.js. Los estados del taller son ejemplos controlados. UV y cámara mantienen la misma lectura local porque sus pruebas se observan en superficies o en el monitor de la base. Puedes girar el modelo y exportar una vista ortográfica PNG 2048 desde el taller.</p><p><a href="resumen.html">Vista del conjunto</a> · <a href="termo-front-2048.png">Ejemplo de PNG 2048</a> · <a href="taller.png">Edición por piezas</a></p>'+''.join(sections)+'<section><h2>Paneles en móvil</h2><p>WebKit con perfiles de iPhone 12; no es una medición de FPS de un teléfono físico.</p><div class="grid"><a href="iphone12.png"><img src="iphone12.png" alt="iPhone 12 vertical"></a><a href="iphone12-landscape.png"><img src="iphone12-landscape.png" alt="iPhone 12 horizontal"></a></div></section></main></html>',encoding='utf8')
print('Packaged 7 tools, 21 states, hand/game views and validation reports.')
