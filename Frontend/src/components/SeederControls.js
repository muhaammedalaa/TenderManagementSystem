import React, { useState } from 'react';
import { Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { seederAPI } from '../services/api';

const SeederControls = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [stats, setStats] = useState(null);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const response = await seederAPI.seed();
      showMessage('Database seeded successfully!', 'success');
      await loadStats();
    } catch (error) {
      showMessage(`Error seeding database: ${error.response?.data?.message || error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const response = await seederAPI.clear();
      showMessage('Database cleared successfully!', 'success');
      await loadStats();
    } catch (error) {
      showMessage(`Error clearing database: ${error.response?.data?.message || error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await seederAPI.reset();
      showMessage('Database reset successfully!', 'success');
      await loadStats();
    } catch (error) {
      showMessage(`Error resetting database: ${error.response?.data?.message || error.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await seederAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.warn('Could not load stats:', error);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Database Seeder Controls</h5>
        <small className="text-muted">Use these controls to manage test data</small>
      </Card.Header>
      <Card.Body>
        {message && (
          <Alert variant={messageType} dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Row className="mb-3">
          <Col md={4}>
            <Button
              variant="success"
              onClick={handleSeed}
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Seeding...
                </>
              ) : (
                'Seed Database'
              )}
            </Button>
          </Col>
          <Col md={4}>
            <Button
              variant="warning"
              onClick={handleClear}
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Clearing...
                </>
              ) : (
                'Clear Database'
              )}
            </Button>
          </Col>
          <Col md={4}>
            <Button
              variant="danger"
              onClick={handleReset}
              disabled={loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Resetting...
                </>
              ) : (
                'Reset Database'
              )}
            </Button>
          </Col>
        </Row>

        {stats && (
          <div className="mt-3">
            <h6>Database Statistics</h6>
            <Row>
              {Object.entries(stats).map(([key, value]) => (
                <Col key={key} md={3} className="mb-2">
                  <div className="text-center p-2 border rounded">
                    <div className="h5 mb-0 text-primary">{value}</div>
                    <small className="text-muted text-capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </small>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            <strong>Test Credentials:</strong><br />
            Admin: admin / Admin123!<br />
            Manager: manager1 / Manager123!<br />
            User: user1 / User123!<br />
            Supplier: supplier1 / Supplier123!
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SeederControls;
