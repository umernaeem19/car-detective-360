
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Clock, Shield, BarChart, Map, Filter, Search, Calendar, ChevronDown, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import VehicleCard from "@/components/VehicleCard";

// Sample data for demonstration
const SAMPLE_VEHICLES = [
  { id: 1, make: "Toyota", model: "Camry", color: "Blue", year: "2018", type: "Sedan", status: "normal", detections: 14, lastSeen: "2 mins ago", image: "https://source.unsplash.com/random/300x200/?car,toyota" },
  { id: 2, make: "Honda", model: "Civic", color: "Black", year: "2020", type: "Sedan", status: "loitering", detections: 47, lastSeen: "5 mins ago", image: "https://source.unsplash.com/random/300x200/?car,honda" },
  { id: 3, make: "Ford", model: "F-150", color: "Red", year: "2021", type: "Truck", status: "normal", detections: 6, lastSeen: "12 mins ago", image: "https://source.unsplash.com/random/300x200/?car,truck" },
  { id: 4, make: "Tesla", model: "Model 3", color: "White", year: "2023", type: "Electric", status: "revisit", detections: 28, lastSeen: "18 mins ago", image: "https://source.unsplash.com/random/300x200/?car,tesla" },
  { id: 5, make: "Jeep", model: "Wrangler", color: "Gray", year: "2022", type: "SUV", status: "normal", detections: 9, lastSeen: "25 mins ago", image: "https://source.unsplash.com/random/300x200/?car,jeep" },
  { id: 6, make: "Nissan", model: "Altima", color: "Silver", year: "2017", type: "Sedan", status: "revisit", detections: 32, lastSeen: "34 mins ago", image: "https://source.unsplash.com/random/300x200/?car,nissan" },
];

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES);
  const [filteredVehicles, setFilteredVehicles] = useState(SAMPLE_VEHICLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats
  const totalVehicles = vehicles.length;
  const loiteringVehicles = vehicles.filter(v => v.status === "loitering").length;
  const revisitVehicles = vehicles.filter(v => v.status === "revisit").length;
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Check if coming from video processing
      if (location.state?.processed) {
        toast({
          title: "Analysis Complete",
          description: `Processed ${location.state.filename} successfully.`,
        });
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [location.state]);
  
  useEffect(() => {
    // Filter vehicles based on search term and status filter
    let filtered = vehicles;
    
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }
    
    setFilteredVehicles(filtered);
  }, [searchTerm, statusFilter, vehicles]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };
  
  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-8">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Loading Dashboard</h3>
            <p className="text-gray-500">Preparing your vehicle analysis results...</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariant}
          >
            <motion.div variants={fadeInUpVariant} className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Vehicle Analysis Dashboard</h1>
              <p className="text-gray-600">
                Review detected vehicles and their patterns from your processed video.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUpVariant} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 mr-4">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Vehicles</p>
                      <h3 className="text-2xl font-bold">{totalVehicles}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 mr-4">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Loitering Vehicles</p>
                      <h3 className="text-2xl font-bold">{loiteringVehicles}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 mr-4">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Revisiting Vehicles</p>
                      <h3 className="text-2xl font-bold">{revisitVehicles}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUpVariant}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 md:flex md:w-auto mb-6">
                  <TabsTrigger value="overview" className="text-sm md:text-base">
                    <BarChart className="mr-2 h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="text-sm md:text-base">
                    <Car className="mr-2 h-4 w-4" />
                    Vehicles
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-sm md:text-base">
                    <Map className="mr-2 h-4 w-4" />
                    Spatial View
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <Card className="border-0 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-lg font-semibold">Video Analysis Overview</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                Today
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Today</DropdownMenuItem>
                              <DropdownMenuItem>Yesterday</DropdownMenuItem>
                              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-lg mb-4">
                            <div className="text-center p-6">
                              <BarChart className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">Video analysis chart will appear here</p>
                              <small className="text-gray-400">Showing detection frequency over time</small>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Sedans</span>
                                <span className="font-medium">42%</span>
                              </div>
                              <Progress value={42} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">SUVs</span>
                                <span className="font-medium">28%</span>
                              </div>
                              <Progress value={28} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Trucks</span>
                                <span className="font-medium">14%</span>
                              </div>
                              <Progress value={14} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <Card className="border-0 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
                          <Button variant="outline" size="sm" className="text-xs">View All</Button>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {[
                              { 
                                icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
                                title: "Loitering Vehicle Detected",
                                description: "Black Honda Civic has been stationary for over 30 minutes.",
                                time: "5 mins ago"
                              },
                              { 
                                icon: <AlertTriangle className="h-5 w-5 text-blue-500" />,
                                title: "Frequent Visitor",
                                description: "White Tesla Model 3 has visited 3 times today.",
                                time: "18 mins ago"
                              },
                              { 
                                icon: <Check className="h-5 w-5 text-green-500" />,
                                title: "Analysis Complete",
                                description: "Video processing has finished successfully.",
                                time: "34 mins ago"
                              }
                            ].map((alert, index) => (
                              <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mr-3 mt-0.5">
                                  {alert.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium">{alert.title}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                                  <span className="text-xs text-gray-400 mt-1 block">{alert.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="vehicles" className="mt-0">
                  <Card className="border-0 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-semibold">Vehicle List</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="search"
                            placeholder="Search vehicles..."
                            className="pl-8 pr-4 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={handleSearch}
                          />
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Filter className="h-4 w-4 mr-1" />
                              Filter
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                              All Vehicles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter("normal")}>
                              Normal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter("loitering")}>
                              Loitering
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusFilter("revisit")}>
                              Revisiting
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {filteredVehicles.length === 0 ? (
                        <div className="text-center py-8">
                          <Search className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">No vehicles found</h3>
                          <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredVehicles.map((vehicle) => (
                            <VehicleCard key={vehicle.id} vehicle={vehicle} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="map" className="mt-0">
                  <Card className="border-0 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-semibold">Spatial Analysis</CardTitle>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-1" />
                        View Options
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                        <div className="text-center p-6">
                          <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">Spatial view will appear here</h3>
                          <p className="text-gray-500">Showing vehicle positions and movement patterns</p>
                        </div>
                      </div>
                      
                      <div className="p-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium mb-4">Detection Hotspots</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Area</TableHead>
                              <TableHead>Detections</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Parking Area 1</TableCell>
                              <TableCell>42</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Normal
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Entry Gate</TableCell>
                              <TableCell>28</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Attention
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Loading Zone</TableCell>
                              <TableCell>14</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  Frequent
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
