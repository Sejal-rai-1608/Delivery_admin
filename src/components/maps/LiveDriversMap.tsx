import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card } from '../ui/Card';
import { DriverLocation } from '../../store/socketStore';
import { Truck } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 19.0760, // Mumbai
  lng: 72.8777
};

interface LiveDriversMapProps {
  drivers: DriverLocation[];
}

export const LiveDriversMap: React.FC<LiveDriversMapProps> = ({ drivers }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);

  const onLoad = useCallback(function callback() {
    // Optional logic on load
  }, []);

  const onUnmount = useCallback(function callback() {
    // Optional logic on unmount
  }, []);

  const getMarkerIcon = (status: string) => {
    let color = '#ef4444'; // Red (offline)
    if (status === 'online') color = '#22c55e'; // Green
    if (status === 'on_delivery') color = '#eab308'; // Yellow

    return {
      path: 'M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759   c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z    M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713   v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336   h13.771l2.219,3.336H14.568z M31.332,35.805v-7.872l2.718-0.355v10.048L31.332,35.805z',
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#ffffff',
      scale: 0.7,
      anchor: new window.google.maps.Point(23, 47),
    };
  };

  return (
    <Card className="flex flex-col h-full relative overflow-hidden p-0 border-0 shadow-lg">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none flex justify-between items-start">
        <h3 className="text-lg font-bold text-white drop-shadow-md">Live Driver Tracking</h3>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs font-medium shadow-sm pointer-events-auto flex flex-col gap-1.5">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> On Delivery</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Offline</div>
        </div>
      </div>
      
      <div className="flex-1 w-full relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {drivers.map(driver => (
              <Marker
                key={driver.id}
                position={{ lat: driver.lat, lng: driver.lng }}
                icon={getMarkerIcon(driver.status)}
                onClick={() => setSelectedDriver(driver)}
              />
            ))}

            {selectedDriver && (
              <InfoWindow
                position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
                onCloseClick={() => setSelectedDriver(null)}
              >
                <div className="p-1 min-w-[150px]">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center">
                      <Truck className="w-3 h-3 text-[var(--color-brand-600)]" />
                    </div>
                    <p className="font-bold text-gray-900">{selectedDriver.name}</p>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 capitalize">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedDriver.status === 'online' ? 'bg-green-500' : 
                      selectedDriver.status === 'on_delivery' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    {selectedDriver.status.replace('_', ' ')}
                  </p>
                  {selectedDriver.status === 'on_delivery' && (
                    <p className="text-xs text-gray-500 mt-2">Current Order: #ORD-{Math.floor(Math.random() * 1000)}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-600)]"></div>
          </div>
        )}
      </div>
    </Card>
  );
};
