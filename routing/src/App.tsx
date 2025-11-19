import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { Home } from './Home'
import { About } from './About'
import { NotFound } from './NotFound'

export function App() {
    return (
        <HashRouter>
            <nav style={{ display: 'flex', gap: '12px', padding: '12px' }}>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </HashRouter>
    )
}