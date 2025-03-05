"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, Row, Col } from "react-bootstrap";

export default function SelectClass() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          "http://localhost:1337/api/classes?populate=*"
        ); 
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  const handleSelectClass = async (classId) => {
    setSelectedClass(classId);

    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      const response = await fetch(`http://localhost:1337/api/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ class: classId }),
      });

      if (!response.ok) throw new Error("Failed to update class");

      router.push("/menu");
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Select Your Class</h1>
      <Row xs={1} md={3} className="g-4">
        {classes.map((cls) => (
          <Col key={cls.id}>
            <Card
              style={{
                width: "18rem",
                cursor: "pointer",
                border:
                  selectedClass === cls.id ? "2px solid blue" : "1px solid #ccc",
              }}
              onClick={() => handleSelectClass(cls.id)}
            >
              <Card.Img
                variant="top"
                src={"http://localhost:1337" + cls.attributes.ImageUrl.data.attributes.url}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{cls.attributes.name}</Card.Title>
                <Card.Text>{cls.attributes.Description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}