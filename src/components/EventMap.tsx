import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventMapProps {
  location: string;
  eventTitle?: string;
}

const createIcon = () => {
  return L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [map, center]);
  return null;
};

export const EventMap = ({ location, eventTitle }: EventMapProps) => {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      setIsLoading(true);
      const coords = await geocodeAddress(location);
      setCoordinates(coords);
      setIsLoading(false);
    };

    if (location) {
      fetchCoordinates();
    }
  }, [location]);

  const handleOpenInMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates[0]},${coordinates[1]}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coordinates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium mb-2">{location}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInMaps}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            center={coordinates}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={`${coordinates[0]}-${coordinates[1]}`}
          >
            <MapController center={coordinates} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coordinates} icon={createIcon()}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{eventTitle || 'Event Location'}</p>
                  <p className="text-sm text-muted-foreground">{location}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="space-y-2">
          <p className="font-medium">{location}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInMaps}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

