import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_TRAVEL_PACKAGE } from '../graphql/mutation';
import styled from 'styled-components';

const AddPackageForm = ({ onClose }) => {
  const [form, setForm] = useState({
    title: '',
    destination: '',
    price: '',
    duration: '',
    availability: '',
    description: '',
  });

  const [addPackage] = useMutation(ADD_TRAVEL_PACKAGE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPackage({
        variables: {
          ...form,
          price: parseFloat(form.price),
          availability: parseInt(form.availability, 10),
        },
      });
      alert('Package added successfully!');
      onClose();
    } catch (err) {
      console.error('Error adding package:', err);
      alert('Error adding package.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="destination"
        placeholder="Destination"
        value={form.destination}
        onChange={handleChange}
        required
      />
      <Input
        type="number"
        name="price"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="duration"
        placeholder="Duration"
        value={form.duration}
        onChange={handleChange}
        required
      />
      <Input
        type="number"
        name="availability"
        placeholder="Availability"
        value={form.availability}
        onChange={handleChange}
        required
      />
      <TextArea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <Button type="submit">Add Package</Button>
      <Button onClick={onClose}>Cancel</Button>
    </Form>
  );
};

export default AddPackageForm;

// Styled Components
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background: teal;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #006666;
  }
`;
