import React, { useState,useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/queries';
import styled from 'styled-components';
import NavBar from './NavBar';
import Footer from './Footer';
import AddPackageForm from './AddPackageForm';
import EditPackageList from './EditPackageList';

const AdminDashboard = () => {
  const { data: packageData, loading: packageLoading } = useQuery(GET_PACKAGES);
 useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top when the component is mounted
  }, []);
  const [activeForm, setActiveForm] = useState(null); // Track which form is active

  const totalPackages = packageData?.getPackages.length || 0;

  const toggleForm = (formType) => {
    if (activeForm === formType) {
      setActiveForm(null); // Close the form if already open
    } else {
      setActiveForm(formType); // Open the selected form
    }
  };

  return (
    <div>
      <NavBar />
      <DashboardContainer>
        <Heading>Admin Dashboard &#9992;</Heading>
        <CardsContainer>
          {/* Users Card */}
          <Card>
            <CardTitle>Users</CardTitle>
            <CardValue>1.3B</CardValue> {/* Hardcoded user count for now */}
          </Card>

          <Card onClick={() => toggleForm('add')}>
            <CardTitle>Add Package</CardTitle>
            <CardValue>+</CardValue>
          </Card>

          <Card onClick={() => toggleForm('edit')}>
            <CardTitle>Packages</CardTitle>
            {packageLoading ? (
              <CardValue>Loading...</CardValue>
            ) : (
              <CardValue>{totalPackages}</CardValue>
            )}
          </Card>
        </CardsContainer>

        {/* Conditionally Render Forms */}
        {activeForm === 'add' && (
          <FormContainer>
            <AddPackageForm onClose={() => setActiveForm(null)} />
          </FormContainer>
        )}

        {activeForm === 'edit' && (
          <FormContainer>
            <EditPackageList onClose={() => setActiveForm(null)} />
          </FormContainer>
        )}
      </DashboardContainer>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

// Styled Components
const DashboardContainer = styled.div`
  padding: 40px;
  padding-top: 100px;
  background-color: #f4f4f9;
  min-height: 100vh;
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: teal;
  margin-bottom: 40px;
`;

const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 300px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const CardValue = styled.p`
  font-size: 2.5rem;
  font-weight: bold;
  color: teal;
`;

const FormContainer = styled.div`
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;
