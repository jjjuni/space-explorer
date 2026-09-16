import type { PlanetConfig } from "../constants/planets";

interface PlanetInfoProps {
  planet: PlanetConfig | null;
}

function PlanetInfo({ planet }: PlanetInfoProps) {
  if (!planet) {
    return null;
  }

  const representativeSatellite = planet.satellites?.[0]?.name;

  const remainingCount = Math.max(
    0,
    planet.moonCount - (representativeSatellite ? 1 : 0),
  );

  const satelliteText = representativeSatellite
    ? remainingCount > 0
      ? `${representativeSatellite} 외 ${remainingCount}개`
      : representativeSatellite
    : `${planet.moonCount}개`;

  return (
    <div className="pointer-events-none absolute right-6 top-1/2 z-10 w-72 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/40 p-5 text-white backdrop-blur-md">
      <div className="text-[10px] font-semibold tracking-[0.2em] text-white/40">
        PLANET
      </div>

      <h2 className="mt-1 text-2xl font-semibold">{planet.name}</h2>

      {planet.description && (
        <p className="mt-3 text-sm leading-6 text-white/60">
          {planet.description}
        </p>
      )}

      <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
        <div className="flex justify-between text-xs">
          <span className="text-white/40">DIAMETER</span>

          <span>{planet.diameter.toLocaleString()} km</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-white/40">SATELLITES</span>

          <span>{satelliteText}</span>
        </div>
      </div>
    </div>
  );
}

export default PlanetInfo;
