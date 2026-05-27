import { useEffect, useRef } from 'react';

interface Props {
  latitude: number;
  longitude: number;
  popupText?: string;
  zoom?: number;
  height?: number;
}

export default function MunicipalMap({
  latitude,
  longitude,
  popupText,
  zoom = 14,
  height = 360,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let cancelled = false;
    (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !ref.current) return;
      // Fix marker icons
      delete (L as any).Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      map = L.map(ref.current).setView([latitude, longitude], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      const m = L.marker([latitude, longitude]).addTo(map);
      if (popupText) m.bindPopup(popupText).openPopup();
    })();
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [latitude, longitude, zoom, popupText]);

  return <div ref={ref} style={{ height, width: '100%', borderRadius: 8 }} />;
}
