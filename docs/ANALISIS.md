# Revisión analítica — indicadores faltantes y arquitectura de la vista

Estado al 14-jun-2026. Análisis de (1) qué indicadores convendría sumar y
(2) si el panel de bloqueos debería ser una pestaña aparte para liberar espacio.

---

## 1. Inventario actual

| Módulo | Qué muestra |
|---|---|
| A · Indicadores | TC oficial, TC paralelo (+brecha), RIN, IPC, PIB, balance fiscal, gas → **7 KPIs** |
| B · Bloqueos | Mapa SVG + lista (ocupa ~50% del row principal) |
| C · Mercados | Bonos, EMBI, CDS (s/d), ratings, composición RIN |
| D · Noticias | Feed filtrable |
| E · Calendario | Línea de 30 días |
| F · Fuentes | Health-check |

**Lectura:** el tablero cubre bien lo monetario-cambiario, precios, actividad
agregada y deuda de mercado. Está **flojo en sector externo, fiscal detallado,
actividad real sectorial y precios desagregados** — justo lo más sensible en la
coyuntura actual (subvención de combustibles, FMI, dependencia del gas/oro).

---

## 2. Gap analysis — indicadores candidatos

Prioridad (P): **A**lta / **M**edia / **B**aja. Factibilidad (F): qué tan
corroborable es el dato HOY con fuente oficial (regla: no inventar).

### Cambiario y monetario
| Indicador | Fuente oficial | P | F |
|---|---|---|---|
| **VRD (Valor Referencial del Dólar)** | BCB (diario) | A | Alta (ya lo citamos) |
| **Brecha cambiaria** como KPI propio | derivado | A | Alta (ya calculado) |
| Bolivianización de depósitos/cartera | BCB | M | Media |
| Base monetaria / liquidez (M'3) | BCB | M | Media |
| Tasas de interés (TRE, activa/pasiva) | BCB / ASFI | M | Media |
| Mora bancaria / cartera del sistema | ASFI | M | Media |

### Sector externo
| Indicador | Fuente | P | F |
|---|---|---|---|
| **Balanza comercial** (X, M, saldo) | INE | A | Alta |
| **Exportaciones por producto** (gas, minerales, oro, soya) | INE / IBCE | A | Media |
| **Importación de combustibles** (volumen y costo) | YPFB / ANH | A | Media |
| **Deuda externa pública** (% PIB, stock) | BCB / MEFP | A | Media |
| **Servicio de deuda / próximos vencimientos** | MEFP | A | Media |
| Remesas | BCB | M | Media |
| Cuenta corriente (% PIB) | BCB | M | Media |

### Fiscal
| Indicador | Fuente | P | F |
|---|---|---|---|
| **Costo de la subvención a combustibles** | MEFP / YPFB | A | Media |
| Recaudación tributaria | SIN / MEFP | M | Media |
| Regalías e IDH hidrocarburos | MEFP | M | Media |
| Salario mínimo nacional (Bs 3.300) | Min. Trabajo | M | Alta |
| Deuda interna (TGN) | MEFP | M | Media |

### Actividad real / sectorial
| Indicador | Fuente | P | F |
|---|---|---|---|
| **IGAE / actividad mensual** (más fresco que el PIB trimestral) | INE | A | Media |
| **Exportación de gas a Brasil/Argentina** (volúmenes) | YPFB | A | Media |
| PIB por sector | INE | M | Media |
| Producción minera (zinc, plata, estaño, oro) | Min. Minería | M | Media |
| Empleo/desempleo urbano, informalidad | INE | M | Media |

### Mercados financieros
| Indicador | Fuente | P | F |
|---|---|---|---|
| **Precios de commodities de exportación** (oro, gas, zinc, soya, estaño) | mercados | A | Alta |
| Curva de rendimientos soberana (2028/2031) | construible | M | Media |
| Spread vs pares regionales (EMBI comparado) | JPMorgan | M | Media |
| Bolsa Boliviana de Valores | BBV | B | Media |

### Precios / social / político
| Indicador | Fuente | P | F |
|---|---|---|---|
| **Precio de combustibles** (gasolina/diésel) | ANH | A | Media |
| **Estado negociación FMI / desembolsos** | MEFP / FMI | A | Media |
| IPC por rubros (alimentos, transporte) | INE | M | Alta |
| Conflictividad social (conflictos/mes) | Fundación UNIR | M | Media |
| Calendario electoral subnacional 2026 | TSE | M | Alta |
| Aprobación presidencial | encuestadoras | B | Baja (no oficial) |

### Recomendación de priorización (lo que sumaría primero)
**Tier 1 — alto valor + corroborable (próxima tanda):**
1. VRD del BCB · 2. Brecha cambiaria (KPI propio) · 3. Deuda externa (% PIB) ·
4. Balanza comercial / saldo · 5. Costo de la subvención a combustibles ·
6. Precio de combustibles · 7. Servicio de deuda / vencimientos ·
8. Precios de commodities clave (oro, gas, zinc, soya).

> Cada uno requiere **traer el dato real de su fuente** antes de mostrarlo
> (manteniendo la regla de no inventar). Es trabajo de sourcing, no sólo de UI.

---

## 3. Arquitectura de la vista — ¿bloqueos en pestaña aparte?

### Diagnóstico de espacio
El mapa de bloqueos ocupa ~**50%** del row central (xl:col-span-6). Es de alto
valor visual pero "caro": esa mitad podría alojar 2 paneles más. A la vez, el
brief original pedía "todo en una sola vista" (estilo command center), así que
esconder señal por completo no es ideal.

### Opciones

**A) Bloqueos compacto + mapa en pestaña/modal** (bajo esfuerzo)
En la vista principal, un panel compacto: contador "68 activos · 5 dptos", barra
por departamento, top-5 y semáforo de severidad. El mapa grande se abre en una
pestaña dedicada o un modal casi a pantalla completa (mejor para explorar).
- ✓ Libera ~50% del row para 2 paneles nuevos (p.ej. "Sector externo" y "Deuda").
- ✓ El mapa gana espacio cuando se lo explora.
- ✗ El mapa deja de estar siempre visible (lo mitiga el resumen compacto).

