import React, { useState } from "react";
import styled from "styled-components";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    address: "",
    pincode: "",
    cardType: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Payment Details Submitted Successfully!");
    console.log("Form Data: ", formData);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Heading>PAYMENT FORM</Heading>
        <Description>Required fields are marked with *</Description>

        <SectionHeading>Contact Information</SectionHeading>
        <InputGroup>
          <Label htmlFor="name">Name*</Label>
          <Input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <Fieldset>
          <Legend>Gender*</Legend>
          <RadioGroup>
            <RadioLabel>
              <Input
                type="radio"
                name="gender"
                value="male"
                onChange={handleChange}
                required
              />
              Male
            </RadioLabel>
            <RadioLabel>
              <Input
                type="radio"
                name="gender"
                value="female"
                onChange={handleChange}
                required
              />
              Female
            </RadioLabel>
          </RadioGroup>
        </Fieldset>

        <InputGroup>
          <Label htmlFor="address">Address</Label>
          <Textarea
            name="address"
            id="address"
            rows="4"
            value={formData.address}
            onChange={handleChange}
          ></Textarea>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="pincode">Pincode*</Label>
          <Input
            type="number"
            name="pincode"
            id="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <SectionHeading>Payment Information</SectionHeading>
        <InputGroup>
          <Label htmlFor="cardType">Card Type*</Label>
          <Select
            name="cardType"
            id="cardType"
            value={formData.cardType}
            onChange={handleChange}
            required
          >
            <option value="">--Select Card Type--</option>
            <option value="rupay">Rupay</option>
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <Label htmlFor="cardNumber">Card Number*</Label>
          <Input
            type="number"
            name="cardNumber"
            id="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="expiryDate">Expiry Date*</Label>
          <Input
            type="date"
            name="expiryDate"
            id="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="cvv">CVV*</Label>
          <Input
            type="password"
            name="cvv"
            id="cvv"
            value={formData.cvv}
            onChange={handleChange}
            required
          />
        </InputGroup>

        <SubmitButton type="submit">Submit Payment</SubmitButton>
      </Form>
    </Container>
  );
};

export default PaymentForm;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
  padding: 20px;
`;

const Form = styled.form`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const Heading = styled.h1`
  font-size: 2rem;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
`;

const SectionHeading = styled.h2`
  font-size: 1.5rem;
  color: #0077b6;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  color: #333;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;

  &:focus {
    outline: none;
    border-color: #0077b6;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;

  &:focus {
    outline: none;
    border-color: #0077b6;
  }
`;

const Fieldset = styled.fieldset`
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
`;

const Legend = styled.legend`
  font-size: 1rem;
  color: #333;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 10px;
`;

const RadioLabel = styled.label`
  font-size: 1rem;
  color: #333;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;

  &:focus {
    outline: none;
    border-color: #0077b6;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0077b6;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #005f8a;
  }
`;
