import React from "react";

function FeedingsTable({ feedings }) {
  const mealNames = {
    B: "Breakfast",
    L: "Lunch",
    D: "Dinner",
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Meal</th>
        </tr>
      </thead>
      <tbody>
        {!feedings.length ? null : feedings.map((feeding, index) => (
          <tr key={index}>
            <td>{feeding.date}</td>
            <td>{mealNames[feeding.meal]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FeedingsTable;
