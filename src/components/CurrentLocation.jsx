import { useState } from "react";

export default function CurrentLocation() {
  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const checkPincode = async () => {
    setLocation(null);
    setError("");

    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit PIN code");
      return;
    }

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const result = await response.json();

      if (result[0]?.Status !== "Success") {
        setError("PIN code not found");
        return;
      }

      const office = result[0].PostOffice[0];
      console.log(office);

      setLocation({
        office: office.Name,
        district: office.District,
        state: office.State,
      });
    } catch {
      setError("Unable to fetch location. Try again.");
    }
  };

  return (
    <div>
      <input
        value={pincode}
        maxLength={6}
        placeholder="Enter PIN code"
        onChange={(e) =>
          setPincode(e.target.value.replace(/\D/g, ""))
        }
      />

      <button onClick={checkPincode}>
        Check Location
      </button>

      {error && <p>{error}</p>}

      {location && (
        <div>
          <p>Post Office: {location.office}</p>
          <p>District: {location.district}</p>
          <p>State: {location.state}</p>
        </div>
      )}
    </div>
  );
}