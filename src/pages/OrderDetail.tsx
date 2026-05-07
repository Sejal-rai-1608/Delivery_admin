import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../api/services/order.service';
import { driverService } from '../api/services/driver.service';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ReassignDriverModal } from '../components/modals/ReassignDriverModal';
import { RejectReasonModal } from '../components/modals/RejectReasonModal';
import { 
  ArrowLeft, MapPin, User, DollarSign, Clock, Navigation, 
  Truck, XCircle, CreditCard, Receipt
} from 'lucide-react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import toast from 'react-hot-toast';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reassignModal, setReassignModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id as string),
    enabled: !!id
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: driverService.getDrivers,
    enabled: !!order
  });

  const assignedDriver = useMemo(() => {
    return drivers.find(d => d.id === order?.driverId);
  }, [drivers, order]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string, status: any, reason?: string }) => 
      orderService.updateOrderStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setCancelModal(false);
      toast.success('Order status updated');
    }
  });

  const reassignMutation = useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string, driverId: string }) => 
      orderService.reassignDriver(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setReassignModal(false);
      toast.success('Driver assigned successfully');
    }
  });

  // Simulated Live Tracking
  const [liveDriverLoc, setLiveDriverLoc] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (order?.status === 'IN_TRANSIT' && order.pickupLocation && order.dropLocation) {
      // Initialize driver somewhere between pickup and dropoff
      let currentLat = (order.pickupLocation.lat + order.dropLocation.lat) / 2;
      let currentLng = (order.pickupLocation.lng + order.dropLocation.lng) / 2;
      setLiveDriverLoc({ lat: currentLat, lng: currentLng });

      const interval = setInterval(() => {
        setLiveDriverLoc(prev => {
          if (!prev) return prev;
          // Move slowly towards dropLocation
          const dLat = (order.dropLocation!.lat - prev.lat) * 0.1;
          const dLng = (order.dropLocation!.lng - prev.lng) * 0.1;
          
          return {
            lat: prev.lat + dLat + (Math.random() - 0.5) * 0.0005,
            lng: prev.lng + dLng + (Math.random() - 0.5) * 0.0005
          };
        });
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      setLiveDriverLoc(null);
    }
  }, [order]);

  const mapCenter = useMemo(() => {
    if (liveDriverLoc) return liveDriverLoc;
    if (order?.pickupLocation) return order.pickupLocation;
    return { lat: 40.7128, lng: -74.0060 }; // Default
  }, [liveDriverLoc, order]);

  if (isLoading || !order) return <LoadingSpinner fullScreen />;

  const canCancel = !['DELIVERED', 'CANCELLED'].includes(order.status);
  const canReassign = ['PENDING', 'ACCEPTED'].includes(order.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Order {order.id}</h1>
              <StatusBadge status={order.status} type="order" />
            </div>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {canCancel && (
            <button 
              onClick={() => setCancelModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
          {canReassign && (
            <button 
              onClick={() => setReassignModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Truck className="w-4 h-4" /> {order.driverId ? 'Reassign Driver' : 'Assign Driver'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Map & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Tracking Map */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[var(--color-brand-600)]" />
                  Live GPS Tracking
                </h3>
                {order.status === 'IN_TRANSIT' && (
                  <span className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Driver in transit
                  </span>
                )}
             </div>
             <div className="flex-1 relative">
                {!isLoaded ? (
                  <LoadingSpinner fullScreen />
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={13}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    {/* Pickup Marker */}
                    {order.pickupLocation && (
                      <Marker 
                        position={order.pickupLocation} 
                        icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#3b82f6', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' }}
                        title="Pickup Location"
                      />
                    )}
                    {/* Dropoff Marker */}
                    {order.dropLocation && (
                      <Marker 
                        position={order.dropLocation} 
                        icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#22c55e', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' }}
                        title="Dropoff Location"
                      />
                    )}
                    {/* Driver Live Marker */}
                    {liveDriverLoc && (
                      <Marker 
                        position={liveDriverLoc} 
                        icon={{ path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, fillColor: '#f97316', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff', rotation: 45 }}
                        title="Driver Location"
                      />
                    )}
                    {/* Route Line */}
                    {order.pickupLocation && order.dropLocation && (
                      <Polyline 
                        path={[order.pickupLocation, order.dropLocation]} 
                        options={{ strokeColor: '#9ca3af', strokeOpacity: 0.5, strokeWeight: 3 }} 
                      />
                    )}
                  </GoogleMap>
                )}
             </div>
          </div>

          {/* Delivery Timeline (Stepper) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
               <Clock className="w-5 h-5 text-[var(--color-brand-600)]" /> Delivery Timeline
             </h3>
             <div className="relative pl-4 space-y-6 before:absolute before:inset-y-2 before:left-[23px] before:w-0.5 before:bg-gray-100">
               {order.timeline.map((event, idx) => {
                 const isLast = idx === order.timeline.length - 1;
                 const isCompleted = order.status === 'DELIVERED';
                 const colorClass = 
                    event.status === 'DELIVERED' ? 'bg-green-500 ring-green-100' :
                    event.status === 'CANCELLED' ? 'bg-red-500 ring-red-100' :
                    isLast && !isCompleted ? 'bg-[var(--color-brand-500)] ring-[var(--color-brand-100)] animate-pulse' :
                    'bg-gray-300 ring-gray-50';

                 return (
                   <div key={idx} className="relative flex gap-6 z-10">
                     <div className="flex flex-col items-center">
                       <div className={`w-3.5 h-3.5 rounded-full ring-4 ${colorClass}`}></div>
                     </div>
                     <div className="-mt-1.5 pb-2">
                       <p className="font-semibold text-gray-900 capitalize">{event.status.replace('_', ' ')}</p>
                       <p className="text-xs text-gray-500 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                       {event.note && (
                         <div className="mt-2 text-sm p-3 bg-gray-50 rounded-xl text-gray-700 italic border border-gray-100">
                           {event.note}
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Info Cards */}
        <div className="space-y-6">
          
          {/* Pickup & Drop Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
               <MapPin className="w-5 h-5 text-[var(--color-brand-600)]" /> Locations
             </h3>
             <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Pickup Address</p>
                  <p className="text-gray-900 text-sm">{order.pickupAddress}</p>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Dropoff Address</p>
                  <p className="text-gray-900 text-sm">{order.dropAddress}</p>
                </div>
             </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
               <User className="w-5 h-5 text-[var(--color-brand-600)]" /> Customer Info
             </h3>
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {order.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerPhone}</p>
                </div>
             </div>
          </div>

          {/* Driver Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
               <Truck className="w-5 h-5 text-[var(--color-brand-600)]" /> Driver Info
             </h3>
             {assignedDriver ? (
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(assignedDriver.name)}&background=random`} alt={assignedDriver.name} className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <p className="font-medium text-gray-900">{assignedDriver.name}</p>
                   <p className="text-sm text-gray-500">{assignedDriver.phone}</p>
                 </div>
                 <button onClick={() => navigate(`/drivers/${assignedDriver.id}`)} className="ml-auto p-2 text-gray-400 hover:text-[var(--color-brand-600)] transition-colors">
                   <Navigation className="w-5 h-5" />
                 </button>
               </div>
             ) : (
               <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                 <p className="text-sm text-gray-500">No driver assigned yet</p>
                 {canReassign && (
                   <button onClick={() => setReassignModal(true)} className="mt-2 text-sm font-medium text-[var(--color-brand-600)] hover:underline">
                     Assign Driver Now
                   </button>
                 )}
               </div>
             )}
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
               <Receipt className="w-5 h-5 text-[var(--color-brand-600)]" /> Payment Details
             </h3>
             
             <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> {order.paymentMethod || 'Credit Card'}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  order.paymentStatus === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                  order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
             </div>

             <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Fare</span>
                  <span className="text-gray-900 font-medium">${(order.price * 0.7).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Distance Fee</span>
                  <span className="text-gray-900 font-medium">${(order.price * 0.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes & Fees</span>
                  <span className="text-gray-900 font-medium">${(order.price * 0.1).toFixed(2)}</span>
                </div>
             </div>
             
             <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                <span className="font-semibold text-gray-900">Total Price</span>
                <span className="text-2xl font-bold text-[var(--color-brand-600)] flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />{order.price.toFixed(2)}
                </span>
             </div>
          </div>
        </div>
      </div>

      <ReassignDriverModal
        isOpen={reassignModal}
        onClose={() => setReassignModal(false)}
        onConfirm={(driverId) => reassignMutation.mutate({ orderId: order.id, driverId })}
        drivers={drivers}
      />

      <RejectReasonModal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={(reason) => updateStatusMutation.mutate({ id: order.id, status: 'CANCELLED', reason })}
        title="Cancel Order"
      />
    </div>
  );
};
