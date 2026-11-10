import { useSyncExternalStore } from "react";
import { dataConsultation } from "../../services/dataConsultation";
import LoadingState from "./LoadingState";
export default function DataConsultationIndicator() {
  const loading = useSyncExternalStore(dataConsultation.subscribe, dataConsultation.getSnapshot);
  return loading ? <div className="pointer-events-none fixed right-4 top-20 z-40 max-w-[calc(100vw-2rem)] rounded-xl border border-green-100 bg-white/95 px-4 shadow-sm"><LoadingState compact /></div> : null;
}
