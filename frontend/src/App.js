import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
