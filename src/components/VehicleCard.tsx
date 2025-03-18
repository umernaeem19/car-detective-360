
import { motion } from "framer-motion";
import { Clock, AlertCircle, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  color: string;
  year: string;
  type: string;
  status: string;
  detections: number;
  lastSeen: string;
  image: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "loitering":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Loitering
          </Badge>
        );
      case "revisit":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center">
            <RotateCw className="h-3 w-3 mr-1" />
            Revisiting
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
            Normal
          </Badge>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm h-full">
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            {getStatusBadge(vehicle.status)}
          </div>
          <div className="relative h-48 overflow-hidden bg-gray-100">
            <img
              src={vehicle.image}
              alt={`${vehicle.color} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg">
                {vehicle.color} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-white/80 text-sm">{vehicle.year} • {vehicle.type}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-1">ID:</span>
              <span className="text-sm text-gray-600">#{vehicle.id}</span>
            </div>
            <div className="text-sm text-gray-500">{vehicle.lastSeen}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm text-gray-600">{vehicle.detections} detections</span>
            </div>
            
            {vehicle.status === "loitering" && (
              <div className="flex items-center text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Extended stay</span>
              </div>
            )}
            
            {vehicle.status === "revisit" && (
              <div className="flex items-center text-purple-600">
                <RotateCw className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Multiple visits</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VehicleCard;
