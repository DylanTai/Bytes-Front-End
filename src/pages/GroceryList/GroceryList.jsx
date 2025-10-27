import { useState, useEffect } from "react";
import * as groceryListService from "../../services/groceryListService.js";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";
import { showToast } from "../../components/PopUps/PopUps.jsx";
import "./GroceryList.css";

const GroceryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroceryList();
  }, []);

  const fetchGroceryList = async () => {
    try {
      const data = await groceryListService.getGroceryList();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch grocery list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (itemId, currentChecked) => {
    try {
      await groceryListService.updateGroceryItem(itemId, !currentChecked);
      // Update local state
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, checked: !currentChecked } : item
        )
      );
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  const handleCheckAll = async () => {
    const allChecked = items.every((item) => item.checked);
    const newCheckedState = !allChecked;

    try {
      // Update all items on backend
      const updatePromises = items.map((item) =>
        groceryListService.updateGroceryItem(item.id, newCheckedState)
      );
      await Promise.all(updatePromises);

      // Update local state
      setItems((prevItems) =>
        prevItems.map((item) => ({ ...item, checked: newCheckedState }))
      );
    } catch (err) {
      console.error("Failed to check/uncheck all items:", err);
    }
  };

  const handleClearChecked = async () => {
    const checkedCount = items.filter((item) => item.checked).length;
    
    if (checkedCount === 0) {
      showToast("No items are checked!", "error");
      return;
    }

    if (window.confirm(`Remove ${checkedCount} checked item(s) from your grocery list?`)) {
      try {
        await groceryListService.clearCheckedItems();
        // Remove checked items from local state
        setItems((prevItems) => prevItems.filter((item) => !item.checked));
      } catch (err) {
        console.error("Failed to clear checked items:", err);
      }
    }
  };

  const formatQuantity = (item) => {
    const unit = item.volume_unit || item.weight_unit || "";
    return `${item.quantity} ${unit}`.trim();
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="grocery-list-page">
      <h1 className="grocery-list-title">My Grocery List</h1>
      
      {items.length === 0 ? (
        <p className="empty-message">
          Your grocery list is empty. Add ingredients from your recipes!
        </p>
      ) : (
        <>
          <div className="grocery-list-container">
          <ul className="grocery-list">
            {items.map((item) => (
              <li key={item.id} className={`grocery-item ${item.checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(item.id, item.checked)}
                  className="grocery-checkbox"
                />
                <span className="grocery-item-text">
                  {formatQuantity(item)} - {item.name} 
                </span>
              </li>
            ))}
          </ul>
          
          <div className="grocery-list-actions">
            <button onClick={handleCheckAll} className="check-all-button">
              {items.every((item) => item.checked) ? "Uncheck All" : "Check All"}
            </button>
            <button onClick={handleClearChecked} className="update-button">
              Update (Remove Checked Items)
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroceryList;