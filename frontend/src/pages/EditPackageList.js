import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import { UPDATE_PACKAGE } from '../graphql/mutation';
import styled from 'styled-components';

const EditPackageList = ({ onClose }) => {
  const { data, loading, error, refetch } = useQuery(GET_PACKAGES);
  const [updatePackage] = useMutation(UPDATE_PACKAGE);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEditClick = (pkg) => {
    setSelectedPackage(pkg.id);
    setFormData({ ...pkg });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePackage({
        variables: {
          id: selectedPackage,
          ...formData,
          price: parseFloat(formData.price),
          availability: parseInt(formData.availability),
        },
      });
      alert('Package updated successfully!');
      refetch(); 
      setSelectedPackage(null); 
    } catch (err) {
      console.error('Error updating package:', err);
      alert('Failed to update package. Please try again.');
    }
  };

  if (loading) return <LoadingText>Loading packages...</LoadingText>;
  if (error) return <ErrorText>Error: {error.message}</ErrorText>;

  return (
    <Container>
      <Header>
        <h2>Edit Travel Packages</h2>
        <CloseButton onClick={onClose}>✖</CloseButton>
      </Header>

      {data.getPackages.map((pkg) => (
        <PackageItem key={pkg.id}>
          <div>
            <strong>{pkg.title}</strong> - {pkg.destination}
          </div>
          <EditButton onClick={() => handleEditClick(pkg)}>Edit</EditButton>
        </PackageItem>
      ))}

      {selectedPackage && (
        <EditForm onSubmit={handleSubmit}>
          <h3>Edit Package</h3>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Destination:</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />

          <label>Duration:</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />

          <label>Price (₹):</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <label>Availability:</label>
          <input
            type="number"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          />

          <ButtonContainer>
            <SubmitButton type="submit">Save Changes</SubmitButton>
            <CancelButton onClick={() => setSelectedPackage(null)}>Cancel</CancelButton>
          </ButtonContainer>
        </EditForm>
      )}
    </Container>
  );
};

export default EditPackageList;

// Styled Components
const Container = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  width: 90%;
  margin: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: teal;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  font-size: 1.5rem;
  color: gray;
  border: none;
  cursor: pointer;

  &:hover {
    color: red;
  }
`;

const PackageItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

const EditButton = styled.button`
  background-color: teal;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: darkcyan;
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;

  label {
    font-weight: bold;
    color: teal;
  }

  input,
  textarea {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    resize: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SubmitButton = styled.button`
  background-color: teal;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: darkcyan;
  }
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: black;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: darkgray;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  color: #555;
`;

const ErrorText = styled.p`
  text-align: center;
  color: red;
`;
