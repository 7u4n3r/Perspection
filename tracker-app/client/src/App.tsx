import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TrackerProvider } from "./contexts/TrackerContext";
import Home from "./pages/Home";
import EntryDetail from "./pages/EntryDetail";
import Search from "./pages/Search";
import Export from "./pages/Export";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/entry/:id" component={EntryDetail} />
      <Route path="/search" component={Search} />
      <Route path="/export" component={Export} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <TrackerProvider>
            <Toaster position="top-center" duration={2000} />
            <Router />
          </TrackerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
