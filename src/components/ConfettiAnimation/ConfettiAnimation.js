import "./ConfettiAnimation.css"

const ConfettiAnimation = ({ numberOfPieces = 50 }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: numberOfPieces }).map(() => ({
      id: Math.random().toString(36).slice(2, 11),
      left: Math.random() * 100, 
      backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
      rotation: Math.random() * 360,
      delay: Math.random() * 2, // convert into seconds
      size: Math.random() * 8 + 4, // convert to pixels
    }));
    setConfettiPieces(pieces);
  }, [numberOfPieces]);

  return (
    <div className="confetti-wrapper">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.backgroundColor,
            width: `${piece.size}px`,
            height: `${piece.size * 0.4}px`,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;