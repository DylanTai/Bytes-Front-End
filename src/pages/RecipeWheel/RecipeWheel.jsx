import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import * as recipeService from "../../services/recipeService.js";
import "./RecipeWheel.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";

const RecipeWheel = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const animationRef = useRef(null);
  const spinVelocityRef = useRef(0);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await recipeService.getRecipes();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Filter recipes based on favorites checkbox
  const displayedRecipes = showFavoritesOnly 
    ? recipes.filter(recipe => recipe.favorite)
    : recipes;

  // Slow idle rotation (only if hasn't spun yet)
  useEffect(() => {
    if (!isSpinning && !hasSpun && displayedRecipes.length > 0) {
      const idleRotate = setInterval(() => {
        setRotation((prev) => (prev + 0.1) % 360);
      }, 50);
      return () => clearInterval(idleRotate);
    }
  }, [isSpinning, hasSpun, displayedRecipes.length]);

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
          const segmentAngle = 360 / displayedRecipes.length;
          const selectedIndex = Math.floor(normalizedRotation / segmentAngle);
          setSelectedRecipe(displayedRecipes[selectedIndex]);
        }
      };
      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isSpinning, rotation, displayedRecipes]);

  const handleSpin = () => {
    if (isSpinning || displayedRecipes.length === 0) return;
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

  if (loading) {
    return <LoadingAnimation />;
  }

  if (displayedRecipes.length === 0) {
    return (
      <div className="recipe-wheel-page">
        <h1 className="wheel-title">Recipe Wheel!</h1>
        
        <div className="favorites-filter">
          <label>
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="wheel-favorite-checkbox"
            />
            <span>Favorites Only 🍪</span>
          </label>
        </div>
        
        <p className="no-recipes">
          {showFavoritesOnly 
            ? "You have no favorite recipes! Mark some recipes as favorites to use this filter."
            : "You need at least one recipe to spin the wheel!"}
        </p>
      </div>
    );
  }

  const segmentAngle = 360 / displayedRecipes.length;

  return (
    <div className="recipe-wheel-page">
      <h1 className="wheel-title">Recipe Wheel</h1>

      {/* Favorites Filter */}
      <div className="favorites-filter-wheel">
        <label className="favorites-filter-label">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
          />
          <span>Favorites Only 🍪</span>
        </label>
      </div>
      
      <div className={`wheel-container ${selectedRecipe ? "blurred" : ""}`}>
        {/* Indicator Pointer */}
        <div className="wheel-pointer">▼</div>

        {/* The Wheel */}
        <svg
          className="wheel"
          viewBox="0 0 400 400"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {displayedRecipes.length === 1 ? (
            // Draw a full circle when there's only one recipe
            <>
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="#FF6B6B"
                stroke="white"
                strokeWidth="2"
                className="wheel-segment"
                onMouseEnter={() => setHoveredIndex(0)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => navigate(`/recipes/${displayedRecipes[0].id}`)}
                style={{ cursor: "pointer" }}
              />
              <text
                x="200"
                y="200"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {displayedRecipes[0].title}
              </text>
            </>
          ) : (
            displayedRecipes.map((recipe, index) => {
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

              // Calculate text position (midpoint of the segment)
              const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
              const textRadius = 120; // Distance from center for text
              const textX = 200 + textRadius * Math.cos(midAngle);
              const textY = 200 + textRadius * Math.sin(midAngle);

              // Calculate rotation for text to be readable
              const textRotation = (startAngle + endAngle) / 2;

              // Adjust max characters based on number of segments
              const maxChars = displayedRecipes.length <= 4 ? 12 :
                               displayedRecipes.length <= 6 ? 10 :
                               displayedRecipes.length <= 8 ? 8 : 6;

              // Adjust font size based on number of segments
              const fontSize = displayedRecipes.length <= 4 ? 12 :
                               displayedRecipes.length <= 6 ? 11 :
                               displayedRecipes.length <= 8 ? 10 : 9;

              const truncatedTitle = recipe.title.length > maxChars
                ? recipe.title.substring(0, maxChars) + '...'
                : recipe.title;

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
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    style={{
                      opacity: hoveredIndex === index ? 0.8 : 1,
                      cursor: "pointer",
                    }}
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={fontSize}
                    fontWeight="bold"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    style={{ pointerEvents: "none" }}
                  >
                    {truncatedTitle}
                  </text>
                </g>
              );
            })
          )}

          {/* Center circle */}
          <circle cx="200" cy="200" r="30" fill="white" stroke="#333" strokeWidth="3" />
        </svg>

        {/* Hover tooltip */}
        {hoveredIndex !== null && (
          <div className="recipe-tooltip">
            {displayedRecipes[hoveredIndex].title}
            {displayedRecipes[hoveredIndex].favorite && " 🍪"}
          </div>
        )}
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="spin-button"
      >
        {isSpinning ? "Spinning..." : "Spin!"}
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
