import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Lab1 from "./pages/lab1";
import Lab2 from "./pages/lab2";
import Lab3 from "./pages/lab3";
import Lab4_RSA from "./pages/lab4";
import LabDSS from "./pages/lab5";

export default function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lab1" element={<Lab1 />} />
                <Route path="/lab2" element={<Lab2 />} />
                <Route path="/lab3" element={<Lab3 />} />
                <Route path="/lab4" element={<Lab4_RSA />} />
                <Route path="/lab5" element={<LabDSS />} />
            </Routes>
        </div>
    );
}
