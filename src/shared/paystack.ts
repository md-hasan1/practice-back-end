import axios from "axios";

const PAYSTACK_SECRET_KEY = "sk_test_18385d3de2b44b7bb058fe29ee222f91781a9c0a"; // Replace with your secret key

async function createSubaccountAndProcessPayment() {
  try {
    // // Step 1: Create Subaccount for Driver
    // const subaccountData = {
    //   business_name: "Driver John Doe",
    //   bank_code: "044", // Example: Access Bank
    //   account_number: "1234567890",
    //   percentage_charge: 20, // Admin takes 20%, driver gets 80%
    // };

    // const subaccountResponse = await axios.post(
    //   "https://api.paystack.co/subaccount",
    //   subaccountData,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );



    // if (!subaccountResponse.data.status) {
    //   console.log("❌ Failed to create subaccount:", subaccountResponse.data);
    //   return;
    // }

    // const subaccountCode = subaccountResponse.data.data.subaccount_code;
    // console.log("✅ Subaccount created:", subaccountCode);

    // Step 2: Initialize Split Payment
    const transactionData = {
      email: "mdhasan26096@gmail.com",
      amount: 200, // Increase to 20,000 kobo (ZAR 200.00 or NGN 200.00) for testing
      currency: "NGN", // Switch to NGN for Paystack test environment
      subaccount: "ACCT_mnx97eg1pqfs2pn", // Use dynamic or hardcoded subaccount
      transaction_charge: 20, // Flat charge in kobo (e.g., NGN 20.00)
      bearer: "subaccount", // Charges deducted from subaccount
    };

    const transactionResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      transactionData,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!transactionResponse.data.status) {
      console.log("❌ Failed to initialize transaction:", transactionResponse.data);
      return;
    }

    console.log("✅ Payment initialized:", transactionResponse.data.data.authorization_url);

    // Step 3: Verify Payment
    const reference = transactionResponse.data.data.reference;

    console.log("🔄 Waiting for payment verification...");
    await new Promise(resolve => setTimeout(resolve, 15000)); // Simulate delay

    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (verifyResponse.data.data.status === "success") {
      console.log("✅ Payment successful:", verifyResponse.data.data);
    } else {
      console.log("❌ Payment failed:", verifyResponse.data.data);
    }
  } catch (error:any) {
    console.error("🚨 Error:", error.response?.data || error.message);
  }
}

// Run the function
// createSubaccountAndProcessPayment();

