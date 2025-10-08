import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lab1 from "./pages/Lab1";
import Lab2 from "./pages/Lab2";
import Lab3 from "./pages/Lab3";

export default function App() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lab1" element={<Lab1 />} />
                <Route path="/lab2" element={<Lab2 />} />
                <Route path="/lab3" element={<Lab3 />} />
            </Routes>
        </div>
    );
}
