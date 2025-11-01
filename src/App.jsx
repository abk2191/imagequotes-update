import { useState, useEffect } from "react";

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchImage = async () => {
    try {
      setLoading(true);
      setError("");

      // Add cache-busting parameter to get a new image each time
      const timestamp = Date.now();
      const response = await fetch(
        `https://myproxy1.netlify.app/.netlify/functions/zenquotes-proxy?t=${timestamp}`
      );

      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();

      // Revoke previous URL to avoid memory leaks
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    // Create a temporary anchor element
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `inspirational-quote-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareToWhatsApp = () => {
    if (!imageUrl) return;

    // Create a temporary anchor element
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `inspirational-quote-${Date.now()}.jpg`;
    document.body.appendChild(a);

    // After a small delay, try to share via WhatsApp
    setTimeout(() => {
      try {
        // Create a Blob from the image URL
        fetch(imageUrl)
          .then((response) => response.blob())
          .then((blob) => {
            // Create a file from the blob
            const file = new File([blob], "inspirational-quote.jpg", {
              type: "image/jpeg",
            });

            // Check if the Web Share API is available
            if (navigator.share && navigator.canShare({ files: [file] })) {
              navigator
                .share({
                  files: [file],
                  title: "Inspirational Quote",
                  text: "Check out this inspirational quote!",
                })
                .catch((err) => {
                  console.error("Error sharing:", err);
                  // Fallback to WhatsApp URL scheme
                  window.open(
                    `whatsapp://send?text=Check out this inspirational quote! ${window.location.href}`,
                    "_blank"
                  );
                });
            } else {
              // Fallback to WhatsApp URL scheme
              window.open(
                `whatsapp://send?text=Check out this inspirational quote! ${window.location.href}`,
                "_blank"
              );
            }
          })
          .catch((err) => {
            console.error("Error creating share file:", err);
            // Final fallback
            window.open(
              `whatsapp://send?text=Check out this inspirational quote! ${window.location.href}`,
              "_blank"
            );
          });
      } catch (err) {
        console.error("Error sharing to WhatsApp:", err);
        // Final fallback
        window.open(
          `whatsapp://send?text=Check out this inspirational quote! ${window.location.href}`,
          "_blank"
        );
      }
    }, 100);

    document.body.removeChild(a);
  };

  useEffect(() => {
    fetchImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, []);

  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "20px",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

        color: "#333",
      }}
    >
      {/* Show loading or error messages inside the container, not instead of it */}
      <div style={{ height: "400px" }}>
        {loading && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#667eea",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "3px solid rgba(102, 126, 234, 0.3)",
                borderTop: "3px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px",
              }}
            ></div>
            <p style={{ fontSize: "1.2rem", margin: 0 }}>
              Loading your inspiration...
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "20px",
              color: "#e74c3c",
              backgroundColor: "#ffeded",
              borderRadius: "10px",
              margin: "20px 0",
              border: "1px solid #ffcccb",
            }}
          >
            Error: {error}
          </div>
        )}

        <div
          className="qimage-div"
          style={{
            margin: "20px 0",
            maxHeight: "450px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!loading && !error && imageUrl && (
            <img
              className="qimage"
              src={imageUrl}
              alt="Inspirational quote"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                border: "none",
              }}
              onError={() => setError("Image failed to load")}
            />
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          border: "1px solid transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button onClick={fetchImage} className="new-quote-button">
              New Quote
            </button>

            <button onClick={downloadImage} className="download-button">
              Download
            </button>
          </div>

          <button
            onClick={shareToWhatsApp}
            className="share-on-whatsapp-button"
          >
            WhatsApp
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
    
        `}
      </style>
    </div>
  );
}

export default App;
