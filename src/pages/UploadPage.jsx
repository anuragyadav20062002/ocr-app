/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [ocrResults, setOcrResults] = useState([]);
  const [filter, setFilter] = useState('');
  const methods = useForm();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 2 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      alert('File size must be less than 2MB');
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      const status = result.identification_number ? 'success' : 'failure';
      setOcrResults([...ocrResults, { ...result, fileName: file.name, status }]);
    }
  };

  const handleSave = async () => {
    const latestResult = ocrResults[ocrResults.length - 1];
    if (latestResult) {
      const response = await fetch('http://127.0.0.1:5000/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(latestResult),
      });

      if (response.ok) {
        alert('Data saved successfully');
      } else {
        alert('Failed to save data');
      }
    }
  };

  const filteredResults = ocrResults.filter(result =>
    result.fileName.includes(filter)
  );

  const latestResult = ocrResults.length > 0 ? ocrResults[ocrResults.length - 1] : null;

  return (
    <FormProvider {...methods}>
      <div className="container" style={{marginTop:'20px'}}>
        <div className="flex space-x-4">
          <Card className="w-1/2">
            <h2>Upload Thai ID Card</h2>
            <form onSubmit={methods.handleSubmit(handleUpload)}>
              <Input type="file" accept=".png,.jpeg,.jpg" onChange={handleFileChange} />
              <Button type="submit">Upload</Button>
              {latestResult && <Button style={{marginLeft:'5px'}} type="button" onClick={handleSave}>Save</Button>}
            </form>
          </Card>
          <Card className="w-1/2">
            <h2>OCR Results</h2>
            {latestResult && (
              <pre>
                {JSON.stringify({
                  identification_number: latestResult.identification_number,
                  name: latestResult.name,
                  last_name: latestResult.last_name,
                  date_of_birth: latestResult.date_of_birth,
                  date_of_issue: latestResult.date_of_issue,
                  date_of_expiry: latestResult.date_of_expiry,
                }, null, 2)}
              </pre>
            )}
          </Card>
        </div>

      </div>
    </FormProvider>
  );
};

export default UploadPage;