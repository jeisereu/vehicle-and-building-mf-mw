export type ChecklistItem = {
  id: string;
  name: string;
};

export type ChecklistStatus = "pass" | "fail" | undefined;

export const leftItems: ChecklistItem[] = [
  { id: "safety-belts", name: "Safety Belts" },
  { id: "brakes", name: "Brakes" },
  { id: "steering", name: "Steering" },
  { id: "engine", name: "Engine" },
  { id: "transmission", name: "Transmission" },
  { id: "air-conditioning", name: "Air conditioning" },
  { id: "wipers", name: "Wipers" },
  { id: "high-beam", name: "Headlights High Beam" },
  { id: "low-beam", name: "Headlights Low Beam" },
  { id: "window-4", name: "Window 4" },
  { id: "windshield", name: "Windshield" },
  { id: "radio", name: "Radio" },
  { id: "horn", name: "Horn" },
  { id: "seatbelts", name: "Seatbelts" },
  { id: "tire-1", name: "Tire 1" },
  { id: "tire-1-tread", name: "Tread Depth" },
  { id: "tire-1-pressure", name: "Inflation Pressure" },
  { id: "tire-1-cracks", name: "Cracks and Cuts" },
  { id: "tire-2", name: "Tire 2" },
  { id: "tire-2-tread", name: "Tread Depth" },
  { id: "tire-2-pressure", name: "Inflation Pressure" },
  { id: "tire-2-cracks", name: "Cracks and Cuts" },
  { id: "emergency-equipment", name: "Emergency Equipment" },
  { id: "lug-wrench-jack", name: "Lug Wrench / Jack" },
  { id: "fire-extinguisher", name: "Fire Extinguisher" },
  { id: "first-aid-kit", name: "First Aid Kit" },
  { id: "flashlight", name: "Flashlight" },
  { id: "reflectors-flares", name: "Warning Reflectors and Flares" },
  { id: "liquid-level-check", name: "Liquid Level Check" },
  { id: "radiator", name: "Radiator" },
  { id: "oil", name: "Oil" },
  { id: "auto-transmission", name: "Auto Transmission" },
  { id: "power-steering", name: "Power Steering" },
  { id: "brake-fluid", name: "Brakes" },
  { id: "window-washer", name: "Window Washer" },
];

export const rightItems: ChecklistItem[] = [
  { id: "turn-signals", name: "Turn Signals" },
  { id: "brake-tail-lights", name: "Brake Lights/Tail Lights" },
  { id: "door-1", name: "Door 1" },
  { id: "door-2", name: "Door 2" },
  { id: "door-3", name: "Door 3" },
  { id: "door-4", name: "Door 4" },
  { id: "window-1", name: "Window 1" },
  { id: "window-2", name: "Window 2" },
  { id: "window-3", name: "Window 3" },
  { id: "tire-3", name: "Tire 3" },
  { id: "tire-3-tread", name: "Tread Depth" },
  { id: "tire-3-pressure", name: "Inflation Pressure" },
  { id: "tire-3-cracks", name: "Cracks and Cuts" },
  { id: "tire-4", name: "Tire 4" },
  { id: "tire-4-tread", name: "Tread Depth" },
  { id: "tire-4-pressure", name: "Inflation Pressure" },
  { id: "tire-4-cracks", name: "Cracks and Cuts" },
  { id: "spare-tire", name: "Spare Tire" },
  { id: "spare-tread", name: "Tread Depth" },
  { id: "spare-pressure", name: "Inflation Pressure" },
  { id: "spare-cracks", name: "Cracks and Cuts" },
  { id: "documentation", name: "Documentation" },
  { id: "insurance", name: "Insurance" },
  { id: "registration", name: "Registration" },
  { id: "plate", name: "Plate" },
  { id: "stickers", name: "Stickers" },
  { id: "body", name: "Body" },
  { id: "rear-view-mirror", name: "Rear View Mirror" },
  { id: "side-view-mirror", name: "Side View Mirror" },
  { id: "cameras", name: "Cameras" },
  { id: "airbags", name: "Airbags" },
  { id: "chairs", name: "Chairs" },
  { id: "speedometers-gauges", name: "Speedometers, Gauges" },
];

export const allItems = [...leftItems, ...rightItems];
export const rowCount = Math.max(leftItems.length, rightItems.length);

const groupedMobileItems = allItems.filter((item) => /^(tire-[1-4]|window-[1-4])/.test(item.id));
export const mobileItems = [
  ...allItems.filter((item) => !groupedMobileItems.includes(item)),
  ...[1, 2, 3, 4].flatMap((tireNumber) => groupedMobileItems.filter((item) => item.id.startsWith(`tire-${tireNumber}`))),
  ...[1, 2, 3, 4].flatMap((windowNumber) => groupedMobileItems.filter((item) => item.id === `window-${windowNumber}`)),
];
