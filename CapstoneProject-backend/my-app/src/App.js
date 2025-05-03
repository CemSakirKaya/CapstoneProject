import './App.css';
import { Route,Router,Routes } from 'react-router-dom';
import WelcomePage from  "./components/WelcomePage"
import InputPage from './components/InputPage';
import ResultPage from './components/ResultPage';
function App() {
  return (
    <div className="App">

    <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>

    </div>
  );
}

export default App;
