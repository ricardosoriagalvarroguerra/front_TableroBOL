# Fuentes y procedencia de los datos · snapshot Bolivia al 17-nov-2026

Datos revisados contra fuentes **oficiales** (BCB, INE, MEFP, YPFB, ANH, FMI) y medios
reputados que las **citan**. La red de la sesión de actualización bloqueó la descarga directa
de los sitios oficiales (bcb.gob.bo, ine.gob.bo, imf.org, api.worldbank.org), así que las cifras
salen de fragmentos de búsqueda que citan la fuente oficial. **No se inventan ni interpolan
cifras:** lo que no se pudo corroborar queda como *s/d* o se omite, y se indica abajo.
Confianza: **alta** = varias fuentes coinciden o la nota oficial está indexada; **media** = una o
dos fuentes; **baja** = indirecta o en conflicto.

## Fuentes automáticas (ingesta del backend, cada 6 h)

Desde la v0.9.1 el backend (Back_TableroBOL, `src/ingest/`) actualiza solo estos datos; el seed
de este repo es el punto de partida y el respaldo embebido.

| Dato | Fuente primaria | Frecuencia de la fuente |
|---|---|---|
| Dólar oficial (TCO) | [BCB · última cotización](https://www.bcb.gob.bo/bcb_tco_publico_ultima_cotizacion.php) | diaria |
| Dólar paralelo | Binance P2P, USDT/BOB (mediana de los 10 primeros avisos) | continua |
| Brecha | derivada: paralelo ÷ TCO − 1 | diaria |
| IPC a 12 meses y mensual | [INE · IPC base 2016, cuadro por división](https://www.ine.gob.bo/index.php/nacional/) | mensual (≈5 de cada mes) |
| Exportaciones, importaciones, balanza, export. de gas | INE · cuadros mensuales de exportaciones e importaciones | mensual (≈fin de mes, con 1 mes de rezago) |
| EMBI Bolivia | JP Morgan vía la [serie histórica del BCRD](https://cdn.bancentral.gov.do/documents/entorno-internacional/documents/Serie_Historica_Spread_del_EMBI.xlsx) | diaria (hábil) |
| Oro, plata, soya, Henry Hub | futuros COMEX/CBOT/NYMEX vía Yahoo Finance | diaria |
| Estaño, zinc | LME cash-settlement vía Westmetall | diaria (hábil) |
| Noticias | Google News RSS (búsquedas sobre Bolivia), ABC y eju.tv | continua |
| Comparador regional | FMI, WEO (API DataMapper) | semestral (abr/oct) |

**Siguen curados a mano:** RIN, deuda, fiscal, PIB trimestral, gas (producción), bloqueos (ABC),
calificaciones, bonos, agenda y la capa analítica. La ABC no es accesible desde fuera de Bolivia
(captcha) y YPFB no publica la producción en formato de datos.

## Actualización al 17-nov-2026

### Indicadores (tira superior)

| Indicador | Valor | Corte | Fuente | Confianza |
|---|---|---|---|---|
| Dólar oficial (TCO) | Bs 11,67 | 14–16 nov | BCB (tabla TCO) vía Red Uno, bolivia.com | Alta |
| · trayectoria | 9,73 (29-jun) → 12,15 (3-ago) → **12,64 máx. (9-sep)** → **9,83 mín. (17-sep)** → 12,00 (1-oct) → 12,09 (1-nov) → 11,67 | jun–nov | BCB, Correo del Sur, Opinión, Red Uno | Alta/Media |
| Régimen | RD 142/2026 (24-sep) elimina el tope de venta TCO + Bs 0,10; venta bancaria libre | 24-sep | BCB vía ABI, Visión 360 | Alta |
| Dólar paralelo | Bs 11,84 / **11,95** (compra/venta) | 16 nov | dolarboliviahoy vía Red Uno | Media-alta |
| Brecha | +2,4% (venta paralelo ÷ TCO − 1) | 16 nov | derivado | — |
| IPC interanual | **7,08%** · mensual +2,07% · acum. 6,03% | oct-2026 (5-nov) | INE vía Red Uno, El Mundo, La Patria | Alta |
| · jul / ago / sep | 4,93% / 5,02% / 5,70% i/a (−2,79 / +1,10 / +0,85% m/m) | | INE (notas de prensa) | Alta |
| RIN | **USD 3.978 M** (oro 3.266 · divisas 647 · DEG 29 · FMI 35) | 16-oct | BCB vía Unitel, La Razón | Alta (total) / Media (oro) |
| · puntos | 3.617 (30-jun) · 3.632 (31-jul) · 3.933 (30-sep; líquidas 474) | | BCB vía ABI, EFE, Opinión | Alta |
| Cobertura de importaciones | 4,4 meses (RIN ÷ import. prom. ene–sep USD 902 M); divisas ≈ 0,7 m | 16-oct | derivado | — |
| EMBI | **494 pb** (2-nov); 424 jun · 428 jul · 396 ago · 483 sep · 502 oct | | JP Morgan vía Bloomberg Línea; MEFP (13-ago: 407) | Media-alta (sep: una fuente) |
| PIB real | **−3,27% acumulado 1S-2026**; 2T **−5,94%** i/a; 1T −0,31% | 30-oct | INE | Alta (1T: media) |
| Exportaciones | **USD 10.350 M** ene–sep (+54,4% a/a) | 31-oct | INE vía La Razón, Unitel | Alta |
| Balanza comercial | sep +183,4 M (X 1.304,7 · M 1.121,2); jun +184,7 · jul +176,0 · ago +360,3; ene–sep +2.236,5 | | INE | Alta (los acumulados y mensuales difieren levemente por revisiones) |
| Deuda externa pública | **USD 14.117,2 M · 26,1% del PIB** (jun 14.357,7 · 26,5%) | 30-sep | BCB vía El Deber, Infobae | Alta |
| Resultado fiscal | −12,2% PIB (2025); meta 2026 −9,2%; ene–may 2026 +0,2% | | MEFP vía Correo del Sur | Alta / Media |
| PGE 2027 | déficit −6,7%, inflación 10,4%, TC ~Bs 12, sin financiamiento BCB, Bs 11.000 M para subsidios | 30-oct | Visión 360, Red Uno, El Deber | Alta |
| Producción de gas | 27,34 MMm³/d (dic-2025) **sin dato 2026**; YPFB proyecta 26,6 | | YPFB | Media |
| Export. de gas | USD 831,8 M ene–sep (−2,2% a/a) | oct | INE vía Red Uno, El Deber | Media-alta |
| Cuenta corriente | 2025 −USD 1.218 M (~−2,1% PIB); 1S-2026 +USD 1.376 M | | BCB | Media |
| Remesas | USD 752,6 M ene–ago (−71 M a/a) | 6-oct | BCB vía ABI, Infobae | Alta |
| Salario mínimo | Bs 3.300 (sin cambio a mitad de año); COB pide Bs 7.000 para 2027 | | DS 5516; prensa | Alta |
| Pobreza moderada | 44,7% (2025) desde 38,1% (2024); extrema 16,7% | | INE vía El País, El Diario | Media |

**No re-verificado:** gas mensual de 2026, IGAE, ejecución fiscal posterior a mayo, cuenta
corriente 2T, remesas posteriores a agosto, deuda pública total consolidada (por eso *s/d*).

### Mercados, FMI y multilaterales

| Dato | Valor | Fecha | Fuente | Confianza |
|---|---|---|---|---|
| Moody's | **Caa2, positiva** (sube desde Caa3) | ~30-sep-2026 | Visión 360, Unitel, ABI | Alta |
| S&P | CCC+, estable (sin acción nueva desde mar-2026) | | | Media (ausencia de evidencia) |
| Fitch | CCC (informe del 24-ago ratifica) | | Visión 360 | Media |
| Bonos 2028 / 2031 | **sin cotización pública corroborada desde junio**: se muestran 94,88 / 96,6 como último dato verificado | | Investing / Bloomberg Línea (jun) | — |
| FMI | EFF de 36 meses aprobado el **2-oct** (DEG 1.369 M ≈ USD 1.900 M); desembolso de **USD 211,3 M** recibido el 6-oct; 1ª revisión en diciembre | | FMI PR 26/317; BCB | Alta |
| BID | USD 750 M (5-nov) · Banco Mundial USD 500 M (12-nov) · CAF USD 224 M (pendiente de la Asamblea) | | ABI, La Razón, El Deber | Alta |
| Combustibles | Diésel **Bs 17,95** a paridad de importación (DS 5716, 19-sep); especial 6,96 y premium 11,00 siguen subsidiadas; fin del subsidio a la gasolina el 12-ene-2027 anunciado por YPFB y **negado** por Hidrocarburos | | ANH; prensa | Alta / disputado |
| Commodities | oro 3.865,75 (−6,6% m/m) · plata 47,20 · zinc 3.702,85 · estaño 46.174 (LME 3M) · Henry Hub 3,24 · soya 12,29 | 13–17 nov | Trading Economics, Kitco, SMM, CBOT | Alta/Media (variaciones no publicadas → s/d) |

### Conflictividad, noticias y agenda

- **Bloqueos:** no hay conteo ABC publicado después del 24-jun (0 puntos). No se registró una ola
  nacional desde entonces; los focos (diésel 1–2 sep y 19–21 sep, magisterio 9–10 nov, Chapare
  11–12 nov, paro de camioneros chilenos 10–13 nov, ampliado de la COB 18-nov) salen de prensa.
  La lista georreferenciada del mapa es la ola de mayo–junio y se guarda como `levantado`.
- **Noticias:** 21 titulares reales del 19-sep al 16-nov, cada uno con enlace a la nota cuando
  estaba disponible (Al Jazeera, Infobae, Correo del Sur, La Razón, Visión 360, El Deber, Unitel, FMI…).
- **Agenda:** sólo hitos corroborados; las fechas de publicación del INE y el segundo desembolso
  del FMI son **estimadas** a partir del patrón de publicación y se marcan «estim.».

## Series históricas 2015→hoy (pestaña Histórico)

Serie anual por indicador en `src/data/historico.ts` → tabla `indicador_historico`. Valor de fin
de año (o anual) más el dato vigente como «2026*». **Los años sin dato verificado se omiten.**
Desde el 17-nov-2026 la red de la sesión permite descargar las fuentes primarias, así que PIB,
IPC y comercio exterior salen directamente de los cuadros del INE.

| Serie | Años | Definición | Fuente | Confianza |
|---|---|---|---|---|
| Dólar oficial | 2015–2025 + 2026* | venta, fin de año (fijo 6,96 hasta jun-2026) | BCB | Alta |
| Inflación | 2015–2025 + 2026* | dic/dic (2026* = oct i/a) | INE; coincide con el IPC de fin de período del FMI (WEO oct-2026, `PCPIEPCH`) | Alta |
| PIB real | 2015–2025 + 2026* (1S) | var. anual a precios de 1990, calculada del cuadro 6.01.01 (2017–2024 preliminares); 2025 nota INE | [INE · serie histórica del PIB](https://www.ine.gob.bo/index.php/estadisticas-economicas/pib-y-cuentas-nacionales/producto-interno-bruto-anual/serie-historica-del-producto-interno-bruto/) | Alta |
| Exportaciones | 2015–2025 + 2026* (ene–sep) | USD M FOB (2024–2025 preliminares) | [INE · cuadros de exportaciones](https://www.ine.gob.bo/index.php/estadisticas-economicas/comercio-exterior/cuadros-estadisticos-exportaciones/) | Alta |
| Balanza comercial | 2015–2025 + 2026* | export. FOB − import. CIF, USD M | INE (exportaciones e [importaciones](https://www.ine.gob.bo/index.php/estadisticas-economicas/comercio-exterior/importaciones-cuadros-estadisticos/)) | Alta |
| RIN | 2015–2025 + 2026* | USD M, fin de año | BCB vía Los Tiempos, EFE | Alta |
| Resultado fiscal SPNF | 2015–2025 | % PIB. **2016 corregido a −6,6%** (BCB y FMI Art. IV); 2020–2022 de la investigación previa | MEFP, BCB | Alta 2023–25, media resto |
| Deuda pública total | 2015–2025 | deuda bruta del gobierno general, % PIB (2025 estimado) | FMI, WEO oct-2026 (`GGXWDG_NGDP`) | Alta (cobertura FMI, no SPNF) |
| Deuda externa pública | 2016–2017, 2020–2025 + 2026* | % PIB (la razón depende del PIB que use el BCB) | BCB DEPEX | Media-alta |
| Desempleo urbano | 2015–2025 + 2026* (2T) | % promedio anual | INE (ECE) vía FMI WEO (`LUR`); 2T-2026 INE vía prensa | Alta / Media (2026) |
| Gas natural | 2015–2025 | MMm³/d; mezcla producción bruta y fiscalizada según el año | YPFB, UDAPE | Media/baja |
| Salario mínimo | 2015–2025 + 2026* | Bs/mes (2018–2021 fuente secundaria) | decretos supremos | Alta/Media |
| Cuenta corriente | 2015–2019, 2021–2025 | % PIB (serie revisada del BCB) | BCB | Alta 2021–24, media resto |
| Pobreza moderada | 2016–2025 | % (metodología INE 2020, base 2016; **no empalmar** con la serie anterior) | INE vía Jubileo, El País | Media |
| EMBI | 2015–2025 + 2026* | pb, último día hábil del año | JP Morgan vía la serie del BCRD (coincide con los cierres 2022–2025 citados por prensa) | Alta |
| Calificaciones | 2015–2025 + 2026* | rating vigente a fin de año | S&P: [Trading Economics](https://tradingeconomics.com/bolivia/rating); Moody's y Fitch: [countryeconomy.com](https://countryeconomy.com/ratings/bolivia), contrastado con las acciones de 2023–2026 de prensa | Alta (S&P) / Media (Moody's, Fitch) |

**Correcciones respecto de la versión anterior:** exportaciones 2016/2022/2024 y saldo comercial
2015–2025 reemplazados por los cuadros del INE (la versión previa venía de IBCE preliminar y
tenía 2024 confundido con 2015); PIB 2017–2020 e IPC 2015–2017/2021–2022 completados.

**Pendientes:** Fitch 2024 (countryeconomy no
registra acciones después de mar-2023), cuenta corriente 2020, deuda externa 2015/2018/2019 y
2022, resultado fiscal 2020–2022 contra la fuente MEFP. El Banco Mundial (api.worldbank.org) no
respondió desde la sesión.

---

# Historial · snapshot de jun–jul 2026

## Fuentes y procedencia de los datos · snapshot Bolivia ~20 jun 2026

> **Actualización al 20-jun-2026** (investigación en 3 frentes): paralelo 9,96 / brecha
> 43,1% (feed diario paralelo.bo); VRD 9,92 (tocó récord >Bs 10 y cedió); **EMBI 576→444**
> (semana al 19-jun, bonos en recuperación); bloqueos ABC **68→46** (19-jun); **acuerdo
> Gobierno–COB de 8 ejes (19-jun)** que levanta gran parte, con holdouts (Túpac Katari /
> Chapare) y **estado de excepción (Ley 1740) el 20-jun**; FMI + unificación cambiaria
> "cerca" (Bloomberg, ~USD 3.000 M). IPC/PIB/RIN/fiscal/gas/salario sin republicación en
> la semana (IPC junio sale en julio).

Datos revisados contra fuentes **oficiales/primarias** (BCB, INE, MEFP, YPFB, ABC)
y, cuando no había primaria accesible, medios reputados que **citan la fuente
oficial**. Cada dato no verificable se marca **NO CORROBORADO** (no se inventan
ni estiman cifras). Verificación cruzada realizada el 14-jun-2026.

> **Coyuntura:** crisis política y bloqueos desde el 1-may-2026 (rechazo al fin
> de la subvención de combustibles; pedido de renuncia del presidente
> **Rodrigo Paz**, en funciones desde el 8-nov-2025). Negociación de un programa
> con el **FMI**. Los indicadores de mercado son muy volátiles.

## Módulo A — Indicadores macro

| Indicador | Valor (en el tablero) | As of | Fuente | Tipo | Confianza |
|---|---|---|---|---|---|
| USD/BOB oficial | 6,96 (venta) | vigente (desde 2011) | BCB | Oficial | Alta |
| · Valor Referencial del Dólar (VRD) | ~9,40 venta | 4-jun-2026 | BCB (vía Infobae) | Oficial (citada) | Media-alta |
| USD/BOB paralelo | ~9,91 | 11-jun-2026 | paralelo.bo / dolarbolivia.net | Mercado informal | Media |
| RIN (BCB) | 3.542,9 M USD · ~95% oro | mar-2026 | [BCB · Informe RIN 1T-2026 (PDF)](https://www.bcb.gob.bo/) | Oficial (primaria) | Alta |
| · corte posterior (no usado de titular) | 4.694 M USD | 15-may-2026 | BCB (vía Unitel) | Oficial (citada) | Media-alta |
| IPC interanual / mensual / acum. | 12,51% / 2,13% / 2,62% | may-2026 | [INE](https://www.ine.gob.bo/) | Oficial | Alta |
| PIB real | −1,58% (2025); 4T −1,14% | 2025 | [INE](https://www.ine.gob.bo/) | Oficial | Alta |
| · proyección 2026 | −3,3% | proy. | FMI (vía prensa) | Estimación | Media |
| Déficit fiscal SPNF | −12,2% del PIB | cierre 2025 | MEFP/TGN (vía Visión360, eju.tv) | Oficial (citada) | Media-alta |
| Gas natural | 29,06 mm³/d | **jul-2025** | YPFB (vía CBHE) | Oficial (citada) | Media |
| · proyección 2026 | ~31,4 mm³/d | proy. | YPFB · RPC Inicial 2026 | Oficial (proyección) | Baja |

**Caveat gas:** no existe una cifra **mensual oficial de 2026 corroborada**; se usa
el último dato firme (jul-2025) y se rotula como tal. El ~31,4 es proyección, no
medición.

## Módulo C — Mercados

| Dato | Valor | As of | Fuente | Confianza |
|---|---|---|---|---|
| Bono 2028 (4,5%) — precio / yield | 94,88 / ~7,68% | 12-jun-2026 | Investing.com | Alta / Media-alta |
| Bono 2030 (7,5%) — cotización jun-2026 | **NO CORROBORADO** (sin cotización en vivo) | — | — | — |
| Bono 2031 (9,45%) — nueva emisión | USD 1.000 M, yield emisión 9,75% | 7-may-2026 | Los Tiempos · cbonds | Alta |
| Bono 2031 — secundario | ~96,6 / ~10,3% | 22-may-2026 | Bloomberg Línea (IIF) | Media-alta |
| EMBI Bolivia | 576 pb (rango may 408–639) | cierre may-2026 | Bloomberg Línea | Alta |
| EMBI — valor puntual junio | **NO CORROBORADO** | — | — | — |
| CDS 5Y | **sin mercado público líquido** (s/d) | — | — | Alta (sobre la inexistencia) |
| Rating Moody's | Caa3 · positivo (subió desde Ca) | 19-mar-2026 | Bloomberg · Reuters | Alta |
| Rating S&P | CCC+ · estable (doble subida desde CCC−) | 23-mar-2026 | Bloomberg · menafn | Alta |
| Rating Fitch | CCC · **sin outlook** (subió desde CCC−) | 16-ene-2026 | Bloomberg · BondbloX | Alta |
| Acción de rating tras la crisis de mayo | **NO CORROBORADO** (sin nueva acción) | — | — | — |
| Composición RIN | oro 95% / divisas 4% / DEG 1% | mar-2026 | BCB | Alta |

## Módulo B — Bloqueos (ABC) × mapa electoral

**Conteo real ABC** (transitabilidad RVF), serie de junio 2026: 78 (6-jun) → **93
(8-jun, pico)** → 79 (9) → 77 (13) → **68 (14-jun)** → 52 (15, en descenso). Un
corte intermedio de "85" se descartó por inconsistencia (verificación adversarial).
Conflicto desde el **1-may-2026**; demanda central: renuncia de Paz.

El mapa muestra una **muestra georreferenciada de 22 puntos reales** (coordenadas
**aproximadas** de la localidad/tramo — la ABC no publica lat/lon por punto), con la
concentración real en el occidente andino + Chapare: Cochabamba (trópico, Sacaba,
Confital, valles), La Paz (Desaguadero, Patacamaya, El Alto, Tiwanaku), Oruro
(Caracollo, Challapata), Potosí, Chuquisaca (Tarabuco) y Santa Cruz (puente Ichilo,
San Julián). Sectores: **Seis Federaciones del Trópico (cocaleros), COB,
Confederación Túpac Katari, mineros y afines a Evo Morales**.

### Cruce con elecciones (coropleta + puntos en el mapa)

- **Presidencial 2025** — cómputo oficial **OEP** (1ª vuelta 17-ago, balotaje 19-oct),
  verificado de forma **adversarial** (doble pasada + tercera fuente; el ganador del
  balotaje por departamento quedó triple-confirmado). Nacional balotaje **Paz 54,96 /
  Quiroga 45,04**. Paz ganó 6 deptos (La Paz, Cochabamba, Oruro, Potosí, Chuquisaca,
  Pando); Quiroga 3 (Santa Cruz, Tarija, Beni). 1ª vuelta nacional: Paz 32,06 ·
  Quiroga 26,70 · Doria Medina 19,69 · Andrónico Rodríguez 8,51. Fuentes: Wikipedia
  EN/ES (cómputo OEP), Bloomberg Línea (tabla por dpto.), Chequeado, El Comercio.
- **Subnacionales 2026** — 1ª vuelta **22-mar-2026** (autoridades asumieron en mayo).
  Las 9 capitales las ganaron **partidos regionales** (ni MAS ni PDC): La Paz IH,
  Cochabamba y Santa Cruz APB-Súmate, Oruro NGP, Potosí MTS, Sucre AGN, Tarija APT,
  Trinidad APU, Cobija Libre Pando. *Confianza alta salvo Sucre (media); fuente única,
  no sometida a la verificación triple de la presidencial.*
- **Lectura honesta del cruce:** el voto afín al MAS se **desplomó** en 2025
  (Andrónico 8,5%, sin ganar ningún departamento), así que **no hay un bastión
  electoral del MAS** que calce con los bloqueos. La concentración cae sobre el
  **altiplano y el Chapare, donde Paz GANÓ el balotaje**: **20 de 22** puntos (91%)
  están en departamentos pro-Paz. Es decir, su propia base territorial andina
  (anti-Quiroga, históricamente evista) hoy exige su renuncia. El poder municipal
  local está fragmentado en partidos regionales; el conflicto es **corporativo**
  (sindical/cocalero), no de las alcaldías.

### Scatter de localidades (capa "Localidades '25")

Carga de detalle: el **acta por mesa** de la 1ª vuelta del OEP
(`Elecciones_Generales_BOL1era.xlsx`, **34.026 mesas**) agregada a **3.730
localidades**. Por localidad se calcula el **partido ganador** y los votos válidos, y
se grafica un punto coloreado por partido — AP celeste · LYP-AND negro · APB-Súmate
morado · LIBRE rojo · FP plomo · MAS-IPSP azul · MORENA naranja · UNIDAD amarillo ·
PDC verde (se ignoran Votos0/Voto11/Voto12) — con tamaño ∝ votos. **Validación:** los
totales nacionales reproducen el resultado oficial (PDC 32,15% · LIBRE 26,68% · UNIDAD
19,85% · AP 8,39% · APB 6,64% · MAS 3,19% · FP 1,65% · LYP-AND 1,46% · MORENA 0%) y los
ganadores por departamento coinciden con la 1ª vuelta/balotaje ya cargados.

**Geolocalización (aproximada):** las actas del OEP no traen coordenadas; se
geocodificó por nombre de localidad contra el gazetteer **GeoNames Bolivia** (CC-BY,
~25.800 lugares poblados), desambiguando por cercanía al centroide del departamento,
con fallback a municipio → centroide de localidades hermanas → provincia/departamento
+ jitter determinista. Cobertura: **98,4%** a nivel localidad/municipio, **1,6%**
aproximado (centroide de provincia/depto). Es **ubicación aproximada del lugar
nombrado**, no GPS del recinto. Reproducible con `scripts/geocode-localidades.py`, que emite **4 niveles de
granularidad** (`src/data/localidades/{dept,prov,muni,loc}.ts` — 9/112/343/3.730
puntos; agregados por centroide ponderado por votos) con **carga perezosa** por nivel
(`src/data/localidadesLoader.ts`, `import()` dinámico → code-splitting), y la tabla
BDR `eleccion_localidad` (fuente `db/localidades2025.json`).

**NO CORROBORADO / caveats:** coordenadas por punto = aproximación de la localidad
(no GPS del corte exacto); total real ~68 al 14-jun (no 85); los % de 1ª vuelta por
departamento descansan en el cómputo OEP (vía Wikipedia ES) con corroboración de
tercera fuente sólo en algunos casos. Datos generados por investigación de 4 agentes
+ reconciliación adversarial → `src/data/elecciones.ts`, `src/data/mockData.ts`
(`BLOQUEOS`), tabla BDR `elecciones_departamento`.

## Módulo D — Noticias

Titulares reales con medio/fecha/URL (Los Tiempos, Opinión, ABI, Unitel, Infobae,
Bloomberg Línea, El Deber, La Razón, Bloomberg, INE) de may–jun 2026 — cada
noticia abre su **enlace real** (8 al artículo exacto; 4 al sitio del medio).

## Módulo E — Calendario (hitos reales, ventana 14-jun → 14-jul 2026)

Tras revisar la agenda económica y política, en esta ventana hay **pocos hitos
duros datables**. Solo se incluyen los corroborados:

| d | Hito | As of | Fuente | Confianza |
|---|---|---|---|---|
| +1 (15-jun) | Huelga general indefinida · COB | declarada 13-jun | [Opinión](https://www.opinion.com.bo/) | Alta (hecho); duración indeterminada |
| +3 (17-jun) | Evaluación de combustibles · DS 5516 | 17-jun | [eju.tv](https://eju.tv/) · Opinión | Alta (el Gobierno descartó alza) |
| +18 (~2-jul) | IPC junio 2026 · INE | ~1–3 jul | [INE](https://www.ine.gob.bo/) | Media (por patrón: abr→6-may, may→3-jun) |

**Categorías SIN hito datable en la ventana (excluidas, NO CORROBORADO):**
cupones de bonos soberanos (próximos en sep/nov 2026), FMI (sin fecha de
directorio/misión), ciclo electoral (cerrado el 4-may-2026), Expocruz/CAINCO
(septiembre). La interpelación al Min. de Gobierno es probable pero sin fecha
confirmada. Se eliminaron los eventos genéricos anteriores que no eran datables.

## Indicadores Tier 1 añadidos (fuentes oficiales)

| Indicador | Valor | As of | Fuente | Confianza |
|---|---|---|---|---|
| VRD · BCB (venta) | Bs 10,07 | 12-jun-2026 | BCB (sitio) | Alta |
| Brecha cambiaria | 42,4% (paralelo/oficial) | 11-jun-2026 | derivado | Alta |
| Deuda externa pública | USD 13.429,8 M · 24,3% PIB | mar-2026 | [BCB · DEPEX](https://www.bcb.gob.bo/) | Alta |
| Deuda pública total | ~45,1% PIB | 2024 (últ. consolidado) | MEFP | Media |
| Balanza comercial | X 1.105 / M 997 / saldo +108 M | abril 2026 | [INE](https://www.ine.gob.bo/) | Alta |
| Servicio de deuda | 2026 1.714 · 2027 1.670 · 2028 1.945 M | perfil vigente | BCB/MEFP (vía prensa) | Media-alta |
| Combustibles (Bs/L) | especial 6,96 · premium 11,00 · diésel 9,80 | DS 5516 (13-ene-2026) | [Gaceta · DS 5516](https://www.anh.gob.bo/) | Alta |
| Salario mínimo | Bs 3.300 (+20%) | ene-2026 | Min. Trabajo · RM 088/26 | Alta |

## Commodities (al 12-jun-2026, Trading Economics)

Oro 4.222 USD/oz (−9,9% mes) · Plata 67,76 · Zinc 3.578 USD/t (+0,5%) · Estaño
52.848 · Gas Henry Hub 3,12 USD/MMBtu · Soya 11,14 USD/bushel. Confianza alta
(TE como primaria; corroboración parcial cruzada en oro/plata/zinc).

## Series históricas profundas (modal de cada métrica)

Cada métrica clickeable (KPI macro, EMBI, bono, commodity) abre un modal con su
**serie histórica real y fechada**, a la profundidad que corresponde a su cadencia
de publicación. Datos volcados a la BDR y al bundle (`src/data/series.ts`) por el
generador [`scripts/build-series.mjs`](../scripts/build-series.mjs). Verificación
en 4 frentes paralelos contra fuentes oficiales/primarias (jun-2026).

| Cadencia | Profundidad | Series (nº de obs reales) |
|---|---|---|
| Diaria | ~1 año | USD oficial (366) · USD paralelo (678) · brecha (678) · VRD (9) |
| Mensual | ~3 años | IPC (35) · commodities ×6 (66 c/u) · saldo balanza (23) |
| Trimestral/anual | ~5 años | PIB (5) · fiscal (11) · RIN (9) · deuda externa (6) · gas (13) · salario (17) · EMBI (19) · bonos |

Procedencia por serie (todas verificadas; sin inventar ni interpolar):

- **USD oficial** — BCB: **fijo en Bs 6,96 venta** (6,86 compra) desde nov-2011; el PDF oficial de cotizaciones 2026 lo confirma idéntico en las 111 jornadas. Serie diaria plana de 1 año.
- **USD paralelo / brecha** — feed abierto **paralelo.bo** (mediana diaria P2P, CC-BY-4.0, `…/api/v1/historical.json`): 678 días reales ago-2024→14-jun-2026 (pico de la mediana 16,6 el 15-may-2025; cierre ~9,9). Brecha = paralelo/6,96 − 1.
- **VRD** — BCB (cuenta oficial @BancoCentralBO + notas con cifras fechadas): lanzado 1-dic-2025; ~9,30 (dic) → 10,07 (12-jun-2026). **Corrección:** el ancla previa "9,40 el 4-jun" NO era el VRD (era el paralelo/digital); el VRD ya superaba Bs 10 a inicios de junio.
- **IPC interanual** — INE / tabla "Indicadores de Inflación" del BCB: 35 meses (jun-2023→may-2026). Ciclo completo: ~2% (2023) → 9,97% (dic-2024) → pico 24,86% (jul-2025) → 12,51% (may-2026). **Corrección:** feb-2026 = **17,41%** (IPC); el "19,73%" usado antes era el **IPM** (Índice de Precios al por Mayor), otro índice.
- **PIB real, var. anual** — INE (2023 vía La Razón citando INE/MEFP): 2021 +6,11 · 2022 +3,48 · 2023 +3,10 · 2024 +0,73 · 2025 −1,58. (El INE publica el trimestral en acumulado YTD, no por trimestre aislado; se usa la serie anual, que es limpia.)
- **RIN** — BCB (PDFs/comunicados primarios): 2021 4.752,5 · 2022 3.796 · 2023 1.709 · 2024 1.976 · abr-25 2.618 · ago-25 2.881 · sep-25 3.275 · dic-25 3.713,3 · mar-26 3.542,9.
- **Deuda externa pública (DEPEX)** — BCB (informes anuales/trimestrales): %PIB 2021 31,2 · 2022 30,0 · 2023 29,9 · 2024 28,4 · 2025 24,6 · mar-26 24,3 (stock 12.698→14.131→13.430 M USD).
- **Déficit fiscal SPNF** — MEFP (Informe Fiscal 2024, Cuadro 3b, serie 2015-2025): … 2024 −10,1 · 2025 −12,2.
- **Gas natural** — YPFB: promedios anuales 2015-2025 + cortes (jul-25 29,06). No hay serie mensual oficial 2026; el ~31,4 es proyección, no medición.
- **Salario mínimo** — Min. Trabajo / Gaceta (decretos públicos): escalera anual 2010→2026 (Bs 2.750 → 3.300 en ene-2026).
- **EMBI Bolivia** — JPMorgan vía Bloomberg Línea / Invenómica: 19 lecturas fechadas nov-2023→may-2026 (pico ~2.318 en 2024; colapso a 477-576 tras la elección de Paz). No hay feed diario público; se usan cierres/lecturas reales fechados.
- **Bonos BOL28 / BOL31** — Investing.com / cbonds / Bloomberg Línea (IIF). Mercado ilíquido sin feed diario largo; precios reales por evento. **Correcciones:** ISIN BOL28 = USP37878AC26; bookrunners del BOL31 = Deutsche Bank + Santander (no JPMorgan); emisión 7-may-2026 a 98,835 / yield 9,75%.
- **Commodities (oro, plata, zinc, estaño, gas HH, soya)** — Trading Economics: cierres mensuales 2021-2026 (66 c/u).

> Las observaciones en la BDR (`indicador_observaciones`, `indice_riesgo_observaciones`,
> `bono_cotizaciones`, `commodity_observaciones`) ahora usan **fechas reales** (ya no la
> grilla mensual aproximada anterior). Donde un feed diario real no existe (paralelo
> 2023, bonos, EMBI) se usan las lecturas reales fechadas disponibles, **sin rellenar
> ni interpolar**: la profundidad por cadencia se cumple con datos reales donde el dato
> existe a esa frecuencia.

## Revisión de economista senior (4k · 20-jun-2026)

Indicadores añadidos/reframeados para no comunicar señales engañosas. Nada inventado;
los derivados se calculan a partir de series ya corroboradas.

- **brecha_vrd** (KPI derivado) — paralelo (paralelo.bo) ÷ VRD (BCB) − 1, por fecha de cada
  observación del VRD; ≈ 0% a 20-jun → la unificación cambiaria de facto ya ocurrió. La
  brecha del 43% es sólo contra el oficial administrado (Bs 6,96), de acceso casi nulo.
- **cobertura_importaciones** (KPI derivado) — RIN (BCB, cortes trimestrales) ÷ importaciones
  mensuales (~USD 950 M, balanza INE/BCB) = ~3,7 meses; pero ~95% del RIN es oro → en
  divisas líquidas usables (~USD 142 M) es ~0,1 mes. Importaciones como promedio, no serie.
- **RIN reframe** — se mantiene el stock 3.542,9 M (BCB 1T-2026) pero se explicita que las
  divisas líquidas usables son ~USD 142 M (~4%); el resto es oro (≈23 t), parte en swaps.
- **gas corregido** — titular 29,06 (jul-2025) → **27,34 mm³/d (dic-2025)**, último punto real
  de la serie YPFB; antes el headline no coincidía con la serie.
- **IPC / PIB** — sólo se añadió contexto cualitativo corroborado: aportes de mayo por
  alimentos (carne/tomate/pollo, INE); desglose sectorial 2025 del PIB (INE: agro +6,7 /
  extractivas −4,3 / construcción −13,6 / financiero −3,5).
- **Externo · sector externo y monetario** — export. de gas 212,2 M (1T-2026, −28% a/a, YPFB/INE);
  cuenta corriente −1.218 M / −2,1% PIB (2025, BCB); remesas 1.153,7 M (ene-nov 2024, BCB);
  bolivianización 92% (abr-2025, ASFI/BCB); financiamiento monetario crédito neto BCB→SPNF
  +5.894 Bs MM vs +826 programado (ene-abr 2026, BCB); programa FMI EFF ~USD 3.000 M "en
  negociación" (Bloomberg/Unitel, **no aprobado** al 20-jun — NO CORROBORADO oficialmente).
- **Noticias** — 13 titulares 6-20 jun de fuentes con URL real (Infobae, El Deber, Al Jazeera,
  ABI, La Razón, Bloomberg Línea, economy.com.bo, paralelo.bo, El País Tarija, Unitel, INE).

## Limitaciones reconocidas

- Portales con captcha / muro de pago no accesibles directamente en este entorno:
  `transitabilidad.abc.gob.bo`, `cbonds.com`, `tradingeconomics`, terminales de
  las calificadoras. Sus datos se reproducen vía medios que los citan.
- **NO CORROBORADO** (no se inventó valor): cotización en vivo del bono 2030 a
  junio; EMBI puntual de junio; valor de CDS 5Y; cifra mensual oficial de gas 2026;
  tramos específicos de Oruro/Santa Cruz; 6º departamento con bloqueos.
- Para producción: conectar INE, BCB, ABC, YPFB y un proveedor de mercado
  (Investing.com/cbonds) que se actualizan con frecuencia.
