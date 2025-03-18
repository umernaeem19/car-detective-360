
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Upload, Shield, Clock, MapPin, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-gradient-to-b from-blue-50 to-white"
          style={{ 
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />
        
        <motion.div 
          className="container relative z-10 px-4 mx-auto max-w-5xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUpVariant} className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              Car Detective 360
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUpVariant}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900"
          >
            Advanced Vehicle Recognition System
          </motion.h1>
          
          <motion.p 
            variants={fadeInUpVariant}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Monitor, identify, and analyze vehicles with precision using our cutting-edge AI technology.
          </motion.p>
          
          <motion.div variants={fadeInUpVariant} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1">
                <Car className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div className="animate-bounce">
            <div className="w-6 h-6 border-r-2 border-b-2 border-blue-700 transform rotate-45 opacity-75"></div>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent Vehicle Monitoring</h2>
            <p className="text-lg text-gray-600">
              Our system combines computer vision and AI to provide comprehensive vehicle detection and analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Car className="h-10 w-10 text-blue-600" />,
                title: "Vehicle Identification",
                description: "Automatically identifies vehicle make, model, color, and year with high accuracy."
              },
              {
                icon: <Shield className="h-10 w-10 text-blue-600" />,
                title: "Loitering Detection",
                description: "Flags suspicious vehicles that remain in one location for extended periods."
              },
              {
                icon: <Clock className="h-10 w-10 text-blue-600" />,
                title: "Revisit Analysis",
                description: "Tracks and identifies vehicles that frequently return to the same location."
              },
              {
                icon: <MapPin className="h-10 w-10 text-blue-600" />,
                title: "Spatial Tracking",
                description: "Uses advanced algorithms to track vehicle movement patterns within the scene."
              },
              {
                icon: <FileVideo className="h-10 w-10 text-blue-600" />,
                title: "Video Processing",
                description: "Processes video feeds from security cameras and other sources in near real-time."
              },
              {
                icon: <Upload className="h-10 w-10 text-blue-600" />,
                title: "Easy Integration",
                description: "Simple to integrate with existing security systems and camera networks."
              }
            ].map((feature, index) => (
              <Card key={index} className="overflow-hidden glass border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Our advanced AI system processes video feeds to detect and analyze vehicles with precision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {[
              {
                number: "01",
                title: "Upload Video",
                description: "Upload security camera footage or connect to live video feeds."
              },
              {
                number: "02",
                title: "AI Processing",
                description: "Our AI model analyzes the video to detect and identify vehicles."
              },
              {
                number: "03",
                title: "View Results",
                description: "Access detailed reports and visualizations of the detected vehicles."
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-4 -left-4 text-7xl font-bold text-blue-100 select-none">
                  {step.number}
                </div>
                <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-100 h-full">
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform translate-x-full">
                    <div className="w-8 h-0.5 bg-blue-200"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Experience the future of vehicle monitoring and surveillance with Car Detective 360.
            </p>
            <Link to="/upload">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Upload className="mr-2 h-5 w-5" />
                Start Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Car className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-semibold">Car Detective 360</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/upload" className="text-gray-600 hover:text-blue-600 transition-colors">Upload</Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Car Detective 360. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
