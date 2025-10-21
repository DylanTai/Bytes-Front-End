import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import * as recipeService from "../../services/recipeService.js";
import "./RecipeWheel.css";

const RecipeWheel = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const animationRef = useRef(null);
  const spinVelocityRef = useRef(0);

  useEffect(() => {
    const fetchRecipes = async () => {
      const data = await recipeService.getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    };
    fetchRecipes();
  }, []);

  // Slow idle rotation (only if hasn't spun yet)
  useEffect(() => {
    if (!isSpinning && !hasSpun && recipes.length > 0) {
      const idleRotate = setInterval(() => {
        setRotation((prev) => (prev + 0.1) % 360);
      }, 50);
      return () => clearInterval(idleRotate);
    }
  }, [isSpinning, hasSpun, recipes.length]);

  // Spin animation with deceleration
  useEffect(() => {
    if (isSpinning) {
      const animate = () => {
        spinVelocityRef.current *= 0.98; // Deceleration factor
        setRotation((prev) => (prev + spinVelocityRef.current) % 360);

        if (spinVelocityRef.current > 0.1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          // Calculate which recipe was selected
          const normalizedRotation = (360 - (rotation % 360)) % 360;
          const segmentAngle = 360 / recipes.length;
          const selectedIndex = Math.floor(normalizedRotation / segmentAngle);
          setSelectedRecipe(recipes[selectedIndex]);
        }
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isSpinning, rotation, recipes]);

  const handleSpin = () => {
    if (isSpinning || recipes.length === 0) return;
    setSelectedRecipe(null);
    setHasSpun(true);
    spinVelocityRef.current = 20 + Math.random() * 10; // Random initial velocity
    setIsSpinning(true);
  };

  const handleRecipeClick = () => {
    if (selectedRecipe) {
      navigate(`/recipes/${selectedRecipe.id}`);
    }
  };

  if (recipes.length === 0) {
    return (
      <div className="recipe-wheel-page">
        <h1>Recipe Wheel</h1>
        <p className="no-recipes">You need at least one recipe to spin the wheel!</p>
      </div>
    );
  }

  const segmentAngle = 360 / recipes.length;

  return (
    <div className="recipe-wheel-page">
      <h1 className="wheel-title">Recipe Wheel</h1>
      
      <div className="wheel-container">
        {/* Indicator Pointer - Simple black triangle */}
        <div className="wheel-pointer">
          ▼
        </div>

        {/* The Wheel */}
        <svg
          className="wheel"
          viewBox="0 0 400 400"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {recipes.map((recipe, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 200 + 180 * Math.cos(startRad);
            const y1 = 200 + 180 * Math.sin(startRad);
            const x2 = 200 + 180 * Math.cos(endRad);
            const y2 = 200 + 180 * Math.sin(endRad);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const pathData = [
              `M 200,200`,
              `L ${x1},${y1}`,
              `A 180,180 0 ${largeArcFlag},1 ${x2},${y2}`,
              `Z`,
            ].join(" ");

            const colors = [
              "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
              "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
              "#F8B739", "#52B788", "#E07A5F", "#81B29A"
            ];

            return (
              <g key={recipe.id}>
                <path
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                  className="wheel-segment"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    opacity: hoveredIndex === index ? 0.8 : 1,
                    cursor: "pointer",
                  }}
                />
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx="200" cy="200" r="30" fill="white" stroke="#333" strokeWidth="3" />
        </svg>

        {/* Hover tooltip */}
        {hoveredIndex !== null && (
          <div className="recipe-tooltip">
            {recipes[hoveredIndex].title}
            {recipes[hoveredIndex].favorite && " 🍪"}
          </div>
        )}
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="spin-button"
      >
        {isSpinning ? "spinning..." : "Spin the WHEEL!"}
      </button>

      {/* Selected Recipe */}
      {selectedRecipe && !isSpinning && (
        <div className="selected-recipe">
          <h2>You got: {selectedRecipe.title}!</h2>
          <button onClick={handleRecipeClick} className="view-recipe-button">
            View Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeWheel;