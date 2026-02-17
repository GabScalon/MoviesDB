import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { MyList } from "./pages/MyList";
import { MovieDetails } from "./pages/MovieDetails";
import { Footer } from "./components/Footer";

function App() {
    return (
        <BrowserRouter>
            {/* O componente Navbar estará presente em todas as páginas, pois está fora do Routes */}
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/my-list" element={<MyList />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}

export default App;
