"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { ListGroup } from "react-bootstrap";

export default function SelectClass() {
  const router = useRouter();
  const [classes, setClasses] = useState();
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/characters");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  },);

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
      <ListGroup>
        {classes.map((cls) => (
          <ListGroup.Item
            key={cls.id}
            action
            onClick={() => handleSelectClass(cls.id)}
            active={selectedClass === cls.id}
          >
            {cls.attributes.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}