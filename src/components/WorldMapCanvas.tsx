import React, { useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import countriesAtlas from 'world-atlas/countries-110m.json';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import type { Destination } from '../types/journal';

interface WorldMapCanvasProps {
  mode: 'explore' | 'picker';
  destinations?: Destination[];
  selectedDestinationId?: string | null;
  onSelectDestination?: (dest: Destination) => void;
  pickedCoords?: { lat: number; lng: number } | null;
  onPickCoords?: (coords: { lat: number; lng: number }) => void;
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 500;

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  mode,
  destinations = [],
  selectedDestinationId = null,
  onSelectDestination,
  pickedCoords = null,
  onPickCoords,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{
    pointerX: number;
    pointerY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const didDragRef = useRef(false);

  const { landPaths, graticulePath, projection } = useMemo(() => {
    const proj = geoNaturalEarth1().fitExtent(
      [
        [24, 20],
        [MAP_WIDTH - 24, MAP_HEIGHT - 20],
      ],
      { type: 'Sphere' }
    );
    const pathGen = geoPath(proj);
    const topology = countriesAtlas as unknown as Topology<{
      countries: GeometryCollection;
    }>;
    const countries = feature(topology, topology.objects.countries);

    return {
      projection: proj,
      graticulePath: pathGen(geoGraticule10()) ?? '',
      landPaths: countries.features.map((f, idx) => ({
        id: String(f.id ?? idx),
        d: pathGen(f) ?? '',
      })),
    };
  }, []);

  const toMapCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const svgX = ((clientX - rect.left) / rect.width) * MAP_WIDTH;
    const svgY = ((clientY - rect.top) / rect.height) * MAP_HEIGHT;
    const unzoomedX = (svgX - MAP_WIDTH / 2 - pan.x) / zoom + MAP_WIDTH / 2;
    const unzoomedY = (svgY - MAP_HEIGHT / 2 - pan.y) / zoom + MAP_HEIGHT / 2;
    return [unzoomedX, unzoomedY] as [number, number];
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).closest('[data-map-pin="true"]')) return;
    didDragRef.current = false;
    setDragOrigin({
      pointerX: e.clientX,
      pointerY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragOrigin) return;
    const dx = e.clientX - dragOrigin.pointerX;
    const dy = e.clientY - dragOrigin.pointerY;
    if (Math.hypot(dx, dy) > 4) {
      didDragRef.current = true;
    }
    const svg = svgRef.current;
    const scaleX = svg ? MAP_WIDTH / Math.max(svg.getBoundingClientRect().width, 1) : 1;
    const scaleY = svg ? MAP_HEIGHT / Math.max(svg.getBoundingClientRect().height, 1) : 1;
    setPan({
      x: dragOrigin.panX + dx * scaleX,
      y: dragOrigin.panY + dy * scaleY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (mode === 'picker' && !didDragRef.current && onPickCoords) {
      const point = toMapCoords(e.clientX, e.clientY);
      if (point && projection.invert) {
        const coords = projection.invert(point);
        if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
          onPickCoords({
            lng: Number(coords[0].toFixed(4)),
            lat: Number(coords[1].toFixed(4)),
          });
        }
      }
    }
    setDragOrigin(null);
  };

  const adjustZoom = (delta: number) => {
    setZoom((prev) => Math.min(5, Math.max(1, Number((prev + delta).toFixed(2)))));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const transformString = `translate(${MAP_WIDTH / 2 + pan.x}, ${MAP_HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-MAP_WIDTH / 2}, ${-MAP_HEIGHT / 2})`;

  const pinnedDestinations = destinations.filter(
    (d) =>
      typeof d.latitude === 'number' &&
      typeof d.longitude === 'number' &&
      Number.isFinite(d.latitude) &&
      Number.isFinite(d.longitude)
  );

  const pickedPoint =
    pickedCoords && Number.isFinite(pickedCoords.lat) && Number.isFinite(pickedCoords.lng)
      ? projection([pickedCoords.lng, pickedCoords.lat])
      : null;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        border: '2px solid var(--ink-faint)',
        backgroundColor: '#E8EFF2',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 36px rgb(101 87 76 / 0.14)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          insetBlockStart: '0.75rem',
          insetInlineEnd: '0.75rem',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <button
          type="button"
          className="btn-scrapbook btn-scrapbook--ghost"
          aria-label="Zoom in map"
          onClick={() => adjustZoom(0.5)}
          style={{
            minBlockSize: '36px',
            minInlineSize: '36px',
            padding: '0.35rem',
          }}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn-scrapbook btn-scrapbook--ghost"
          aria-label="Zoom out map"
          onClick={() => adjustZoom(-0.5)}
          style={{
            minBlockSize: '36px',
            minInlineSize: '36px',
            padding: '0.35rem',
          }}
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn-scrapbook btn-scrapbook--ghost"
          aria-label="Reset map view"
          onClick={resetView}
          style={{
            minBlockSize: '36px',
            minInlineSize: '36px',
            padding: '0.35rem',
          }}
        >
          <LocateFixed size={16} aria-hidden="true" />
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={
          mode === 'picker'
            ? 'Interactive world map to click and place a pin'
            : 'Interactive travel world map showing visited and wishlist pins'
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragOrigin(null)}
        style={{
          inlineSize: '100%',
          blockSize: 'auto',
          display: 'block',
          cursor: dragOrigin ? 'grabbing' : mode === 'picker' ? 'crosshair' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <defs>
          <radialGradient id="oceanPaper" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#F2F5F2" />
            <stop offset="100%" stopColor="#DDE8ED" />
          </radialGradient>
        </defs>

        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanPaper)" />

        <g transform={transformString}>
          <path
            d={graticulePath}
            fill="none"
            stroke="#B6C6CF"
            strokeWidth={0.75 / zoom}
            strokeDasharray="3 3"
          />

          <g>
            {landPaths.map((country) => (
              <path
                key={country.id}
                d={country.d}
                fill="#DCE6D5"
                stroke="#8E7E71"
                strokeWidth={0.65 / zoom}
              />
            ))}
          </g>

          {mode === 'explore' &&
            pinnedDestinations.map((dest) => {
              const projected = projection([dest.longitude!, dest.latitude!]);
              if (!projected) return null;
              const [cx, cy] = projected;
              const isSelected = dest.id === selectedDestinationId;
              const pinSize = (isSelected ? 11.5 : 8.5) / Math.sqrt(zoom);
              const pinFill = dest.isWishlist ? '#ECD07B' : '#DB9FA3';
              const strokeColor = '#362C25';

              return (
                <g
                  key={dest.id}
                  data-map-pin="true"
                  transform={`translate(${cx}, ${cy})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${dest.name}${dest.isWishlist ? ' (Wishlist)' : ' (Visited)'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDestination?.(dest);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDestination?.(dest);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={pinSize * 1.9}
                    fill="transparent"
                  />
                  {dest.isWishlist ? (
                    <path
                      d={`M 0 ${-pinSize * 1.35} L ${pinSize * 0.4} ${-pinSize * 0.4} L ${pinSize * 1.4} ${-pinSize * 0.4} L ${pinSize * 0.6} ${pinSize * 0.25} L ${pinSize * 0.9} ${pinSize * 1.2} L 0 ${pinSize * 0.65} L ${-pinSize * 0.9} ${pinSize * 1.2} L ${-pinSize * 0.6} ${pinSize * 0.25} L ${-pinSize * 1.4} ${-pinSize * 0.4} L ${-pinSize * 0.4} ${-pinSize * 0.4} Z`}
                      fill={pinFill}
                      stroke={strokeColor}
                      strokeWidth={1.6 / Math.sqrt(zoom)}
                      strokeLinejoin="round"
                    />
                  ) : (
                    <>
                      <path
                        d={`M 0 ${pinSize * 1.45} C ${-pinSize * 0.85} ${pinSize * 0.35}, ${-pinSize} ${-pinSize * 0.4}, 0 ${-pinSize * 1.15} C ${pinSize} ${-pinSize * 0.4}, ${pinSize * 0.85} ${pinSize * 0.35}, 0 ${pinSize * 1.45} Z`}
                        fill={pinFill}
                        stroke={strokeColor}
                        strokeWidth={1.6 / Math.sqrt(zoom)}
                        strokeLinejoin="round"
                      />
                      <circle
                        cx={0}
                        cy={-pinSize * 0.2}
                        r={pinSize * 0.32}
                        fill="#FFFDF8"
                        stroke={strokeColor}
                        strokeWidth={1.2 / Math.sqrt(zoom)}
                      />
                    </>
                  )}
                  {isSelected && (
                    <text
                      y={-pinSize * 1.75}
                      textAnchor="middle"
                      fill="#362C25"
                      fontFamily="Patrick Hand, cursive"
                      fontSize={14 / Math.sqrt(zoom)}
                      fontWeight="bold"
                      paintOrder="stroke"
                      stroke="#FFFDF8"
                      strokeWidth={3.5 / Math.sqrt(zoom)}
                    >
                      {dest.name}
                    </text>
                  )}
                </g>
              );
            })}

          {mode === 'picker' && pickedPoint && (
            <g
              transform={`translate(${pickedPoint[0]}, ${pickedPoint[1]})`}
              pointerEvents="none"
            >
              <circle
                r={11 / Math.sqrt(zoom)}
                fill="rgb(219 159 163 / 0.35)"
              />
              <path
                d={`M 0 ${11 / Math.sqrt(zoom)} C ${-7 / Math.sqrt(zoom)} ${2 / Math.sqrt(zoom)}, ${-8 / Math.sqrt(zoom)} ${-4 / Math.sqrt(zoom)}, 0 ${-10 / Math.sqrt(zoom)} C ${8 / Math.sqrt(zoom)} ${-4 / Math.sqrt(zoom)}, ${7 / Math.sqrt(zoom)} ${2 / Math.sqrt(zoom)}, 0 ${11 / Math.sqrt(zoom)} Z`}
                fill="#DB9FA3"
                stroke="#362C25"
                strokeWidth={1.5 / Math.sqrt(zoom)}
              />
              <circle
                cx={0}
                cy={-2 / Math.sqrt(zoom)}
                r={2.5 / Math.sqrt(zoom)}
                fill="#FFFDF8"
              />
            </g>
          )}
        </g>

        {/* Hand-drawn Cartographic Compass Rose in bottom-left */}
        <g transform="translate(52, 446)" opacity="0.78" pointerEvents="none">
          <circle cx="0" cy="0" r="24" fill="#FAF6EE" stroke="#86776A" strokeWidth="1.3" />
          <path d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4 Z" fill="#F6E2E2" stroke="#362C25" strokeWidth="1.2" />
          <text x="0" y="-27" textAnchor="middle" fontFamily="Courier Prime, monospace" fontSize="10" fill="#362C25">
            N
          </text>
        </g>
      </svg>
    </div>
  );
};

