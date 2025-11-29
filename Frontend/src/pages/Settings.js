import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useCustomTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { theme, setTheme } = useCustomTheme();

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Settings</h2>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>General Settings</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="formLanguage">
                  <Form.Label>اللغة</Form.Label>
                  <Form.Control as="select" defaultValue="ar">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formTheme">
                  <Form.Label>المظهر</Form.Label>
                  <Form.Control as="select" value={theme} onChange={handleThemeChange}>
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formNotifications">
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label="تفعيل الإشعارات"
                    defaultChecked
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Account Settings</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3" controlId="formChangePassword">
                  <Form.Label>تغيير كلمة المرور</Form.Label>
                  <Form.Control type="password" placeholder="كلمة المرور الحالية" className="mb-2" />
                  <Form.Control type="password" placeholder="كلمة المرور الجديدة" className="mb-2" />
                  <Form.Control type="password" placeholder="تأكيد كلمة المرور الجديدة" />
                  <Button variant="primary" className="mt-2">تغيير كلمة المرور</Button>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formUpdateProfile">
                  <Form.Label>تحديث الملف الشخصي</Form.Label>
                  <Form.Control type="text" placeholder="الاسم" className="mb-2" />
                  <Form.Control type="email" placeholder="البريد الإلكتروني" />
                  <Button variant="primary" className="mt-2">تحديث الملف الشخصي</Button>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formManageSessions">
                  <Form.Label>إدارة الجلسات</Form.Label>
                  <Button variant="danger" className="d-block">تسجيل الخروج من جميع الأجهزة</Button>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Privacy & Security</Card.Header>
            <Card.Body>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formPermissionManagement">
                    <Form.Label>إدارة الأذونات</Form.Label>
                    <Form.Check
                      type="switch"
                      id="location-permission"
                      label="السماح بالوصول إلى الموقع"
                    />
                    <Form.Check
                      type="switch"
                      id="camera-permission"
                      label="السماح بالوصول إلى الكاميرا"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formActivityLog">
                    <Form.Label>سجل النشاطات</Form.Label>
                    <Button variant="info" className="d-block">عرض سجل النشاطات</Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Advanced Settings</Card.Header>
            <Card.Body>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formClearCache">
                    <Form.Label>مسح ذاكرة التخزين المؤقت</Form.Label>
                    <Button variant="warning" className="d-block">مسح ذاكرة التخزين المؤقت</Button>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formExportData">
                    <Form.Label>تصدير البيانات</Form.Label>
                    <Button variant="success" className="d-block">تصدير جميع البيانات</Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsPage;