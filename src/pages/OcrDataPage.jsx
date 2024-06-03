import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';

const OcrDataPage = () => {
  const [ocrData, setOcrData] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const methods = useForm();

  useEffect(() => {
    fetchOcrData();
  }, []);

  const fetchOcrData = async () => {
    const response = await fetch('http://127.0.0.1:5000/data');
    const data = await response.json();
    setOcrData(data);
  };

  const handleCreate = async (data) => {
    const response = await fetch('http://127.0.0.1:5000/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchOcrData();
      alert('Data created successfully');
    } else {
      alert('Failed to create data');
    }
  };

  const handleUpdate = async (id, data) => {
    const response = await fetch(`http://127.0.0.1:5000/data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      fetchOcrData();
      alert('Data updated successfully');
    } else {
      alert('Failed to update data');
    }
  };

  const handleDelete = async (id) => {
    const response = await fetch(`http://127.0.0.1:5000/data/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchOcrData();
      alert('Data deleted successfully');
    } else {
      alert('Failed to delete data');
    }
  };

  const filteredData = ocrData.filter(data =>
    data.fileName.includes(filter)
  );

  return (
    <FormProvider {...methods}>
      <div className="container" style={{marginTop:'20px'}}>
        <div className="flex space-x-4">
          <Card className="w-1/2">
            <h2>OCR Data Management</h2>
            <form onSubmit={methods.handleSubmit(selectedData ? (data) => handleUpdate(selectedData._id, data) : handleCreate)}>
              <Input {...methods.register('fileName')} placeholder="File Name" />
              <Input {...methods.register('identification_number')} placeholder="Identification Number" />
              <Input {...methods.register('name')} placeholder="Name" />
              <Input {...methods.register('last_name')} placeholder="Last Name" />
              <Input {...methods.register('date_of_birth')} placeholder="Date of Birth" />
              <Input {...methods.register('date_of_issue')} placeholder="Date of Issue" />
              <Input {...methods.register('date_of_expiry')} placeholder="Date of Expiry" />
              <Button type="submit">{selectedData ? 'Update' : 'Create'}</Button>
            </form>
          </Card>
          <Card className="w-1/2">
            <h2>Filter OCR Data</h2>
            <Input
              type="text"
              placeholder="Search by file name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>OCR Data</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(data => (
                  <tr key={data._id}>
                    <td>{data.fileName}</td>
                    <td>
                      <pre>
                        {JSON.stringify({
                          identification_number: data.identification_number,
                          name: data.name,
                          last_name: data.last_name,
                          date_of_birth: data.date_of_birth,
                          date_of_issue: data.date_of_issue,
                          date_of_expiry: data.date_of_expiry,
                        }, null, 2)}
                      </pre>
                    </td>
                    <td>
                      <Button onClick={() => setSelectedData(data)}>Edit</Button>
                      <Button style={{marginLeft:'5px'}} onClick={() => handleDelete(data._id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
};

export default OcrDataPage;