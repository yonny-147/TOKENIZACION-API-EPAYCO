/* #Tarjeta de pruebas
Número: 4575623182290326
Fecha Expiración: 12/2025
CVV: 123 */
const apiUrl = "https://apify.epayco.co";
const publicKey = '25bd67a9d26a7c74c410c7707db652fd'
const privateKey = '0d03d6facb8df947a0ddd5b7608dca7c'

function formatCardNumber(value) {
  // Elimina cualquier carácter no numérico
  const numericValue = value.replace(/\D/g, "");

  // Aplica formato de tarjeta de crédito
  const formattedValue = numericValue.replace(/(\d{4})(?=\d)/g, "$1 ");

  return formattedValue.trim();
}

async function loginAndCreateCardToken(cardNumber, expYear, expMonth, cvv) {
  // Generar token de login
  const token = btoa(`${publicKey}:${privateKey}`);

  try {
    // Realizar login
    const loginResponse = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
      },
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(loginData.message || 'Error al iniciar sesión');
    }

    // Guardar el token en localStorage
    localStorage.setItem('authToken', loginData.token);
    const authToken = loginData.token;

    // Crear token de la tarjeta
    const cardResponse = await fetch(`${apiUrl}/token/card`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardExpYear: expYear,
        cardExpMonth: expMonth,
        cardCvc: cvv,
      }),
    });

    const cardData = await cardResponse.json();
    if (cardResponse.ok) {
      return cardData.data.id;
    } else {
      throw new Error(cardData.message || "Error al crear el token de tarjeta");
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

// Función general de tokenización
document.addEventListener("DOMContentLoaded", () => {
  const cardNumberInput = document.getElementById("card-number");

  cardNumberInput.addEventListener("input", (event) => {
    const formattedValue = formatCardNumber(event.target.value);
    event.target.value = formattedValue;
  });

  document.getElementById("token-button").addEventListener("click", async () => {
    try {
      const cardNumber = cardNumberInput.value.replace(/\s/g, "");
      const expirationMonth = document.getElementById("expiration-month").value;
      const expirationYear = document.getElementById("expiration-year").value;
      const cvv = document.getElementById("cvv").value;

      // Login y crear token de la tarjeta
      const cardTokenId = await loginAndCreateCardToken(cardNumber, expirationYear, expirationMonth, cvv);
      alert("Token de tarjeta creado: " + cardTokenId);
    } catch (error) {
      console.error("Error al crear el token de tarjeta:", error);
    }
  });
});