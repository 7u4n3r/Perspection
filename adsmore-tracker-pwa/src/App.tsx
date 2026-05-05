import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NewEntry from "./pages/NewEntry";
import EntryDetail from "./pages/EntryDetail";
import SearchPage from "./pages/SearchPage";
import ExportPage from "./pages/ExportPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/new" component={NewEntry} />
      <Route path="/entry/:id" component={EntryDetail} />
      <Route path="/search" component={SearchPage} />
      <Route path="/export" component={ExportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-center" duration={2000} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
