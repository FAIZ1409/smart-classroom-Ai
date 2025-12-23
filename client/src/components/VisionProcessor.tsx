import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { useUpdateOccupancy } from "@/hooks/use-occupancy";
import { AlertCircle, Camera, Loader2 } from "lucide-react";

interface VisionProcessorProps {
  onOccupancyChange: (count: number) => void;
}

export function VisionProcessor({ onOccupancyChange }: VisionProcessorProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastCountRef = useRef<number>(0);
  
  const { mutate: logOccupancy } = useUpdateOccupancy();

  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load TensorFlow model:", err);
        setError("Could not load AI vision model. Check your connection.");
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const runDetection = useCallback(async () => {
    if (
      model &&
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Adjust canvas to match video
      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }

      // Detect objects
      const predictions = await model.detect(video);

      // Filter for 'person'
      const personPredictions = predictions.filter(
        (p) => p.class === "person" && p.score > 0.5
      );
      
      const currentCount = personPredictions.length;

      // Draw bounding boxes
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        
        personPredictions.forEach((prediction) => {
          const [x, y, width, height] = prediction.bbox;
          
          // Draw Box
          ctx.strokeStyle = "#3b82f6"; // Blue-500
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, width, height);

          // Draw Label
          ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
          ctx.fillRect(x, y > 20 ? y - 25 : 0, width, 25);
          
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 16px Inter";
          ctx.fillText(
            `Person ${(prediction.score * 100).toFixed(0)}%`,
            x + 5,
            y > 20 ? y - 7 : 18
          );
        });
      }

      // Update state if changed
      if (currentCount !== lastCountRef.current) {
        lastCountRef.current = currentCount;
        onOccupancyChange(currentCount);
        logOccupancy({ count: currentCount });
      }
    }
  }, [model, onOccupancyChange, logOccupancy]);

  // Run detection loop
  useEffect(() => {
    const interval = setInterval(() => {
      runDetection();
    }, 500); // 2fps is enough for room occupancy
    return () => clearInterval(interval);
  }, [runDetection]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-destructive/50 text-destructive p-6">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="font-medium text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-mono text-sm">INITIALIZING NEURAL NETWORK...</p>
        </div>
      )}
      
      <Webcam
        ref={webcamRef}
        muted={true}
        className="w-full h-full object-cover"
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none"
      />

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-mono text-white/90">LIVE FEED • PROCESSING</span>
      </div>
      
      <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white/70">
          <Camera className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
