import { useSyncExternalStore } from "react";
import { dataConsultation } from "../../services/dataConsultation";
import LoadingState from "./LoadingState";
export default function DataConsultationIndicator() {
  const loading = useSyncExternalStore(dataConsultation.subscribe, dataConsultation.getSnapshot);
  return loading ? <div className="sticky top-0 z-20 mb-4 rounded-xl border border-green-100 bg-white/95 shadow-sm"><LoadingState compact /></div> : null;
}
