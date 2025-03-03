import React from "react";

const turnOrderData = [
    { id: 1, name: "Robot", image: "/Monster/BEE.png", speed: 3 },
    { id: 2, name: "Red Hair", image: "/Monster/BEE.png", speed: 14 },
];

const OrderUI = () => {
    return (
        <div style={styles.container}>
            {turnOrderData.map((unit, index) => (
                <div key={unit.id} style={styles.unitBox}>
                    <img src={unit.image} alt={unit.name} style={styles.unitImage} />
                    <span style={styles.speedText}>{unit.speed}</span>
                </div>
            ))}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        padding: "8px",
        borderRadius: "10px",
    },
    unitBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        padding: "5px",
        borderRadius: "8px",
        width: "120px",
    },
    unitImage: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
    },
    speedText: {
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
    },
};

export default OrderUI;