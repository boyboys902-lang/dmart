// src/components/DynamicMetaPixel.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMetaPixels } from "../utils/firestoreApi";

const FB_SCRIPT_ID = "meta-pixel-fbevents";

// Injects the official Meta Pixel base code once. Every pixel ID added in the
// admin panel is initialised on top of it, so multiple pixels can run together
// and each one receives the same events.
const loadFbqBase = () => {
  if (typeof window === "undefined") return;
  if (window.fbq) return;

  const fbq = function () {
    fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = fbq;

  if (!document.getElementById(FB_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = FB_SCRIPT_ID;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
};

const DynamicMetaPixel = () => {
  const location = useLocation();
  const [ready, setReady] = useState(false);

  // Load the pixels saved by the admin and initialise all of them.
  useEffect(() => {
    let active = true;

    const loadPixels = async () => {
      try {
        const { pixels } = await getMetaPixels();
        const enabled = (pixels || []).filter((pixel) => pixel.enabled && pixel.id);
        if (!active || enabled.length === 0) return;

        loadFbqBase();
        enabled.forEach((pixel) => window.fbq("init", pixel.id));
        if (active) setReady(true);
      } catch (err) {
        console.error("Failed to load Meta Pixel:", err);
      }
    };

    loadPixels();
    return () => {
      active = false;
    };
  }, []);

  // Fire PageView on the first load and on every route change, so every page
  // of the site is tracked for all configured pixels.
  useEffect(() => {
    if (!ready || typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [ready, location.pathname, location.search]);

  return null;
};

export default DynamicMetaPixel;
