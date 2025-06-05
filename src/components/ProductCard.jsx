import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import Razorpay from "razorpay";
import { useState } from "react";

export default function ProductCard() {
    const [amount] = useState(350);
    const currency = "INR";

    const loadScript = (src) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => {
            resolve(true);
          };
          script.onerror = () => {
            resolve(false);
          };
          document.body.appendChild(script);
        });
      };
    
    const handlePayment = async (e) => {
        const res = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
          );
      
          if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
          }
        try {
            const res = await fetch(`http://localhost:4000/api/payment/order`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    amount,
                    currency: currency?.toUpperCase()
                })
            });
            const data = await res.json();
    
            if (data?.success) {
    
                const options = {
                    key: data?.key_id, 
                    amount: amount * 100,  
                    currency: currency,
                    name: "Beautif.Ai",
                    description: "Purchase of Beautif.Ai AI service",
                    image: "",  
                    order_id: data?.orderData?.id,  
                    handler: async (response) => {
                      console.log("Payment successful, processing response...");
                      const body = { ...response };
                      const validatePayment = await fetch(`http://localhost:4000/api/payment/verify-order`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      });
                  
                      const jsonResponse = await validatePayment?.json();
                      console.log("Payment verification response:", jsonResponse);
                    },
                    prefill: {
                      name: "Shailesh Maurya",
                      email: "shailesh.example@gmail.com",
                      contact: "6204918454",
                    },
                    notes: {
                      address: "India",
                    },
                    theme: {
                      color: "#158993",
                    },
                  };
                  
                  if (typeof Razorpay === "function") {
                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();
                  } else {
                    console.error("Razorpay script not loaded correctly.");
                  }
                  
                e.preventDefault();  // Preventing default form submission
            } else {
                console.error("Payment order creation failed:", data?.message);
                alert(data?.message);  // Show the error message from the backend
            }
        } catch (error) {
            console.error("Error occurred during payment process:", error);
        }
    };
    

    return (
        <Card className="mt-6 w-96 bg-[#222f3e] text-white">
            {/* CardHeader */}
            <CardHeader color="" className="relative h-96 bg-[#2C3A47]">
                {/* Image  */}
                <img
                    src="https://codeswear.nyc3.cdn.digitaloceanspaces.com/tshirts/pack-of-five-plain-tshirt-white/1.webp"
                    alt="card-image"
                />
            </CardHeader>

            {/* CardBody */}
            <CardBody>
                {/* Typography For Title */}
                <Typography variant="h5" className="mb-2">
                    My First Product
                </Typography>

                {/* Typography For Price  */}
                <Typography>
                    ₹{amount} <span className=" line-through">₹699</span>
                </Typography>
            </CardBody>

            {/* CardFooter  */}
            <CardFooter className="pt-0">
                {/* Buy Now Button  */}
                <Button className="w-full bg-[#1B9CFC]" onClick={handlePayment}>Buy Now</Button>
            </CardFooter>
        </Card>
    );
}
