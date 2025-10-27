import { useEffect, useState } from "react";
import bluePan from "../../../assets/ConfettiImages/blue-pan.png";
import bread from "../../../assets/ConfettiImages/bread.png";
import broccoli from "../../../assets/ConfettiImages/broccoli.png";
import orange from "../../../assets/ConfettiImages/orange.png";
import redPot from "../../../assets/ConfettiImages/red-pot.png";
import skewers from "../../../assets/ConfettiImages/skewers.png";
import spoon from "../../../assets/ConfettiImages/wooden-spoon.png";
import "./ConfettiAnimation.css";

const images = [bluePan, bread, broccoli, orange, redPot, skewers, spoon];

const ConfettiAnimation = ({ numberOfPieces = 50, duration = 4000 }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const generatedConfetti = Array.from({ length: numberOfPieces }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 20 + Math.random() * 25,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      rotation: Math.random() * 360,
      image: images[Math.floor(Math.random() * images.length)],
    }));
    setConfettiPieces(generatedConfetti);

    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 1000); 
    const removeTimer = setTimeout(() => setConfettiPieces([]), duration);

    const timer = setTimeout(() => setConfettiPieces([]), duration);
    return () => {
        clearTimeout(fadeTimer)
        clearTimeout(removeTimer)
    };

  }, [numberOfPieces, duration]);

  return (
    <div className="confetti-wrapper">
      {confettiPieces.map((p) => (
        <img
          key={p.id}
          src={p.image}
          alt="confetti"
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;
