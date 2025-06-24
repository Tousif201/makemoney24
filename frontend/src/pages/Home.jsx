"use client";
import { useEffect, useState, useCallback } from "react";

import CategoryScrollSlider from "../components/CategoryScrollSlider";
import LandingSlider from "../components/LandingSlider";
import ProductList from "../components/Products/ProductList";
import ServiesList from "../components/ServiesList";
import { fetchLocationByCoordinates } from "../../api/location";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [locationDenied, setLocationDenied] = useState(false);
  const [pincode, setPincode] = useState(null);

  const requestUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude, "Longitude:", longitude);

          try {
            const locationData = await fetchLocationByCoordinates(
              latitude,
              longitude
            );
            console.log("📍 Location:", locationData);

            setPincode(locationData?.location?.pincode ?? null);
            setLocationDenied(false);
          } catch (error) {
            console.error("❌ Failed to fetch location from backend:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setLocationDenied(true);
        }
      );
    } else {
      console.error("Geolocation not supported.");
      setLocationDenied(true);
    }
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  return (
    <>
      <div className="p-4 space-y-8">
        <LandingSlider displayRange="firstHalf" />
        <CategoryScrollSlider type={"product"} />
        <CategoryScrollSlider type={"service"} />
        <ProductList pincode={pincode} />
        <LandingSlider displayRange="secondHalf" />
        <ServiesList />
      </div>

      <Dialog open={locationDenied}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Location Access Required</DialogTitle>
            <DialogDescription>
              We need your location to serve the most relevant products and
              services near you.
              <br />
              Please allow location access from your browser settings if you
              previously denied it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLocationDenied(false)}>
              Dismiss
            </Button>
            <Button onClick={requestUserLocation}>Retry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
