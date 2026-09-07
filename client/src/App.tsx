/* Civic Calm style: the app shell keeps every safety action one route away. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { HazardNotificationListener } from "./components/HazardNotificationListener";
import { LocationProvider } from "./contexts/LocationContext";
import { MapProvider } from "./contexts/MapContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomCursor } from "./components/CustomCursor";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import GuidesPage from "./pages/GuidesPage";
import DisasterPage from "./pages/DisasterPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/app" component={Home} />
      <Route path="/explore" component={Home} />
      <Route path="/map" component={MapPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route path="/disaster" component={DisasterPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MapProvider>
            <LocationProvider>
              <TooltipProvider>
                <CustomCursor />
                <Toaster />
                <HazardNotificationListener />
                <Router />
              </TooltipProvider>
            </LocationProvider>
          </MapProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
