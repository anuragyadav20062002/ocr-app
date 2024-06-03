import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import OcrDataPage from './pages/OcrDataPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/data" element={<OcrDataPage />} />
      </Routes>
    </Router>
  );
};

export default App;