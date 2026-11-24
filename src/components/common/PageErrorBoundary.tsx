import { Component, type ReactNode } from "react";
import NotFoundPage from "../../pages/not-found/NotFoundPage";

export default class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <NotFoundPage codigo={500} /> : this.props.children;
  }
}