**B) Pestañas a nivel dashboard** (Resumen | Bloqueos | Mercados | Externo | Fiscal)
- ✓ Escala a muchos indicadores sin saturar.
- ✗ Rompe la filosofía de vista única; más clics para comparar.

**C) Híbrido — *recomendado*** 
- **Tira de KPIs siempre visible** arriba (el "command bar"), ampliada a ~10–12
  indicadores en 2 filas o agrupada por categoría (cambiario / externo / fiscal).
- Debajo, **pestañas** para los paneles densos:
  `[Panorama]` (mercados + noticias + calendario) · `[Bloqueos]` (mapa grande +
  lista + filtros) · `[Externo & Deuda]` (balanza, deuda, commodities).
- **Footer F** siempre visible.
- ✓ Combina densidad + organización sin perder el carácter de command center.
- ✓ Permite crecer a 20+ indicadores sin romper el layout.

```
┌─────────────────────────────────────────────────────────────┐
│ Header · reloj · búsqueda                                    │
├─────────────────────────────────────────────────────────────┤
│ KPI strip (siempre visible) — 10–12 indicadores, 2 filas     │
├─────────────────────────────────────────────────────────────┤
│ [ Panorama ] [ Bloqueos ] [ Externo & Deuda ] [ Mercados ]   │  ← pestañas
│ ┌───────────────────────────────────────────────────────┐   │
│ │  contenido de la pestaña activa (usa todo el ancho)   │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ Footer F · fuentes (siempre visible)                         │
└─────────────────────────────────────────────────────────────┘
```

### Recomendación
- **Sí, mover el mapa de bloqueos a una pestaña** (Opción C, o como primer paso
  la Opción A). Es el panel que más espacio consume y el que mejor aprovecha una
  vista dedicada (mapa grande + filtros + lista ordenable).
- Conservar un **resumen compacto de bloqueos** en el Panorama (contador +
  barra por departamento) para no perder la señal de un vistazo.
- Ampliar la **tira de KPIs** a Tier 1 conforme se consiga el dato real.

---

## 4. Roadmap sugerido

| Fase | Qué | Esfuerzo |
|---|---|---|
| 1 | Reestructura híbrida (tabs) + bloqueos compacto en Panorama | UI, medio |
| 2 | Sumar Tier 1 (sourcing real + nuevas tablas/series en la BDR) | datos + UI |
| 3 | Sector externo/fiscal detallado (Tier 2) | datos + UI |
| 4 | Ingesta automática (pendiente por decisión del usuario) | backend |

> Nota: agregar indicadores implica extender la BDR (nuevas tablas/series) y el
> API, además del sourcing. El esquema actual (catálogo + series de tiempo) ya
> soporta sumar indicadores sin rediseño: basta nuevas filas en `indicadores` +
> `indicador_observaciones`, o nuevas tablas para series no-KPI (commodities,
> balanza, deuda).
